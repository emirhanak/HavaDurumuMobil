// hooks/useBlend.ts
import { useEffect, useState } from "react";
import Constants from "expo-constants";
import type { BlendResponse } from "@/types/blend";

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

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const url = `${BASE}/blend?city=${encodeURIComponent(city)}&lat=${lat}&lon=${lon}&plus_hours=6&reg_mode=auto`;
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(`blend ${res.status}`);
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
