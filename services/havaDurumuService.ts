// services/havaDurumuService.ts
// Mobil uygulama -> Java proxy (/mobile/blend) -> FastAPI (/blend) zinciri.
// Gelen "timeline" verisini UI'nin beklediği alanlara map eder.
// İlçe adını ile çevirerek (Başiskele -> Kocaeli gibi) doğru modeli seçer.

const JAVA_BACKEND_URL = (
  process.env.EXPO_PUBLIC_JAVA_BASE_URL ||
  process.env.EXPO_PUBLIC_BLEND_BASE_URL ||
  "http://192.168.1.195:8080"
).replace(/\/+$/, "");

/* ======================= Tipler ======================= */

export interface SaatlikTahmin {
  saat: string;           // "HH:MM"
  sicaklik: number;       // grafik ve kartta gösterilen sıcaklık
  durumKodu: number;
  nem: number;
  isoTime: string;

  // Detay modalı için zengin alanlar:
  apiSicaklik?: number | null;         // API (Sıcaklık)
  aiSicaklikTahmini?: number | null;   // AI (Sıcaklık)
  deltaSicaklik?: number | null;       // Δ = ai - api
  yuzdeFarkSicaklik?: number | null;   // %Fark = (Δ / |api|) * 100
  dogrulukYuzdesi?: number | null;     // 0..100
}

export interface GunlukTahmin {
  gun: string;
  enYuksek: number;
  enDusuk: number;
  durumKodu: number;
}

export interface AnlikHavaDurumu {
  sicaklik: number;
  durum: string;
  enYuksek: number;
  enDusuk: number;
  hissedilen: number;
  nem: number;
  ruzgarHizi: number;     // km/s
  gorusMesafesi: number;
  basinc: number;
  durumKodu: number;

  gunlukAIBasariYuzdesi?: number | null;
}

export interface HavaDurumuCevap {
  anlikHavaDurumu: AnlikHavaDurumu;
  saatlikTahmin: SaatlikTahmin[];
  gunlukTahmin: GunlukTahmin[];
}

// Basit bellek içi önbellek mekanizması
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 dakika milisaniye cinsinden

const TOMORROW_API_KEY = "65f3tbh8ipGrdj7Tj5MA1ka6r2Ufg3UR"; // << YENİ ANAHTARINIZ BURADA

export async function fetchDailyForecast(lat: number, lon: number): Promise<GunlukTahmin[]> {
  if (!TOMORROW_API_KEY) {
    console.error("Tomorrow API anahtarı tanımlanmamış veya geçersiz!");
    return [];
  }

  const cacheKey = `daily-${lat}-${lon}`;
  const cached = cache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const location = `${lat},${lon}`;
  const url = `https://api.tomorrow.io/v4/weather/forecast?location=${location}&timesteps=1d&units=metric&apikey=${TOMORROW_API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      console.error(`Tomorrow API hata (${url}): ${res.status} ${errorText}`);
      throw new Error(`Tomorrow API hata: ${res.status} ${errorText}`);
    }

    const json = await res.json();
    const dailyData = json?.timelines?.daily || [];

    const formattedDailyForecast: GunlukTahmin[] = dailyData.map((day: any) => {
      const date = new Date(day.time);
      const gunAdi = date.toLocaleDateString('tr-TR', { weekday: 'long' });

      const minTemp = day.values?.temperatureApparentMin ?? day.values?.temperatureMin;
      const maxTemp = day.values?.temperatureApparentMax ?? day.values?.temperatureMax;
      const weatherCode = day.values?.weatherCode;

      return {
        gun: gunAdi,
        enDusuk: Math.round(minTemp),
        enYuksek: Math.round(maxTemp),
        durumKodu: weatherCode,
      };
    }).filter((item: GunlukTahmin) => typeof item.enDusuk === 'number' && typeof item.enYuksek === 'number'); // Geçersiz veriyi filtrele

    cache.set(cacheKey, { data: formattedDailyForecast, timestamp: now });
    return formattedDailyForecast;

  } catch (e: any) {
    console.error("Günlük tahmin çekilirken hata oluştu:", e);
    return [];
  }
}

/* ============== Şehir/İlçe isim normalizasyonu ============== */

const PROVINCES = [
  "adana","adiyaman","afyonkarahisar","agri","amasya","ankara","antalya","artvin","aydin",
  "balikesir","bilecik","bingol","bitlis","bolu","burdur","bursa","canakkale","cankiri",
  "corum","denizli","diyarbakir","edirne","elazig","erzincan","erzurum","eskisehir",
  "gaziantep","giresun","gumushane","hakkari","hatay","isparta","mersin","istanbul",
  "izmir","kars","kastamonu","kayseri","kirklareli","kirsehir","kocaeli","konya",
  "kutahya","malatya","manisa","kahramanmaras","mardin","mugla","mus","nevsehir",
  "nigde","ordu","rize","sakarya","samsun","siirt","sinop","sivas","tekirdag",
  "tokat","trabzon","tunceli","sanliurfa","usak","van","yozgat","zonguldak","aksaray",
  "bayburt","karaman","kirikkale","batman","sirnak","bartin","ardahan","igdir",
  "yalova","karabuk","kilis","osmaniye","duzce"
];
const PROVINCE_SET = new Set(PROVINCES);

const DISTRICT_TO_PROVINCE: Record<string, string> = {
  // Kocaeli ilçeleri
  "başiskele": "kocaeli",
  "basiskele": "kocaeli",
  "izmit": "kocaeli",
  "kartepe": "kocaeli",
  "gölcük": "kocaeli",
  "golcuk": "kocaeli",
  "derince": "kocaeli",
  "darıca": "kocaeli",
  "darica": "kocaeli",
  "gebze": "kocaeli",
  "çayırova": "kocaeli",
  "cayirova": "kocaeli",
  "körfez": "kocaeli",
  "korfez": "kocaeli",
  "kandıra": "kocaeli",
  "kandira": "kocaeli",
  // Örnek eklemeler — ihtiyaca göre genişlet
  "merkez": "duzce",
};

export function trLower(s: string) {
  return s
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ğ","g").replaceAll("ü","u").replaceAll("ş","s")
    .replaceAll("ı","i").replaceAll("ö","o").replaceAll("ç","c");
}
export function capitalize(s: string){ return s.charAt(0).toUpperCase() + s.slice(1); }

export function pickModelCity(input?: string): string {
  const raw = (input ?? "").trim();
  if (!raw) return "Kocaeli";
  const norm = trLower(raw);

  // Tam il adı gelirse
  if (PROVINCE_SET.has(norm)) return capitalize(norm);

  // İlçe → il
  if (DISTRICT_TO_PROVINCE[norm]) return capitalize(DISTRICT_TO_PROVINCE[norm]);

  // "İl, İlçe" veya "İl İlçe" gibi formlar
  const first = trLower(raw.split(/[,\s]/)[0]);
  if (PROVINCE_SET.has(first)) return capitalize(first);

  return "Kocaeli";
}

/* ======================= Yardımcılar ======================= */

function clip01(x: number) {
  if (Number.isNaN(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

/* ======================= Ana fonksiyon ======================= */

export const fetchWeatherFromBackend = async (
  lat: number,
  lon: number,
  cityName?: string // Opsiyonel: varsa doğrudan il adı, yoksa ilçe → il map yapılır
): Promise<HavaDurumuCevap> => {
  const cacheKey = `blend-${lat}-${lon}-${cityName}`;
  const cached = cache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const cityParam = pickModelCity(cityName || "Kocaeli");

  const qs = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    plus_hours: "6",
    reg_mode: "auto",
    city: cityParam,
  });
  const url = `${JAVA_BACKEND_URL}/mobile/blend?${qs.toString()}`;

  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Backend hata: ${res.status} ${res.statusText} ${txt}`);
  }

  const j = (await res.json()) as any;
  const tl: any[] = Array.isArray(j?.timeline) ? j.timeline : [];

  // Gün içi min/max için ilk 24 saatin API/AI'siz raw api sıcaklıklarını kullan
  const dayTemps = tl
    .slice(0, 24)
    .map((x) => (x?.temp?.api ?? x?.temp?.ai))
    .filter((v: any) => typeof v === "number") as number[];

  const enYuksek = dayTemps.length ? Math.max(...dayTemps) : 0;
  const enDusuk = dayTemps.length ? Math.min(...dayTemps) : 0;

  // Saatlik map + AI metrikleri
  let sumAcc = 0;
  let accCount = 0;

  const saatlik: SaatlikTahmin[] = tl.map((it, idx) => {
    const api = (it?.temp?.api ?? null) as number | null;
    // İlk 24 saat için FastAPI AI üretmez; 25..30 saatlerde olabilir
    const ai  = (idx >= 24 ? (it?.temp?.ai ?? null) : null) as number | null;

    const code = Number(it?.code ?? 0);
    const timeStr: string = String(it?.time ?? "");
    const iso = timeStr.includes(" ") ? timeStr.replace(" ", "T") : timeStr;

    // Ekranda gösterilecek sıcaklık:
    // ilk 24 saat API, son 6 saat AI varsa AI yoksa API
    const shown = idx < 24 ? (api ?? 0) : (ai ?? null);

    // Metrikler (Δ, %Fark, doğruluk)
    let delta: number | null = null;
    let pct: number | null = null;
    let acc: number | null = null;
    if (ai != null && api != null && Math.abs(api) > 1e-9) {
      delta = ai - api;
      pct   = (delta / Math.abs(api)) * 100;
      acc   = clip01(1 - Math.abs(delta) / Math.abs(api)) * 100;
      sumAcc += acc;
      accCount += 1;
    }

    const rhumApi = (idx < 24 ? it?.rhum?.api : (it?.rhum?.ai ?? it?.rhum?.api));

    return {
      saat: iso.slice(11, 16),
      sicaklik: Number(shown),
      durumKodu: code,
      nem: Number(rhumApi ?? 0),
      isoTime: iso,

      apiSicaklik: api,
      aiSicaklikTahmini: ai,
      deltaSicaklik: delta,
      yuzdeFarkSicaklik: pct,
      dogrulukYuzdesi: acc,
    };
  });

  const gunlukAIBasari =
    accCount > 0 ? Number((sumAcc / accCount).toFixed(2)) : null;

  // Anlık (timeline[0])
  const anlikVeriObjesi = tl[0] || {};
  const nowTemp = anlikVeriObjesi?.temp?.api ?? anlikVeriObjesi?.temp?.ai ?? 0;
  const nowRhum = anlikVeriObjesi?.rhum?.api ?? anlikVeriObjesi?.rhum?.ai ?? 0;
  const nowPres = anlikVeriObjesi?.pres?.api ?? anlikVeriObjesi?.pres?.ai ?? 0;
  const nowWspd = anlikVeriObjesi?.wspd?.api ?? anlikVeriObjesi?.wspd?.ai ?? 0;
  const nowCode = anlikVeriObjesi?.code ?? 0;

  const anlik: AnlikHavaDurumu = {
    sicaklik: Number(nowTemp),
    durum: "",
    enYuksek: Number(enYuksek || nowTemp),
    enDusuk: Number(enDusuk  || nowTemp),
    hissedilen: Number(nowTemp),
    nem: Number(nowRhum),
    ruzgarHizi: Number(nowWspd), // km/s
    gorusMesafesi: 0,
    basinc: Number(nowPres),
    durumKodu: Number(nowCode),
    gunlukAIBasariYuzdesi: gunlukAIBasari,
  };

  // Günlük tahmin: artık doğrudan API'den çekilecek, burada boş kalabilir
  const gunluk: GunlukTahmin[] = []; // Bu kısım artık dışarıdan doldurulacak

  const response = {
    anlikHavaDurumu: anlik,
    saatlikTahmin: saatlik,
    gunlukTahmin: gunluk,
  };

  cache.set(cacheKey, { data: response, timestamp: now });
  return response;
};
