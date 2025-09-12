# -*- coding: utf-8 -*-
"""
Blend API (Tomorrow Forecast + AI)
- window_hours = 30 (anchor .. anchor+29)
- AI window     = anchor+24 .. anchor+29 (25–30. saat)
- İlk 24 saatte tüm değişkenlerde ai=null, delta=null
- 25–30. saatte (varsa) ai dolu, delta = ai - api
- Rüzgâr (wspd) JSON'da m/s tutulur (Tomorrow m/s gelir, AI km/sa ise m/s'e çevrilir)
"""

import os
import pickle
from datetime import datetime, timedelta
from typing import Dict, Optional, List

import pandas as pd
import numpy as np
import requests
from fastapi import FastAPI, HTTPException, Query

# .env (opsiyonel)
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

# --- Zaman dilimi (Europe/Istanbul) ---
try:
    from zoneinfo import ZoneInfo  # py>=3.9
    IST = ZoneInfo("Europe/Istanbul")
except Exception:
    import pytz  # type: ignore
    IST = pytz.timezone("Europe/Istanbul")

APP_TZ_NAME = "Europe/Istanbul"

# --- Config ---
MODELS_DIR = os.path.join(os.getcwd(), "models")
TOMORROW_API_KEY = os.getenv("TOMORROW_API_KEY", "")  # v4 Weather API (Forecast)
TOMORROW_URL_FORECAST = "https://api.tomorrow.io/v4/weather/forecast"

# Değişken seti (JSON'da bu isimlerle döneceğiz)
VARS = ["temp", "rhum", "pres", "wspd", "prcp"]

# Tomorrow alan eşleşmeleri (bilgi amaçlı)
TOMORROW_FIELDS = [
    "temperature", "humidity", "pressureSeaLevel", "windSpeed",
    "precipitationIntensity", "weatherCode"
]
VAR2FIELD = {
    "temp": "temperature",
    "rhum": "humidity",
    "pres": "pressureSeaLevel",
    "wspd": "windSpeed",                # Tomorrow: m/s
    "prcp": "precipitationIntensity",
    "code": "weatherCode",
}

# --- FastAPI ---
app = FastAPI(title="Blend API (Tomorrow Forecast + AI)", version="1.0.0")


# =========================
# Yardımcılar
# =========================
def now_anchor_ist() -> datetime:
    """IST'te şu anı saat başı (tz-naive) ver."""
    n = datetime.now(IST).replace(minute=0, second=0, microsecond=0)
    return n.astimezone(IST).replace(tzinfo=None)


def to_ist_naive(dt: datetime) -> datetime:
    """TS'yi IST'ye çevirip tz-naive döndür."""
    if dt.tzinfo is None:
        return dt
    return dt.astimezone(IST).replace(tzinfo=None)


def model_path(var: str, city: str) -> Optional[str]:
    """Model dosya yolu (temp için regresörlü varsa öncelik)."""
    c = city.lower()
    if var == "temp":
        p_reg = os.path.join(MODELS_DIR, f"temp_reg_model_{c}.pkl")
        if os.path.isfile(p_reg):
            return p_reg
        p_plain = os.path.join(MODELS_DIR, f"temp_model_{c}.pkl")
        return p_plain if os.path.isfile(p_plain) else None
    else:
        p = os.path.join(MODELS_DIR, f"{var}_model_{c}.pkl")
        return p if os.path.isfile(p) else None


_MODEL_CACHE: Dict[str, object] = {}


def load_any_model(path: str):
    """pkl yükle ve cache'le."""
    if path in _MODEL_CACHE:
        return _MODEL_CACHE[path]
    with open(path, "rb") as f:
        obj = pickle.load(f)
    _MODEL_CACHE[path] = obj
    return obj


def unwrap_prophet(obj):
    """
    Eğitimde bazen {'model': Prophet, 'reg_cols': [...]} kaydedildi,
    bazen direkt Prophet. İkisini de destekle.
    """
    if isinstance(obj, dict) and "model" in obj:
        return obj["model"], obj
    else:
        return obj, {}


def _normalize_df_time_hour(df: pd.DataFrame, col: str = "time") -> pd.DataFrame:
    """time kolonu tz-naive ve saat başına yuvarlanmış olsun."""
    df[col] = pd.to_datetime(df[col], errors="coerce")
    try:
        df[col] = df[col].dt.tz_localize(None)  # tz-aware ise naive'e çevir
    except Exception:
        pass
    df[col] = df[col].dt.floor("H")
    df[col] = df[col].dt.to_pydatetime()
    return df


def _clamp(v, lo, hi):
    try:
        return None if v is None else max(lo, min(hi, float(v)))
    except Exception:
        return None


def _maybe_kmh_to_ms(series_like) -> List[Optional[float]]:
    """
    AI rüzgârı km/sa üretmişse m/s'e çevir. Basit bir heuristik:
    - Değerler genel olarak 25'in çok üzerindeyse km/sa olabilir (ör. 30–50).
    - Ancak tek tek satır bazında da > 40 gibi çok büyük değerler km/sa'ya işaret eder.
    Bu yüzden ikili strateji:
      1) Ortalama > 25 ise tümünü /3.6
      2) Aksi halde tekil değerlerde > 40 olanları /3.6
    """
    vals = list(series_like)
    # Filtre: None olmayanları al
    finite = [float(x) for x in vals if x is not None]
    if not finite:
        return vals

    mean_v = sum(finite) / len(finite)
    out = []
    if mean_v > 25:  # muhtemelen km/sa
        for v in vals:
            out.append(None if v is None else float(v) / 3.6)
        return out

    # Ortalama normal; tekil aşırı yüksekleri çevir
    for v in vals:
        if v is None:
            out.append(None)
        else:
            fv = float(v)
            out.append(fv / 3.6 if fv > 40 else fv)
    return out


# =========================
# Tomorrow Forecast (v4)
# =========================
def parse_tomorrow_response_to_df(data):
    """
    Tomorrow v4 JSON'u saatlik timeline'a parse edilir.
    Birimler:
    - temperature: °C
    - humidity: %
    - pressureSeaLevel: hPa
    - windSpeed: m/s  (JSON'da m/s tutacağız → burada dönüştürmeyiz)
    - precipitationIntensity: mm/h
    - weatherCode: int
    """
    hourly = (data.get("timelines") or {}).get("hourly") or []
    rows = []
    for it in hourly:
        ts = datetime.fromisoformat(it["time"].replace("Z", "+00:00")).astimezone(IST).replace(tzinfo=None)
        v = it.get("values", {})

        # yağış: precipitationIntensity yoksa rainIntensity'yi kullan
        prcp = v.get("precipitationIntensity")
        if prcp is None:
            prcp = v.get("rainIntensity")

        rows.append({
            "time": ts,
            "temp": v.get("temperature"),
            "rhum": v.get("humidity"),
            "pres": v.get("pressureSeaLevel"),
            "wspd": (None if v.get("windSpeed") is None else float(v["windSpeed"])),  # m/s OLARAK bırak
            "prcp": prcp,
            "code": v.get("weatherCode"),
        })
    return pd.DataFrame(rows).sort_values("time").reset_index(drop=True)


def fetch_tomorrow_forecast(lat: float, lon: float) -> pd.DataFrame:
    """Tomorrow v4 /weather/forecast (1h) – CURL ile aynı minimal çağrı."""
    if not TOMORROW_API_KEY:
        raise HTTPException(status_code=500, detail="TOMORROW_API_KEY set edilmemiş.")

    url = TOMORROW_URL_FORECAST
    headers = {
        "apikey": TOMORROW_API_KEY,   # Sadece bu!
    }
    params = {
        "location": f"{lat},{lon}",
        "timesteps": "1h",
        "units": "metric",
        # 'fields' göndermiyoruz; free planda sorun çıkarabiliyor.
    }

    r = requests.get(url, params=params, headers=headers, timeout=25)
    if r.status_code == 401:
        raise HTTPException(status_code=502, detail="Tomorrow API 401 (Invalid Auth).")
    try:
        r.raise_for_status()
        data = r.json()
    except Exception as e:
        txt = (r.text or str(e))[:400]
        raise HTTPException(status_code=502, detail=f"Tomorrow API hata: {txt}")

    df = parse_tomorrow_response_to_df(data)
    return df


# =========================
# AI Saatleri & Tahminleri
# =========================
def build_ai_times(anchor: datetime, plus_hours: int) -> List[datetime]:
    """
    AI penceresi: anchor + 24 .. anchor + 24 + (plus_hours-1)
    Örn: plus_hours=6 -> anchor+24 .. anchor+29
    """
    base = to_ist_naive(anchor) + timedelta(hours=24)
    return [
        (base + timedelta(hours=h)).replace(minute=0, second=0, microsecond=0)
        for h in range(0, plus_hours)
    ]


def predict_other_var(city: str, var: str, times: List[datetime]) -> Optional[pd.DataFrame]:
    """
    Nem/basınç/rüzgâr/yağış için {var}_model_{city}.pkl varsa,
    verilen saatlerde Prophet ile yhat üretir. -> DataFrame[time, var]
    """
    path = model_path(var, city)
    if not path:
        return None
    try:
        obj = load_any_model(path)
        prophet, _meta = unwrap_prophet(obj)
        future = pd.DataFrame({"ds": times})
        yhat = prophet.predict(future)["yhat"].values
        out = pd.DataFrame({"time": times, var: yhat})
        out = _normalize_df_time_hour(out, "time")

        # Normalizasyonlar
        if var == "rhum":
            out[var] = [_clamp(x, 0, 100) for x in out[var].tolist()]
        elif var == "wspd":
            # Model km/sa üretmiş olabilir → m/s'e çevir
            out[var] = _maybe_kmh_to_ms(out[var].tolist())

        return out
    except Exception as e:
        print(f"[Uyarı] {city}/{var} AI tahmin hatası: {e}")
        return None


def predict_temp(city: str, times: List[datetime], df_regs_or_api: pd.DataFrame) -> Optional[pd.DataFrame]:
    """
    Sıcaklık: temp_reg_model_{city}.pkl (varsa) yoksa temp_model_{city}.pkl
    Regresörlüde df_regs_or_api içinden rhum/pres/wspd/prcp beslenir.
    """
    path = model_path("temp", city)
    if not path:
        return None
    try:
        obj = load_any_model(path)
        prophet, meta = unwrap_prophet(obj)
        reg_cols = meta.get("reg_cols", []) if isinstance(meta, dict) else []

        if reg_cols:
            need_cols = ["time"] + reg_cols
            df_regs = df_regs_or_api[need_cols].copy()
            df_regs = df_regs.rename(columns={"time": "ds"})
            drop_mask = df_regs[reg_cols].isna().any(axis=1)
            if drop_mask.any():
                df_regs = df_regs.loc[~drop_mask].reset_index(drop=True)
            if df_regs.empty:
                return None
            yhat = prophet.predict(df_regs)["yhat"].values
            out = pd.DataFrame({"time": df_regs["ds"].tolist(), "temp": yhat})
            out = _normalize_df_time_hour(out, "time")
            if len(out) < len(times):
                out = pd.DataFrame({"time": times}).merge(out, on="time", how="left")
            return out
        else:
            future = pd.DataFrame({"ds": times})
            yhat = prophet.predict(future)["yhat"].values
            out = pd.DataFrame({"time": times, "temp": yhat})
            out = _normalize_df_time_hour(out, "time")
            return out
    except Exception as e:
        print(f"[Uyarı] {city}/temp AI tahmin hatası: {e}")
        return None


# =========================
# API Endpoints
# =========================
@app.get("/_authcheck")
def _authcheck():
    """Ortam değişkeni içeriden görünüyor mu?"""
    return {"env_len": len(os.getenv("TOMORROW_API_KEY", ""))}


@app.get("/blend")
def blend(
    city: str = Query(..., description="Dosya adlarındaki şehir (örn: Duzce, Sanliurfa, Kirikkale)"),
    lat: float = Query(..., description="Enlem"),
    lon: float = Query(..., description="Boylam"),
    plus_hours: int = Query(6, ge=1, le=12, description="AI overlay saat sayısı"),
    reg_mode: str = Query("auto", description='Regresör kaynağı: "ai" | "api" | "auto"')
):
    """
    30 saatlik timeline:
      - İlk 24 saat: yalnız API (Tomorrow)
      - Son 6 saat: API + AI (varsa), delta = ai - api
    Sıcaklıkta varsa regresörlü model kullanılır; yoksa plain.
    reg_mode:
      - "api"  : regresörler Tomorrow forecast'tan gelir (401 olursa hata verir)
      - "ai"   : regresörler kendi AI modellerinden gelir (Tomorrow kullanılmaz)
      - "auto" : Tomorrow çalışırsa "api", çalışmazsa "ai"
    """
    # 1) Zaman penceresi
    anchor = now_anchor_ist()
    start = anchor
    end = start + timedelta(hours=30)  # 30 saatlik pencere
    ai_times = build_ai_times(anchor, plus_hours)  # anchor+24 .. +29
    print("anchor:", anchor, "| ai_times[0..2]:", ai_times[:3], "| last:", ai_times[-1:])

    # 2) Forecast (yalnız Tomorrow; 401 varsa auto modda AI'ye düşer)
    api_ok = False
    df_api = pd.DataFrame(columns=["time", "temp", "rhum", "pres", "wspd", "prcp", "code"])
    if reg_mode in ("api", "auto"):
        try:
            df_fc = fetch_tomorrow_forecast(lat, lon)
            df_api = df_fc[(df_fc["time"] >= start) & (df_fc["time"] < end)].reset_index(drop=True)
            api_ok = True
        except Exception as e:
            if reg_mode == "api":
                raise
            print("[Tomorrow] Hata fakat reg_mode=auto, AI'ye düşüyoruz:", e)
            api_ok = False

    # 3) AI (nem/basınç/rüzgâr/yağış)
    ai_others: Dict[str, Optional[pd.DataFrame]] = {}
    for var in ["rhum", "pres", "wspd", "prcp"]:
        ai_others[var] = predict_other_var(city, var, ai_times)
    for var, df in ai_others.items():
        print("[AI]", var, "None?", df is None, "len=", (0 if df is None else len(df)))
        if df is not None:
            print("   times sample:", df["time"][:3])

    # 4) Sıcaklığın regresör kaynağı
    if api_ok and reg_mode in ("api", "auto"):
        # AI temp'e verilecek regresörler Tomorrow'dan
        df_regs = pd.DataFrame({"time": ai_times}).merge(df_api, on="time", how="left")
    else:
        # Tomorrow yoksa ya da reg_mode="ai" ise: diğer AI modellerinden regresörleri topla
        df_regs = pd.DataFrame({"time": ai_times})
        for var in ["rhum", "pres", "wspd", "prcp"]:
            if ai_others[var] is not None:
                df_regs = df_regs.merge(ai_others[var], on="time", how="left")

    # 5) Sıcaklık (AI)
    ai_temp_df = predict_temp(city, ai_times, df_regs)
    print("[AI] temp None?", ai_temp_df is None, "len=", (0 if ai_temp_df is None else len(ai_temp_df)))
    if ai_temp_df is not None:
        print("   temp times sample:", ai_temp_df["time"][:3])

    # 6) Map'ler
    VARS_LOCAL = ["temp", "rhum", "pres", "wspd", "prcp"]

    ai_maps = {v: {} for v in VARS_LOCAL}
    if ai_temp_df is not None:
        ai_maps["temp"] = {t: v for t, v in zip(ai_temp_df["time"], ai_temp_df["temp"])}
    for var in ["rhum", "pres", "wspd", "prcp"]:
        if ai_others[var] is not None:
            ai_maps[var] = {t: v for t, v in zip(ai_others[var]["time"], ai_others[var][var])}

    api_maps = {v: {} for v in VARS_LOCAL}
    for var in VARS_LOCAL:
        if var in df_api.columns:
            api_maps[var] = {t: v for t, v in zip(df_api["time"], df_api[var])}
    code_map = {t: v for t, v in zip(df_api["time"], df_api.get("code", [None] * len(df_api)))}

    # 7) Timeline (30 saat)
    hours_list = pd.date_range(start=start, end=end - timedelta(seconds=1), freq="H")
    hours_list = [to_ist_naive(h.to_pydatetime()) for h in hours_list]

    timeline = []
    for ts in hours_list:
        row = {"time": ts.strftime("%Y-%m-%d %H:%M:%S"), "code": code_map.get(ts, None)}
        for var in VARS_LOCAL:
            api_val = api_maps.get(var, {}).get(ts, None)
            ai_val = ai_maps.get(var, {}).get(ts, None)

            # Normalizasyon (son güvenlik)
            if var == "rhum" and ai_val is not None:
                ai_val = _clamp(ai_val, 0, 100)
            if var == "wspd" and ai_val is not None:
                # Eğer AI tarafı km/sa gönderiyorsa m/s'e çevir
                try:
                    fv = float(ai_val)
                    if fv > 40:  # tekil uç vaka
                        ai_val = fv / 3.6
                except Exception:
                    pass

            delta = None
            if (ai_val is not None) and (api_val is not None):
                try:
                    delta = float(ai_val) - float(api_val)
                except Exception:
                    delta = None

            row[var] = {"api": api_val, "ai": ai_val, "delta": delta}
        timeline.append(row)

    # 8) Kullanılan modeller
    used_models = {"temp": None, "rhum": None, "pres": None, "wspd": None, "prcp": None}
    tp = model_path("temp", city)
    if tp:
        used_models["temp"] = os.path.basename(tp)
    for var in ["rhum", "pres", "wspd", "prcp"]:
        vp = model_path(var, city)
        if vp:
            used_models[var] = os.path.basename(vp)

    # 9) Çıktı
    return {
        "city": city,
        "lat": lat,
        "lon": lon,
        "tz": APP_TZ_NAME,
        "anchor": start.strftime("%Y-%m-%d %H:%M:%S"),
        "window_hours": 30,                # <-- 30 saat sabit
        "plus_hours": plus_hours,
        "reg_mode": reg_mode,
        "api_ok": api_ok,
        "models": used_models,
        "timeline": timeline,
    }


# --- Lokal çalıştırma ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("blend_predict:app", host="127.0.0.1", port=8100, reload=True)
