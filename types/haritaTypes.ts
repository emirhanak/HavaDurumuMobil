import { CloudRain, Thermometer, Wind } from 'lucide-react-native';

// --- Tipler ve Sabitler ---
const ikonlar = { CloudRain, Thermometer, Wind };
export type KatmanIkonAdi = keyof typeof ikonlar;
export type KatmanKey = 'precipitation_new' | 'temperature_new' | 'wind_speed';
export interface HaritaKatmani {
  key: KatmanKey;
  title: string;
  iconName: KatmanIkonAdi;
}

export const haritaKatmanlari: HaritaKatmani[] = [
  { key: 'precipitation_new', title: 'Yağış', iconName: 'CloudRain' },
  { key: 'temperature_new', title: 'Sıcaklık', iconName: 'Thermometer' },
  { key: 'wind_speed', title: 'Rüzgar', iconName: 'Wind' },
];

