// C:\Users\emir\Desktop\havadurumumobil\services\havaDurumuService.ts

const JAVA_BACKEND_URL = 'http://192.168.1.195:8080/api';

export interface SaatlikTahmin {
  saat:      string;
  sicaklik:  number;
  durumKodu: number;
  nem:       number;
  isoTime:   string;
}

export interface GunlukTahmin {
  gun:       string;
  enYuksek:  number;
  enDusuk:   number;
  durumKodu: number;
}

export interface AnlikHavaDurumu {
  sicaklik:      number;
  durum:         string;
  enYuksek:      number;
  enDusuk:       number;
  hissedilen:    number;
  nem:           number;
  ruzgarHizi:    number;
  gorusMesafesi: number;
  basinc:        number;
  durumKodu:     number;
}

export interface HavaDurumuCevap {
  anlikHavaDurumu: AnlikHavaDurumu;
  saatlikTahmin:   SaatlikTahmin[];
  gunlukTahmin:    GunlukTahmin[];
}

export const fetchWeatherFromBackend = async (
  lat: number,
  lon: number
): Promise<HavaDurumuCevap> => {
  const url = `${JAVA_BACKEND_URL}/weather?lat=${lat}&lon=${lon}`;
  console.log('📡 İstek atılan URL:', url);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Backend hata: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as HavaDurumuCevap;
};
