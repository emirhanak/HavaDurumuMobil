import os, json, math, pickle, traceback
# ---- idk ----

from dotenv import load_dotenv, find_dotenv
import os

load_dotenv(find_dotenv(), override=True)  # aynı .env'yi yükler

API_BASE = os.getenv("API_BASE", "http://127.0.0.1:8100")
N8N_BASE = os.getenv("N8N_BASE", "http://127.0.0.1:5678")
N8N_TOKEN = os.getenv("N8N_TOKEN", "uzmar-secret-123")

# ---- idk ----

from typing import Optional, Dict, Tuple, List
from datetime import datetime, timedelta, timezone

import numpy as np
import pandas as pd
import requests
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# ---- ZAMAN DİLİMİ DESTEĞİ ----
try:
    from zoneinfo import ZoneInfo  # py>=3.9
except Exception:
    ZoneInfo = None

# ----------------- SABİTLER -----------------
MODELS_DIR = "./models"
UNITS = "metric"
DEFAULT_TZ = "Europe/Istanbul"
TOMORROW_API_KEY = os.getenv("TOMORROW_API_KEY", "")

# TEMP için fallback regressor seti (eğitimle aynı isimler olmalı)
REGRESSORS_TEMP = [
    "rhum","wspd","wpgt","pres","prcp","snow","coco",
    "wdir_sin","wdir_cos",
    "rhum_ma3","wspd_ma3","wpgt_ma3","pres_ma3"
]

# API isim haritası
VAR_MAP = {
    "temp": {"json_key": "sicaklik",   "model_suffix": "temp"},
    "rhum": {"json_key": "nem",        "model_suffix": "rhum"},
    "pres": {"json_key": "basinc",     "model_suffix": "pres"},
    "wspd": {"json_key": "ruzgarHizi", "model_suffix": "wspd"},
        "prcp": {"json_key": "yagis",      "model_suffix": "prcp"},  # ← eklendi

}

# ----------------- FASTAPI -----------------
app = FastAPI(title="HavaDurumu API (çok şehir, çok değişken)", version="1.3")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

# ----------------- CITY YÜKLEME -----------------
def load_cities() -> Dict[str, Dict[str, float]]:
    """
    cities.json varsa hem 'name' hem 'city' anahtarını destekler.
    Örn: {"city":"Duzce","lat":40.8333,"lon":31.15,"tz":"Europe/Istanbul"}
    """
    if os.path.exists("cities.json"):
        with open("cities.json","r",encoding="utf-8") as f:
            items = json.load(f)
        out = {}
        for c in items:
            title = c.get("name") or c.get("city")
            if not title:
                continue
            out[title] = {
                "lat": float(c["lat"]),
                "lon": float(c["lon"]),
                "tz": c.get("tz", DEFAULT_TZ)
            }
        if out:
            return out
    return {"Kocaeli": {"lat": 40.77, "lon": 29.94, "tz": DEFAULT_TZ}}

CITY_COORDS = load_cities()

# ----------------- MODEL YÜKLEME -----------------
_model_cache: Dict[str, object] = {}
_model_path_cache: Dict[str, str] = {}

def _slug_city(name: str) -> str:
    tr_map = str.maketrans({
        "ç":"c","ğ":"g","ı":"i","i":"i","ö":"o","ş":"s","ü":"u",
        "Ç":"c","Ğ":"g","İ":"i","I":"i","Ö":"o","Ş":"s","Ü":"u",
        "â":"a","ê":"e","î":"i","ô":"o","û":"u",
        " ": "_", "-": "_", ".":"", "'":""
    })
    return name.translate(tr_map).lower()

def _normalize_loaded_model(obj):
    """Model dict içinde saklandıysa çıkar."""
    if isinstance(obj, dict):
        for k in ["model", "prophet", "estimator", "mdl"]:
            if k in obj and obj[k] is not None:
                return obj[k]
    return obj

def _candidate_filenames(city: str, var: str) -> List[str]:
    suf = VAR_MAP[var]["model_suffix"]  # temp|rhum|pres|wspd
    slug = _slug_city(city)
    candidates: List[str] = []
    # Senin kalıbın
    if var == "temp":
        candidates.append(f"temp_reg_model_{slug}.pkl")
    else:
        candidates.append(f"{suf}_model_{slug}.pkl")
    # Geri uyum ihtimalleri
    candidates += [
        f"{city}_{suf}.pkl",
        f"{slug}_{suf}.pkl",
        f"{city.capitalize()}_{suf}.pkl",
    ]
    return candidates

def load_model(city: str, var: str):
    """Modeli yükle ve normalize et. Yüklenen dosya yolunu da cache'e yaz."""
    key = f"{city}|{var}"
    # cache
    for fname in _candidate_filenames(city, var):
        path = os.path.join(MODELS_DIR, fname)
        if os.path.exists(path):
            if path in _model_cache:
                _model_path_cache[key] = path
                return _model_cache[path]
            with open(path, "rb") as f:
                raw = pickle.load(f)
            m = _normalize_loaded_model(raw)
            _model_cache[path] = m
            _model_path_cache[key] = path
            return m
    # case-insensitive tarama (ilk aday)
    try:
        expected = _candidate_filenames(city, var)[0].lower()
        for fn in os.listdir(MODELS_DIR):
            if fn.lower() == expected:
                path = os.path.join(MODELS_DIR, fn)
                if path in _model_cache:
                    _model_path_cache[key] = path
                    return _model_cache[path]
                with open(path, "rb") as f:
                    raw = pickle.load(f)
                m = _normalize_loaded_model(raw)
                _model_cache[path] = m
                _model_path_cache[key] = path
                return m
    except FileNotFoundError:
        pass
    _model_path_cache[key] = ""
    return None

# ----------------- TOMORROW FETCH -----------------
def fetch_tomorrow(lat: float, lon: float, hours: int = 30) -> pd.DataFrame:
    if not TOMORROW_API_KEY:
        raise RuntimeError("TOMORROW_API_KEY ayarlanmadı.")
    now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    end = now + timedelta(hours=hours)
    url = "https://api.tomorrow.io/v4/timelines"
    payload = {
        "location": f"{lat},{lon}",
        "fields": [
            "temperature","humidity","pressureSurfaceLevel",
            "windSpeed","windGust","windDirection",
            "precipitationIntensity","snowAccumulation","weatherCode"
        ],
        "timesteps": ["1h"],
        "units": UNITS,
        "timezone": "UTC",
        "startTime": now.isoformat().replace("+00:00", "Z"),
        "endTime": end.isoformat().replace("+00:00", "Z")
    }
    headers = {"Content-Type":"application/json", "apikey": TOMORROW_API_KEY}
    r = requests.post(url, headers=headers, data=json.dumps(payload), timeout=25)
    if r.status_code != 200:
        raise RuntimeError(f"Tomorrow API HTTP: {r.status_code} {r.text[:200]}")
    data = r.json()
    intervals = data["data"]["timelines"][0]["intervals"]

    rows = []
    for it in intervals:
        t = pd.to_datetime(it["startTime"], utc=True).tz_localize(None)
        v = it["values"]
        wspd_kmh = float(v.get("windSpeed", 0.0)) * 3.6   # m/s → km/h
        wpgt_kmh = float(v.get("windGust", v.get("windSpeed", 0.0))) * 3.6
        wdir = float(v.get("windDirection", 0.0))
        wdir_sin = math.sin(math.radians(wdir))
        wdir_cos = math.cos(math.radians(wdir))

        rows.append({
            "ds": t,
            "temp": float(v.get("temperature")),
            "rhum": float(v.get("humidity")),
            "pres": float(v.get("pressureSurfaceLevel")),
            "wspd": wspd_kmh,
            "wpgt": wpgt_kmh,
            "prcp": float(v.get("precipitationIntensity", 0.0)),
            "snow": float(v.get("snowAccumulation", 0.0)),
            "coco": float(v.get("weatherCode", 0.0)),
            "wdir_sin": wdir_sin,
            "wdir_cos": wdir_cos,
        })
    df = pd.DataFrame(rows).sort_values("ds").reset_index(drop=True)
    for base, ma_col in [("rhum","rhum_ma3"),("wspd","wspd_ma3"),
                         ("wpgt","wpgt_ma3"),("pres","pres_ma3")]:
        df[ma_col] = df[base].rolling(3, min_periods=1).mean()
    return df

# ----------------- KALİBRASYON -----------------
def calibrate_temp(future_df: pd.DataFrame, fcst: pd.DataFrame) -> pd.DataFrame:
    """
    İlk 24 saatte resmi temp'e karşı yhat için doğrusal kalibrasyon (y ≈ a*yhat + b).
    Alt/üst aralıkları da aynı dönüşüme sokar.
    """
    out = fcst.copy()
    if "temp" not in future_df.columns or len(out) < 24 or len(future_df) < 24:
        out["yhat_cal"] = out.get("yhat", out["yhat"])
        if "yhat_lower" in out.columns:
            out["yhat_cal_lower"] = out["yhat_lower"]
        if "yhat_upper" in out.columns:
            out["yhat_cal_upper"] = out["yhat_upper"]
        return out

    y_true = future_df.iloc[:24]["temp"].astype(float).values
    y_hat  = out.iloc[:24]["yhat"].astype(float).values
    X = np.vstack([y_hat, np.ones_like(y_hat)]).T
    a, b = np.linalg.lstsq(X, y_true, rcond=None)[0]

    out["yhat_cal"] = a * out["yhat"].astype(float).values + b
    if "yhat_lower" in out.columns:
        out["yhat_cal_lower"] = a * out["yhat_lower"].astype(float).values + b
    if "yhat_upper" in out.columns:
        out["yhat_cal_upper"] = a * out["yhat_upper"].astype(float).values + b

    out.attrs["calibration"] = {"a": float(a), "b": float(b)}
    return out

# ----------------- FUTURE DF -----------------
def build_future_df_for_model(fut: pd.DataFrame, m, var: str) -> pd.DataFrame:
    """
    Prophet modelinin extra_regressors listesini modelden okuyup,
    Tomorrow kolonlarıyla kesişime göre future DF oluşturur.
    temp: çok değişkenli; rhum/pres/wspd: univariate varsayılır (['ds']).
    """
    if var != "temp":
        return fut[["ds"]].copy()

    extra = []
    if hasattr(m, "extra_regressors") and isinstance(m.extra_regressors, dict):
        extra = list(m.extra_regressors.keys())

    available = set(fut.columns.tolist())
    chosen = [c for c in extra if c in available]

    if chosen:
        cols = ["ds"] + chosen
    else:
        cols = ["ds"] + [c for c in REGRESSORS_TEMP if c in available]

    return fut[cols].copy()

# ----------------- YARDIMCI -----------------
def _anchor_local(tz_name: str) -> str:
    now_utc = datetime.now(timezone.utc).replace(microsecond=0, second=0)
    if ZoneInfo:
        try:
            return now_utc.astimezone(ZoneInfo(tz_name)).strftime("%Y-%m-%d %H:%M:%S")
        except Exception:
            pass
    return now_utc.strftime("%Y-%m-%d %H:%M:%S")

def _coords_for_request(city: str, lat_q: Optional[float], lon_q: Optional[float]) -> Tuple[float,float,str]:
    if lat_q is not None and lon_q is not None:
        tz = CITY_COORDS.get(city, {}).get("tz", DEFAULT_TZ)
        return float(lat_q), float(lon_q), tz
    if city not in CITY_COORDS:
        raise HTTPException(status_code=400, detail=f"{city} için koordinat yok.")
    info = CITY_COORDS[city]
    return float(info["lat"]), float(info["lon"]), info.get("tz", DEFAULT_TZ)

# ----------------- ENDPOINTS -----------------
@app.get("/health")
def health():
    return {"status":"ok","time":datetime.now(timezone.utc).isoformat()}

@app.get("/debug/model-info")
def debug_model_info(
    city: Optional[str] = Query("Kocaeli"),
    var: Optional[str]  = Query("temp")
):
    """Hangi dosyayı buldu, model tipi ne, regressors ne? Hızlı teşhis için."""
    m = load_model(city, var)
    key = f"{city}|{var}"
    path = _model_path_cache.get(key, "")
    info = {
        "city": city,
        "var": var,
        "loaded": m is not None,
        "model_path": path,
        "model_type": type(m).__name__ if m is not None else None,
        "has_extra_regressors": hasattr(m, "extra_regressors"),
        "extra_regressors": list(getattr(m, "extra_regressors", {}).keys()) if hasattr(m, "extra_regressors") else [],
    }
    return info

@app.get("/api/weather")
def api_weather(
    city: Optional[str] = Query("Kocaeli"),
    var: Optional[str]  = Query("temp")
):
    try:
        if var not in VAR_MAP:
            raise HTTPException(status_code=400, detail=f"Geçersiz var: {var}")

        coords = CITY_COORDS.get(city)
        if not coords:
            raise HTTPException(status_code=400, detail=f"{city} için koordinat yok.")

        fut = fetch_tomorrow(coords["lat"], coords["lon"], hours=30)

        # Resmi 24 saat
        resmi24 = []
        key = VAR_MAP[var]["json_key"]
        for i in range(min(24, len(fut))):
            r = fut.iloc[i]
            value = {"temp": r["temp"], "rhum": r["rhum"], "pres": r["pres"], "wspd": r["wspd"]}[var]
            resmi24.append({
                "isoTime": pd.to_datetime(r["ds"]).isoformat(),
                key: float(value)
            })

        # Model
        m = load_model(city, var)
        if m is None:
            return {
                "city": city, "var": var, "units": UNITS,
                "generatedAt": datetime.now(timezone.utc).isoformat(),
                "saatlikResmi24": resmi24,
                "ekYapayZeka6": [],
                "calibration": None
            }

        # Tahmin
        future_df = build_future_df_for_model(fut, m, var)
        fcst = m.predict(future_df)[["ds","yhat","yhat_lower","yhat_upper"]]
        if var == "temp":
            fcst = calibrate_temp(fut, fcst)

        ek6 = []
        if len(fcst) >= 30:
            for _, r in fcst.iloc[24:30].iterrows():
                item = {
                    "isoTime": pd.to_datetime(r["ds"]).isoformat(),
                    "yhat": float(r["yhat"]),
                }
                if "yhat_lower" in r:
                    item["yhat_lower"] = float(r["yhat_lower"])
                if "yhat_upper" in r:
                    item["yhat_upper"] = float(r["yhat_upper"])
                if "yhat_cal" in r:
                    item["yhat_cal"] = float(r["yhat_cal"])
                if "yhat_cal_lower" in r:
                    item["yhat_cal_lower"] = float(r["yhat_cal_lower"])
                if "yhat_cal_upper" in r:
                    item["yhat_cal_upper"] = float(r["yhat_cal_upper"])
                ek6.append(item)

        return {
            "city": city, "var": var, "units": UNITS,
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "saatlikResmi24": resmi24,
            "ekYapayZeka6": ek6,
            "calibration": getattr(fcst, "attrs", {}).get("calibration")
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
@app.get("/blend")
def blend(
    city: Optional[str] = Query("Kocaeli"),
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None),
    plus_hours: int = Query(6, ge=1, le=120),
    reg_mode: str = Query("auto"),
):
    """
    İSTENEN TEK JSON:
    - window_hours = 30 (24 resmi + plus_hours)
    - models: dosya adları
    - timeline: her saat için {time, code, temp/rhum/pres/wspd/prcp: {api, ai, delta}}
    - ai: ilk 24 saatte None, 24. saatten sonra tahmin (temp için kalibreli yhat_cal)
    - delta = ai - api (ai olmadığı yerde None)
    - time: yerel saat string "YYYY-MM-DD HH:00:00"
    """
    try:
        # 1) koordinatları belirle ve veriyi çek
        lat_s, lon_s, tz = _coords_for_request(city, lat, lon)
        window_hours = 24 + plus_hours
        fut = fetch_tomorrow(lat_s, lon_s, hours=window_hours)

        # 2) modelleri yükle (dosya adlarını da topluyoruz)
        vars_all = ["temp", "rhum", "pres", "wspd", "prcp"]
        models_loaded: Dict[str, object] = {}
        model_names: Dict[str, Optional[str]] = {}
        for v in vars_all:
            m = load_model(city, v)
            models_loaded[v] = m
            key = f"{city}|{v}"
            path = _model_path_cache.get(key, "") if "_model_path_cache" in globals() else ""
            model_names[v] = os.path.basename(path) if path else None

        # 3) tüm değişkenler için AI tahmin serilerini hazırla (ds -> value)
        # temp: çok değişkenli ve KALİBRELİ (yhat_cal), diğerleri: univariate (yhat)
        fcsts: Dict[str, pd.DataFrame] = {}
        for v in vars_all:
            m = models_loaded.get(v)
            if m is None:
                continue
            future_df = build_future_df_for_model(fut, m, v)
            df = m.predict(future_df)[["ds", "yhat"]].copy()
            if v == "temp":
                # kalibrasyon için ds,yhat_lower,yhat_upper da alalım ki ileride lazım olursa
                df_all = m.predict(future_df)
                keep = ["ds", "yhat"]
                if "yhat_lower" in df_all.columns: keep.append("yhat_lower")
                if "yhat_upper" in df_all.columns: keep.append("yhat_upper")
                df_all = df_all[keep].copy()
                df_all = calibrate_temp(fut, df_all)
                df_all.rename(columns={"yhat_cal": "yhat_cal"}, inplace=True)
                fcsts[v] = df_all  # ds,yhat,(yhat_lower, yhat_upper), yhat_cal
            else:
                fcsts[v] = df  # ds,yhat

        # 4) timeline (yerel saat string + code + api/ai/delta)
        def _to_local_str(ts_utc_naive) -> str:
            # fut['ds'] UTC-naive; yerel stringe çevir
            dt_utc = ts_utc_naive.replace(tzinfo=timezone.utc)
            try:
                return dt_utc.astimezone(ZoneInfo(tz)).strftime("%Y-%m-%d %H:%M:%S")
            except Exception:
                return dt_utc.strftime("%Y-%m-%d %H:%M:%S")

        timeline: List[Dict] = []
        horizon = min(window_hours, len(fut))
        for i in range(horizon):
            row = fut.iloc[i]
            t_local = _to_local_str(pd.to_datetime(row["ds"]))
            code = int(row.get("coco", 0))

            # API gerçekleri
            api_vals = {
                "temp": float(row["temp"]) if pd.notna(row["temp"]) else None,
                "rhum": float(row["rhum"]) if pd.notna(row["rhum"]) else None,
                "pres": float(row["pres"]) if pd.notna(row["pres"]) else None,
                # wspd API değeri km/h; JSON örneğinde sen m/sn gibi küçük sayılar görmüşsün.
                # İstersen burada km/h→m/s dönüştürebiliriz. Şimdilik KM/H aynen bırakıyorum.
                "wspd": float(row["wspd"]) if pd.notna(row["wspd"]) else None,
                "prcp": float(row["prcp"]) if pd.notna(row["prcp"]) else None,
            }

            # AI tahmini (yalnız 24. saatten itibaren)
            ai_vals: Dict[str, Optional[float]] = {k: None for k in api_vals.keys()}
            if i >= 24:
                for v in vars_all:
                    df = fcsts.get(v)
                    if df is None or i >= len(df):
                        continue
                    if v == "temp":
                        # kalibreli varsa onu kullan
                        y = df.iloc[i].get("yhat_cal", None)
                        if pd.notna(y):
                            ai_vals["temp"] = float(y)
                    else:
                        y = df.iloc[i].get("yhat", None)
                        if pd.notna(y):
                            ai_vals[v] = float(y)

            # delta = ai - api (ikisi de varsa)
            def _delta(ai, api):
                if ai is None or api is None:
                    return None
                try:
                    return float(ai - api)
                except Exception:
                    return None

            entry = {
                "time": t_local,
                "code": code,
                "temp": {
                    "api": api_vals["temp"],
                    "ai": ai_vals["temp"],
                    "delta": _delta(ai_vals["temp"], api_vals["temp"]),
                },
                "rhum": {
                    "api": api_vals["rhum"],
                    "ai": ai_vals["rhum"],
                    "delta": _delta(ai_vals["rhum"], api_vals["rhum"]),
                },
                "pres": {
                    "api": api_vals["pres"],
                    "ai": ai_vals["pres"],
                    "delta": _delta(ai_vals["pres"], api_vals["pres"]),
                },
                "wspd": {
                    "api": api_vals["wspd"],
                    "ai": ai_vals["wspd"],
                    "delta": _delta(ai_vals["wspd"], api_vals["wspd"]),
                },
                "prcp": {
                    "api": api_vals["prcp"],
                    "ai": ai_vals["prcp"],
                    "delta": _delta(ai_vals["prcp"], api_vals["prcp"]),
                },
            }
            timeline.append(entry)

        # 5) çıktı
        anchor_local = _anchor_local(tz)
        body = {
            "city": city,
            "lat": lat_s,
            "lon": lon_s,
            "tz": tz,
            "anchor": anchor_local,
            "window_hours": 30,        # ← örnekteki gibi sabit 30
            "plus_hours": plus_hours,
            "reg_mode": reg_mode,
            "api_ok": True,
            "models": {k: v for k, v in model_names.items() if v},  # sadece bulunanlar
            "timeline": timeline,
        }
        return body

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

