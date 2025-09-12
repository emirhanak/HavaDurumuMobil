// src/services/blend.ts
import { BLEND_BASE } from "../config";

export type TimelineItem = {
  time: string;
  code: number;
  temp: { api: number | null; ai: number | null; delta: number | null };
  rhum: { api: number | null; ai: number | null; delta: number | null };
  pres: { api: number | null; ai: number | null; delta: number | null };
  wspd: { api: number | null; ai: number | null; delta: number | null };
  prcp: { api: number | null; ai: number | null; delta: number | null };
};

export type BlendResponse = {
  city: string;
  lat: number;
  lon: number;
  tz: string;
  anchor: string;
  window_hours: number;
  plus_hours: number;
  reg_mode: string;
  api_ok: boolean;
  models: Record<string, string>;
  timeline: TimelineItem[];
};

export async function fetchBlend(params: {
  city: string;
  lat: number;
  lon: number;
  plus_hours?: number;
  reg_mode?: string;
}): Promise<BlendResponse> {
  const p = new URLSearchParams({
    city: params.city,
    lat: String(params.lat),
    lon: String(params.lon),
    plus_hours: String(params.plus_hours ?? 6),
    reg_mode: params.reg_mode ?? "auto",
  });
  const url = `${BLEND_BASE}/blend?${p.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}: ${txt}`);
  }
  return res.json();
}
