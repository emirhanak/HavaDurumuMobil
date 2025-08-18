// utils/format.ts
import dayjs from "dayjs";
import type { VarKey } from '@/components/VarTabs';


export function hhmm(istString: string) {
  return dayjs(istString.replace(" ", "T")).format("HH:mm");
}
export function round1(x: number | null | undefined) {
  if (x == null) return "-";
  return Math.round(x * 10) / 10;
}
export function pctDiff(ai?: number | null, api?: number | null): string {
  if (ai == null || api == null) return "—";
  const denom = Math.abs(api);
  if (denom < 1e-6) return "—";
  const p = ((ai - api) / denom) * 100;
  const sign = p > 0 ? "+" : "";
  return `${sign}${round1(p)}%`;
}

// alan başlıkları ve birimler
export const VAR_META: Record<string, { label: string; unit: string }> = {
  temp: { label: "Sıcaklık", unit: "°C" },
  rhum: { label: "Nem",      unit: "%"  },
  pres: { label: "Basınç",   unit: "hPa"},
  wspd: { label: "Rüzgâr",   unit: "m/s"},
  prcp: { label: "Yağış",    unit: "mm" },
};
