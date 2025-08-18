// hooks/useBlend.ts
import { useEffect, useState } from "react";
import Constants from "expo-constants";
import type { BlendResponse } from "@/types/blend";

// küçük yardımcılar
const stripDiacritics = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const mapDistrictToProvince = (raw?: string) => {
  if (!raw) return undefined;
  const s = stripDiacritics(raw).toLowerCase();

  // burada ihtiyacına göre genişlet
  if (s.includes('basiskele')) return 'Kocaeli';
  if (s.includes('izmit'))     return 'Kocaeli';
  if (s.includes('gebze'))     return 'Kocaeli';
  if (s.includes('cayirova'))  return 'Kocaeli';
  // örnek: duzce zaten il
  if (s.includes('duzce'))     return 'Duzce';

  // eşleşme yoksa undefined dön -> city parametresini eklemeyiz
  return undefined;
};

function buildBaseUrl() {
  const env = process.env.EXPO_PUBLIC_BLEND_BASE_URL;
  if (env) return env.replace(/\/$/, "");
  const host =
    (Constants.expoConfig as any)?.hostUri ||
    (Constants as any)?.manifest?.debuggerHost ||
    (Constants as any)?.manifest2?.extra?.expoClient?.hostUri || "";
  const ip = host.split(":")[0];
  return ip ? `http://${ip}:8100` : "http://127.0.0.1:8100";
}

const BASE = buildBaseUrl();

export function useBlend(city: string, lat: number, lon: number) {
  const [data, setData] = useState<BlendResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Veri değiştiğinde loglama yapmak için bu useEffect'i buraya taşıdık.
  // Hook kurallarına uygun olarak en üst seviyede olmalı.
  useEffect(() => {
    if (data?.timeline?.length) {
      console.log("[BLEND OK] window_hours:", data.window_hours,
        "t0.api/ai:", data.timeline[0]?.temp?.api, data.timeline[0]?.temp?.ai,
        "t24.api/ai:", data.timeline[24]?.temp?.api, data.timeline[24]?.temp?.ai
      );
    }
  }, [data]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Yeni URL oluşturma mantığı
        const province = mapDistrictToProvince(city);
        const url = new URL(`${BASE}/mobile/blend`);
        url.searchParams.set('lat', String(lat));
        url.searchParams.set('lon', String(lon));
        url.searchParams.set('plus_hours', '6'); // Sabit 6 saat
        url.searchParams.set('reg_mode', 'auto'); // Sabit auto
        if (province) url.searchParams.set('city', province); // Sadece il varsa gönder

        console.log("📡 useBlend URL:", url.toString());

        const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
if (!res.ok) {
  const txt = await res.text().catch(() => "");
  throw new Error(`blend ${res.status} ${txt || ""}`.trim());
}
        const json = (await res.json()) as BlendResponse;
        if (!ignore) setData(json);
      } catch (e: any) {
        if (!ignore) setError(e);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [city, lat, lon]);
  console.log("[useBlend] BASE =", BASE, "req:", city, lat, lon);

  return { data, loading, error, baseUrl: BASE };

}
