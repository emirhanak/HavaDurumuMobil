export type MetricTriple = {
  api: number | null;
  ai: number | null;
  delta: number | null;
};

export type TimelineItem = {
  time: string; // "YYYY-MM-DD HH:mm:ss" (IST)
  code: number | null;
  temp: MetricTriple;
  rhum: MetricTriple;
  pres: MetricTriple;
  wspd: MetricTriple; // m/s
  prcp: MetricTriple; // mm
};

export type BlendResponse = {
  city: string;
  lat: number;
  lon: number;
  tz: string; // "Europe/Istanbul"
  anchor: string; // "YYYY-MM-DD HH:mm:ss"
  window_hours: number; // 30
  plus_hours: number;   // 6
  reg_mode: string;     // "auto"|"api"|"ai"
  api_ok: boolean;
  models: Record<string, string | null>;
  timeline: TimelineItem[];
};
