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
  if (s.includes('adana')) return 'Adana';
if (s.includes('adiyaman')) return 'Adiyaman';
if (s.includes('afyonkarahisar')) return 'Afyonkarahisar';
if (s.includes('agri')) return 'Agri';
if (s.includes('aksaray')) return 'Aksaray';
if (s.includes('amasya')) return 'Amasya';
if (s.includes('ankara')) return 'Ankara';
if (s.includes('antalya')) return 'Antalya';
if (s.includes('ardahan')) return 'Ardahan';
if (s.includes('artvin')) return 'Artvin';
if (s.includes('aydin')) return 'Aydin';
if (s.includes('balikesir')) return 'Balikesir';
if (s.includes('bartin')) return 'Bartin';
if (s.includes('batman')) return 'Batman';
if (s.includes('bayburt')) return 'Bayburt';
if (s.includes('bilecik')) return 'Bilecik';
if (s.includes('bingol')) return 'Bingol';
if (s.includes('bitlis')) return 'Bitlis';
if (s.includes('bolu')) return 'Bolu';
if (s.includes('burdur')) return 'Burdur';
if (s.includes('bursa')) return 'Bursa';
if (s.includes('canakkale')) return 'Canakkale';
if (s.includes('cankiri')) return 'Cankiri';
if (s.includes('corum')) return 'Corum';
if (s.includes('denizli')) return 'Denizli';
if (s.includes('diyarbakir')) return 'Diyarbakir';
if (s.includes('edirne')) return 'Edirne';
if (s.includes('elazig')) return 'Elazig';
if (s.includes('erzincan')) return 'Erzincan';
if (s.includes('erzurum')) return 'Erzurum';
if (s.includes('eskisehir')) return 'Eskisehir';
if (s.includes('gaziantep')) return 'Gaziantep';
if (s.includes('giresun')) return 'Giresun';
if (s.includes('gumushane')) return 'Gumushane';
if (s.includes('hakkari')) return 'Hakkari';
if (s.includes('hatay')) return 'Hatay';
if (s.includes('igdir')) return 'Igdir';
if (s.includes('isparta')) return 'Isparta';
if (s.includes('istanbul')) return 'Istanbul';
if (s.includes('izmir')) return 'Izmir';
if (s.includes('kahramanmaras')) return 'Kahramanmaras';
if (s.includes('karabuk')) return 'Karabuk';
if (s.includes('karaman')) return 'Karaman';
if (s.includes('kars')) return 'Kars';
if (s.includes('kastamonu')) return 'Kastamonu';
if (s.includes('kayseri')) return 'Kayseri';
if (s.includes('kilis')) return 'Kilis';
if (s.includes('kirikkale')) return 'Kirikkale';
if (s.includes('kirklareli')) return 'Kirklareli';
if (s.includes('kirsehir')) return 'Kirsehir';
if (s.includes('konya')) return 'Konya';
if (s.includes('kutahya')) return 'Kutahya';
if (s.includes('malatya')) return 'Malatya';
if (s.includes('manisa')) return 'Manisa';
if (s.includes('mardin')) return 'Mardin';
if (s.includes('mersin')) return 'Mersin';
if (s.includes('mugla')) return 'Mugla';
if (s.includes('mus')) return 'Mus';
if (s.includes('nevsehir')) return 'Nevsehir';
if (s.includes('nigde')) return 'Nigde';
if (s.includes('ordu')) return 'Ordu';
if (s.includes('osmaniye')) return 'Osmaniye';
if (s.includes('rize')) return 'Rize';
if (s.includes('sakarya')) return 'Sakarya';
if (s.includes('samsun')) return 'Samsun';
if (s.includes('sanliurfa')) return 'Sanliurfa';
if (s.includes('siirt')) return 'Siirt';
if (s.includes('sinop')) return 'Sinop';
if (s.includes('sivas')) return 'Sivas';
if (s.includes('sirnak')) return 'Sirnak';
if (s.includes('tekirdag')) return 'Tekirdag';
if (s.includes('tokat')) return 'Tokat';
if (s.includes('trabzon')) return 'Trabzon';
if (s.includes('tunceli')) return 'Tunceli';
if (s.includes('usak')) return 'Usak';
if (s.includes('van')) return 'Van';
if (s.includes('yalova')) return 'Yalova';
if (s.includes('yozgat')) return 'Yozgat';
if (s.includes('zonguldak')) return 'Zonguldak';

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
