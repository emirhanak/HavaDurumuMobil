import { Platform } from "react-native";
import type { BlendResponse } from "@/types/blend";

// Geliştirmede taban URL (cihaza göre):
// - iOS Simulator: 127.0.0.1
// - Android Emulator (AVD): 10.0.2.2
// - Fiziksel cihaz: PC'nin LAN IP'si (örn 192.168.1.34)
const LOCAL_HOST =
  Platform.OS === "android" ? "http://10.0.2.2:8100" : "http://127.0.0.1:8100";

// Eğer fiziksel cihazla test ediyorsan şunu aç:
// const LOCAL_HOST = "http://192.168.1.34:8100"; // bilgisayar IP'ni yaz

export async function fetchBlend(params: {
  city: string;
  lat: number;
  lon: number;
  plus_hours?: number; // default 6
  reg_mode?: "auto" | "api" | "ai";
}): Promise<BlendResponse> {
  const { city, lat, lon, plus_hours = 6, reg_mode = "auto" } = params;
  const url = `${LOCAL_HOST}/blend?city=${encodeURIComponent(
    city
  )}&lat=${lat}&lon=${lon}&plus_hours=${plus_hours}&reg_mode=${reg_mode}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Blend hata: ${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as BlendResponse;
  if (!data || !Array.isArray(data.timeline) || data.window_hours !== 30) {
    throw new Error("Geçersiz /blend çıktısı (window_hours!=30 veya timeline yok)");
  }
  return data;
}
