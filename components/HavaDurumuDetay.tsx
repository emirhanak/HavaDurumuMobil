import { LineChart } from "react-native-chart-kit";
import React from 'react';
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import VarTabs, { VarKey } from "@/components/VarTabs";
import { VAR_META, round1, pctDiff } from "@/utils/format";
import { useBlend } from "@/hooks/useBlend";
import { fetchDailyForecast } from "@/services/havaDurumuService"; // Yeni fonksiyonu import et



import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Modal, Animated, Pressable, LayoutAnimation, Platform, UIManager } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Cloud, Thermometer, Droplets, Wind, Eye, Sun, CloudRain, X, CheckCircle } from 'lucide-react-native';
import { useSettings } from '@/context/SettingsContext';
import WeatherAnimation from './WeatherAnimation';
import { LineChartData } from "react-native-chart-kit/dist/line-chart/LineChart";
import type { ViewStyle } from 'react-native';
import 'react-native-gesture-handler';


// --- Arayüz Tanımlamaları ---
interface Sehir { id: string; ad: string; enlem: number; boylam: number; sicaklik: number; }
interface AnlikHavaDurumu { sicaklik: number; durum: string; enYuksek: number; enDusuk: number; hissedilen: number; nem: number; ruzgarHizi: number; gorusMesafesi: number; basinc: number; durumKodu: number; }
interface SaatlikTahmin {
    saat: string;
    sicaklik: number;
    durumKodu: number;
    nem: number;
    isoTime: string;
    aiSicaklikTahmini?: number | null;
    aiNemTahmini?: number | null;
    sapmaOrani?: number | null;
    dogrulukYuzdesi?: number | null;   // << BUNU EKLE

}
interface GunlukTahmin { gun: string; enDusuk: number; enYuksek: number; durumKodu: number; }
interface WeatherData { anlikHavaDurumu: AnlikHavaDurumu; saatlikTahmin: SaatlikTahmin[]; gunlukTahmin: GunlukTahmin[]; }
interface HavaDurumuDetayProps { sehir: Sehir; weatherData: WeatherData | null; }

const { width } = Dimensions.get('window');
const Y_AXIS_WIDTH = 40;
const LABEL_TAP_HEIGHT = 32; // ← buraya, component DIŞINA


export default function HavaDurumuDetay({ sehir, weatherData }: HavaDurumuDetayProps) {
    const { unit, colors, theme } = useSettings();

    const [modalVisible, setModalVisible] = React.useState(false);
    const [loadingModalVisible, setLoadingModalVisible] = React.useState(false);
    const [tooltipData, setTooltipData] = React.useState<{ x: number, y: number, value: number, index: number } | null>(null);
    const tooltipAnim = React.useRef(new Animated.Value(0)).current;
    const loadingAnim = React.useRef(new Animated.Value(0)).current;
    const checkAnim = React.useRef(new Animated.Value(0)).current;
    const pulseAnim = React.useRef(new Animated.Value(1)).current;
    const scrollX = React.useRef(0);
    const [isAtEndOfScroll, setIsAtEndOfScroll] = React.useState(false);
    const [forecastHoursToShow, setForecastHoursToShow] = React.useState(24);
    // --- Saat seçimi & info kart animasyonu (YENİ) ---
    const [selectedHourIndex, setSelectedHourIndex] = React.useState<number | null>(null);
    
    // ✅ EKLE: sekme seçimi ve /blend verisi
// useBlend zaten importlu
    const [dailyForecastData, setDailyForecastData] = React.useState<GunlukTahmin[]>([]);

    React.useEffect(() => {
        const loadDailyData = async () => {
            if (sehir) {
                const data = await fetchDailyForecast(sehir.enlem, sehir.boylam);
                setDailyForecastData(data);
            }
        };
        loadDailyData();
    }, [sehir]);

    const [varKey, setVarKey] = React.useState<VarKey>("temp");
// eski: const { data: blend, error: blendErr } = useBlend(...)
const { data: blend, error: blendErr, baseUrl } = useBlend(sehir.ad, sehir.enlem, sehir.boylam);

// (Eğer componentte loglayacaksan) ŞU useEffect'i güvenli hale getir:
React.useEffect(() => {
  console.log("[Detay] blend base:", baseUrl);
  if (blend) console.log("[Detay] window_hours:", blend.window_hours, "len:", blend.timeline?.length);
  if (blendErr) console.log("[Detay] blendErr:", blendErr);
}, [blend, blendErr, baseUrl]);

// Seçili saate ve seçili sekmeye göre {api, ai, delta}
// Seçili saate ve seçili sekmeye göre {api, ai, delta}
// Seçili saate ve seçili sekmeye göre {api, ai, delta}
// Seçili saate ve seçili sekmeye göre {api, ai, delta}
const tri = React.useMemo(() => {
  if (typeof selectedHourIndex !== "number") return null;
console.log('[INFO]', selectedHourIndex, varKey,
  'blend.api=', blend?.timeline?.[selectedHourIndex!]?.[varKey]?.api,
  'blend.ai=',  blend?.timeline?.[selectedHourIndex!]?.[varKey]?.ai
);

  // 30 saat modundaki gerçek AI blend'te
  const row = blend?.timeline?.[selectedHourIndex] as any | undefined;
  const fromBlend = row?.[varKey] as { api?: number; ai?: number; delta?: number } | undefined;

  // İlk 24 saatin (veya Java backfill'inin) kaynağı saatlikTahmin
  const h = (weatherData?.saatlikTahmin || [])[selectedHourIndex] as any;
  const apiFromH = (typeof h?.sicaklik === "number") ? h.sicaklik : undefined;
  const aiFromH  = (typeof h?.aiSicaklikTahmini === "number") && (selectedHourIndex < 24) ? h.aiSicaklikTahmini : undefined;

  // DİKKAT: AI'ı asla API'ya düşürme
  const api   = (fromBlend?.api  ?? apiFromH) ?? null;
  const ai    = (fromBlend?.ai   ?? aiFromH ) ?? null;
  const delta = (fromBlend?.delta != null)
                  ? fromBlend.delta
                  : (ai != null && api != null ? ai - api : null);

  if (api == null && ai == null && delta == null) return null;
  return { api, ai, delta };
}, [blend, weatherData?.saatlikTahmin, selectedHourIndex, varKey]);
React.useEffect(() => {
  if (typeof selectedHourIndex === 'number') {
    const r = blend?.timeline?.[selectedHourIndex] as any;
    console.log('[INFO]', selectedHourIndex,
      'varKey=', varKey,
      'blend.api=', r?.[varKey]?.api,
      'blend.ai=', r?.[varKey]?.ai,
      'tri=', tri
    );
  }
}, [selectedHourIndex, varKey, blend, tri]);


const meta = VAR_META[varKey]; // label & unit


 // ⬇️ ANDROID'DE LayoutAnimation'ı AÇ — BURAYA KOY
  React.useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);
  // ⬆️
const openInfo = (i: number) => {
  // Modal “yukarı uzuyor” gibi yumuşak layout animasyonu
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  setTooltipData(null);           // 👈 varsa tooltip kapat
  setSelectedHourIndex(i);
};

const closeInfo = () => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  setSelectedHourIndex(null);
};



    // --- Günlük (ek 6 saat) AI ortalama doğruluk (YENİ) ---
    const dailyAiAvg = React.useMemo(() => {
    const slice = (weatherData?.saatlikTahmin || []).slice(24, 30);
    const vals = slice.map(s => s.dogrulukYuzdesi).filter(v => typeof v === 'number') as number[];
    if (!vals.length) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
    }, [weatherData]);


    if (!weatherData || !sehir || !weatherData.anlikHavaDurumu) return null;

    const anlikVeri = weatherData.anlikHavaDurumu;
    const saatlikVeri = weatherData.saatlikTahmin || [];
    const gunlukVeri = weatherData.gunlukTahmin || [];

    const handleDataPointClick = (data: { value: number; index: number; x: number; y: number; }) => {
        if (data.value === null || data.value === undefined) return;
        const correctedX = data.x - scrollX.current + Y_AXIS_WIDTH;
        const newData = { ...data, x: correctedX };
        if (tooltipData && tooltipData.index === data.index) {
            Animated.timing(tooltipAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setTooltipData(null));
        } else {
            setTooltipData(newData);
            Animated.spring(tooltipAnim, { toValue: 1, friction: 7, useNativeDriver: true }).start();
        }

    };

    // ESKİ (sende null/undefined için 0 döndürüyordu) --> YERİNE BUNU KOY
// HavaDurumuDetay.tsx
const convertTemperature = (celsius?: number | null) => {
  if (celsius == null) return null as any; // chart'ta nokta çizilmesin
  if (unit === 'F') return +(((celsius * 9) / 5) + 32).toFixed(1);
  return +(+celsius).toFixed(1);
};


    const renderWeatherIcon = (code: number, size: number) => {
        if(code === 9999) return <Text style={{fontSize: size-4, color: colors.text}}>🔮</Text>;
        if (code >= 8000) return <CloudRain size={size} color={colors.text} />;
        if (code >= 4000 && code < 5000) return <CloudRain size={size} color={colors.text} />;
        if (code === 1000 || code === 1100) return <Sun size={size} color={colors.text} />;
        return <Cloud size={size} color={colors.text} />;
    };

    const gunKisaltma = (gun: string) => {
        const map: Record<string, string> = { 'Pazartesi': 'Pts', 'Salı': 'Sal', 'Çarşamba': 'Çrş', 'Perşembe': 'Prş', 'Cuma': 'Cum', 'Cumartesi': 'Cts', 'Pazar': 'Paz' };
        return map[gun] || gun.substring(0, 3);
    };

    const detaylar = [
        { title: 'HİSSEDİLEN', value: `${Math.round(anlikVeri.hissedilen)}°`, icon: <Thermometer size={20} color={colors.icon} /> },
        { title: 'NEM', value: `${Math.round(anlikVeri.nem)}%`, icon: <Droplets size={20} color={colors.icon} /> },
        { title: 'RÜZGAR', value: `${anlikVeri.ruzgarHizi.toFixed(1)} km/s`, icon: <Wind size={20} color={colors.icon} /> },
        { title: 'GÖRÜŞ MESAFESİ', value: `${anlikVeri.gorusMesafesi.toFixed(1)} km`, icon: <Eye size={20} color={colors.icon} /> },
    ];

    const cardStyle = theme === 'light' ? styles.cardShadow : {};
    const DATA_POINT_WIDTH = 60;
const [loadingPhase, setLoadingPhase] =
  React.useState<'prep' | 'ready'>('prep');

const showLoadingModal = () => {
  setLoadingPhase('prep');
  setLoadingModalVisible(true);

  setTimeout(() => {
    setLoadingPhase('ready');
    setSelectedHourIndex(null); // info kart kapansın
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // 👈 EKLE
    setForecastHoursToShow(30); // 2. grafiğe geç

    setTimeout(() => {
      setLoadingModalVisible(false);
    }, 400); // “Hazır!” yazısı kısa görünsün
  }, 700);   // hazırlama kısa bekleme
};



   const closeModal = () => {
  setTooltipData(null);
  setSelectedHourIndex(null);   // ← ekle
  setModalVisible(false);
  setForecastHoursToShow(24);
  setIsAtEndOfScroll(false);
};

// Konum: HavaDurumuDetay.tsx
const getChartData = (): LineChartData => {
  const emptyData: LineChartData = { labels: [], datasets: [{ data: [] }] };
  if (!saatlikVeri || saatlikVeri.length === 0) return emptyData;

  const dataSlice = (weatherData?.saatlikTahmin ?? []).slice(0, forecastHoursToShow);
  const labels = dataSlice.map(i => i.saat);
    const h = dataSlice[selectedHourIndex!] as SaatlikTahmin | undefined;


  // 1) API çizgisi (her zaman var)
  const apiData = dataSlice.map(i => convertTemperature(i.sicaklik)) as any;

  // 2) AI çizgisi (varsa saatlikTahmin'den, yoksa 30 saat modunda blend'ten)
 // getChartData içinde
const aiData = dataSlice.map((h, idx) => {
  const blendRow = (blend?.timeline as any[] | undefined)?.[idx];
  const blendAiTemp  = blendRow?.temp?.ai; // Her zaman sıcaklık AI'yı al
  const blendApiTemp = blendRow?.temp?.api; // Her zaman sıcaklık API'yı al

  // 1. BLEND AI (sıcaklık) değeri varsa (öncelikli)
  if (typeof blendAiTemp === "number") {
    return convertTemperature(blendAiTemp);
  }

  // 2. BLEND AI (sıcaklık) değeri yoksa, ilk 24 saat için SaatlikTahmin AI'yı veya API'yı kullan
  if (idx < 24) {
    if (typeof h?.aiSicaklikTahmini === "number") {
      return convertTemperature(h.aiSicaklikTahmini);
    } else if (typeof h?.sicaklik === "number") {
      return convertTemperature(h.sicaklik); // Sıcaklık için API backfill
    }
  }

  // 3. Diğer durumlar (24+ saat veya AI/API backfill yapılamayan metrikler) null olsun
  return null;
});


  return {
    labels,
    datasets: [
      { data: apiData, color: (o=1) => `rgba(37,99,235,${o})`, strokeWidth: 2, withDots: true },
      { data: aiData,  color: (o=1) => `rgba(16,185,129,${o})`, strokeWidth: 2, withDots: true },
    ],
  };
};
console.log('[CHK] sd0 api/ai from BLEND',
  blend?.timeline?.[0]?.[varKey]?.api,
  blend?.timeline?.[0]?.[varKey]?.ai);

console.log('[CHK] sd0 api/ai from HOURLY',
  weatherData?.saatlikTahmin?.[0]?.sicaklik,
  weatherData?.saatlikTahmin?.[0]?.aiSicaklikTahmini);

console.log('[CHK] is hourly AI equal to API?',
  weatherData?.saatlikTahmin?.[0]?.aiSicaklikTahmini === weatherData?.saatlikTahmin?.[0]?.sicaklik);




    const chartConfig = {
        backgroundGradientFrom: colors.cardBackground,
        backgroundGradientTo: colors.cardBackground,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(${theme === 'dark' ? 255 : 0}, ${theme === 'dark' ? 255 : 0}, ${theme === 'dark' ? 255 : 0}, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(${theme === 'dark' ? 255 : 0}, ${theme === 'dark' ? 255 : 0}, ${theme === 'dark' ? 255 : 0}, ${opacity})`,
        style: { borderRadius: 16 },
        propsForDots: { r: "4", strokeWidth: "2", stroke: theme === 'dark' ? "#4A90E2" : "#007AFF" },
        withVerticalLines: false,
        withHorizontalLines: true,
        fromZero: false,
    };

    const chartData = getChartData();
    
    const totalChartWidth = Math.max(width - 80, (chartData.labels?.length || 0) * DATA_POINT_WIDTH);
    
const slice = saatlikVeri.slice(0, forecastHoursToShow);
const allTemperatures = slice
  .flatMap(i => [i.sicaklik, i.aiSicaklikTahmini])
  .filter(v => typeof v === 'number' && Number.isFinite(v as number)) as number[];

const minTemp = allTemperatures.length ? Math.floor(Math.min(...allTemperatures)) : 0;
const maxTemp = allTemperatures.length ? Math.ceil(Math.max(...allTemperatures))  : 30;

    const generateYAxisLabels = () => {
        if(minTemp === maxTemp) return [`${minTemp}°`];
        const labels = [];
        const range = maxTemp - minTemp;
        const step = range > 0 ? Math.ceil(range / 4) : 1;
        for (let i = 0; i <= 4; i++) {
            let label = maxTemp - (i * step);
            if(label < minTemp) label = minTemp;
            labels.push(`${Math.round(label)}°`);
        }
        return labels;
    };
    const yAxisLabels = generateYAxisLabels();



// Her saat etiketi için segment genişliği (grafik toplam genişliğine böl)
const labelCount = chartData.labels?.length ?? 0;
const segmentWidth = labelCount ? (totalChartWidth / labelCount) : DATA_POINT_WIDTH;
// ⬇️ return'dan HEMEN ÖNCE EKLE
const lineChartStyle = React.useMemo<ViewStyle>(() => {
  const base = StyleSheet.flatten(styles.chartStyle) as ViewStyle;
  return forecastHoursToShow > 24 ? { ...base, paddingBottom: 12 } : base;
}, [forecastHoursToShow]);
// ⬆️ EKLEME BİTİŞİ


    return (
        <View style={styles.container}>
            <LinearGradient colors={theme === 'dark' ? ['#1e3c72', '#2a5298', '#4c6ef5'] : ['#87CEEB', '#B0E0E6']} style={styles.backgroundGradient} />
            <View style={styles.animationContainer}><WeatherAnimation code={anlikVeri.durumKodu} durum={anlikVeri.durum} /></View>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.anaHavaBolumu}>
                    <Text style={[styles.sehirAdi, { color: colors.text }]}>{sehir.ad}</Text>
                    <Text style={[styles.anlikSicaklik, { color: colors.text }]}>{Math.round(anlikVeri.sicaklik)}°</Text>
                    <Text style={[styles.havaDurumu, { color: colors.text, marginBottom: 8 }]}>{anlikVeri.durum} Hissedilen: {Math.round(anlikVeri.hissedilen)}°</Text>
                    <Text style={[styles.yuksekDusukSicaklik, { color: colors.text }]}>Y:{Math.round(anlikVeri.enYuksek)}° D:{Math.round(anlikVeri.enDusuk)}°</Text>
                </View>

                <View style={[styles.card, cardStyle, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
                    <Text style={[styles.cardTitle, { color: colors.icon }]}>SAATLİK TAHMİN</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {saatlikVeri.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.hourlyItem}
                                onPress={() => { 
                                setSelectedHourIndex(index);   // 👈 ekle
                                setModalVisible(true); 
                                }}


                                activeOpacity={0.7}
                            >
                                <Text style={[styles.hourlyTime, { color: colors.icon }]}>{index === 0 ? 'Şimdi' : item.saat}</Text>
                                <View style={styles.hourlyIcon}>{renderWeatherIcon(item.durumKodu, 24)}</View>
                                <Text style={[styles.hourlyTemp, { color: colors.text }]}>{Math.round(item.sicaklik)}°</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Ana Modal - DÜZELTİLDİ */}
                <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
                            <View style={styles.modalHeader}>
<Text style={[styles.modalTitle, { color: colors.text }]}>
  
</Text>
                                <TouchableOpacity onPress={closeModal} style={styles.closeIconButton}>
                                    <X size={24} color={colors.text} />
                                </TouchableOpacity>
                            </View>
                            
                            {/* Seçili saat bilgi kartı (YENİ) */}
                            
                            {forecastHoursToShow > 24 && selectedHourIndex !== null && (
                            <View
                                style={[
                                styles.infoCard,
                                {
                                    backgroundColor: colors.cardBackground,
                                    borderColor: colors.borderColor,
                                   
                                },
                                ]}
                            >
                                {(() => {
                                const dataSlice = (weatherData?.saatlikTahmin || []).slice(0, forecastHoursToShow);
                                const h = dataSlice[selectedHourIndex!] as SaatlikTahmin | undefined;

// Seçili sekmeye göre meta
const meta = VAR_META[varKey];

// 1) API/AI/Δ (öncelik BLEND → saatlikTahmin)
const blendRow = (blend?.timeline as any[] | undefined)?.[selectedHourIndex!];
const fromBlend = blendRow?.[varKey] as { api?: number; ai?: number; delta?: number } | undefined;

const apiShownRaw =
  (typeof fromBlend?.api === 'number')
    ? fromBlend!.api
    : (typeof h?.sicaklik === 'number' ? h!.sicaklik : null);

const aiShownRaw =
  (typeof fromBlend?.ai === 'number')
    ? fromBlend!.ai
    : (selectedHourIndex < 24 && typeof h?.aiSicaklikTahmini === 'number' && varKey === 'temp') // Sadece sıcaklık için AI tahminini kullan
      ? h!.aiSicaklikTahmini
      : null; // Diğer durumlarda backfill yapma, null olsun (bu -- olarak görünecek)

const deltaShownRaw =
  (tri?.delta != null) ? tri!.delta :
  (aiShownRaw != null && apiShownRaw != null ? aiShownRaw - apiShownRaw : null);

// 2) % fark ve başarı
const pct = pctDiff(aiShownRaw, apiShownRaw);
const acc = (typeof h?.dogrulukYuzdesi === 'number') ? h!.dogrulukYuzdesi : null;


                                return (
                                    <View>
                                    <Text style={[styles.infoTitle, { color: colors.text }]}>
                                        {h?.saat ?? '--:--'} için detay
                                    </Text>
                                    {/* 25–30 görünümünde alan sekmeleri */}
<VarTabs value={varKey} onChange={setVarKey} />

                          {/* Legend */}
<View style={styles.legendRow}>
  <View style={[styles.legendDot, { backgroundColor: '#2563eb' }]} />
  <Text style={[styles.legendText, { color: colors.text }]}>API ({meta.label})</Text>
  <View style={{ width: 12 }} />
  <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
  <Text style={[styles.legendText, { color: colors.text }]}>AI ({meta.label})</Text>
</View>
                                    {/* Değerler (SEÇİLEN ALAN) */}
<View style={styles.infoRow}>
  <Text style={[styles.infoLabel, { color: colors.icon }]}>API ({meta.label})</Text>
  <Text style={[styles.infoValue, { color: colors.text }]}>
    {apiShownRaw == null ? "—" : `${round1(apiShownRaw)} ${meta.unit}`}
  </Text>
</View>

<View style={styles.infoRow}>
  <Text style={[styles.infoLabel, { color: colors.icon }]}>AI ({meta.label})</Text>
  <Text style={[styles.infoValue, { color: colors.text }]}>
    {aiShownRaw == null ? "—" : `${round1(aiShownRaw)} ${meta.unit}`}
  </Text>
</View>

<View style={styles.infoRow}>
  <Text style={[styles.infoLabel, { color: colors.icon }]}>Δ</Text>
  <Text style={[styles.infoValue, { color: colors.text }]}>
    {deltaShownRaw == null ? "—" : `${round1(deltaShownRaw)} ${meta.unit}`}
  </Text>
</View>

<View style={styles.infoRow}>
  <Text style={[styles.infoLabel, { color: colors.icon }]}>% Fark</Text>
  <Text style={[styles.infoBadge, { borderColor: colors.borderColor, color: colors.text }]}>
    {pct}
  </Text>
</View>

{varKey === 'temp' && (
  <>
    
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.icon }]}>AI Başarı Yüzdesi</Text>
      <Text style={[styles.infoBadge, { borderColor: colors.borderColor, color: colors.text }]}>
        {typeof acc === 'number' ? `%${acc.toFixed(1)}` : '—'}
      </Text>
    </View>
  </>
)}

        

                                    <View style={[styles.infoRow, { marginTop: 8 }]}>
                                        <Text style={[styles.infoLabel, { color: colors.icon }]}>Günlük AI Başarı Yüzdesi</Text>
                                        <Text style={[styles.infoBadge, { borderColor: colors.borderColor, color: colors.text }]}>
{typeof dailyAiAvg === 'number' ? `%${dailyAiAvg.toFixed(1)}` : '—'}
                                        </Text>
                                    </View>

                                    <View style={{ alignItems: 'flex-end', marginTop: 10 }}>
                                        <TouchableOpacity onPress={closeInfo} style={styles.infoCloseBtn}>
                                        <Text style={styles.infoCloseText}>Kapat</Text>
                                        </TouchableOpacity>
                                    </View>
                                    </View>
                                );
                                })()}
                            </View>
                            )}

                            <View style={styles.chartContainer}>
                                <View style={[styles.yAxisContainer, { width: Y_AXIS_WIDTH }]}>
                                    {yAxisLabels.map((label, index) => (
                                        <View key={index} style={styles.yAxisLabelContainer}>
                                            <Text style={[styles.yAxisLabel, { color: colors.text }]}>{label}</Text>
                                        </View>
                                    ))}
                                </View>
                                
                              <ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  onScroll={({ nativeEvent }) => {
  const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
  const isEnd = layoutMeasurement.width + contentOffset.x >= contentSize.width - 20;
 

  

  if (isEnd !== isAtEndOfScroll) {
    // modal altındaki buton görünür/gizlenir → yumuşak büyüme/kısalma
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    setIsAtEndOfScroll(isEnd);
  }
  scrollX.current = nativeEvent.contentOffset.x;
}}

  scrollEventThrottle={16}
  style={styles.chartScrollView}
>
  {chartData.labels.length > 0 && (
    <View style={{ width: totalChartWidth, height: 250, position: 'relative' }}>
      <LineChart
        data={chartData}
        width={totalChartWidth}
        height={250}
        chartConfig={chartConfig}
        style={lineChartStyle}

        fromZero={false}
        segments={4}
        onDataPointClick={handleDataPointClick}   // nokta → tooltip
         withVerticalLabels={true}   
  withHorizontalLabels={false} 

      />

     {/* Saat etiketlerinin hizasında görünmez dokunma bandı – sadece 2. grafikte */}
{forecastHoursToShow > 24 && (
  <View style={styles.labelTapRow} pointerEvents="box-none">
    {chartData.labels.map((_, i) => (
      <Pressable
        key={i}
        onPress={() => openInfo(i)}   // saat yazısına basınca info kartı aç
        style={{ width: segmentWidth, height: LABEL_TAP_HEIGHT }}
        hitSlop={6}
      />
    ))}
  </View>
)}



    </View>
  )}
</ScrollView>

                            </View>
                            

                            
                            <View style={styles.buttonContainer}>
                                {isAtEndOfScroll && forecastHoursToShow < 30 && saatlikVeri.length >= 30 && (
                                    <TouchableOpacity style={styles.predictButton} onPress={showLoadingModal}>
                                        <Text style={styles.predictButtonText}>+6 Saat AI Tahmini</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            {tooltipData && tooltipData.value !== null && (
                                <Animated.View style={[ styles.tooltipContainer, { left: tooltipData.x - 25, top: tooltipData.y - 45, opacity: tooltipAnim, transform: [{ scale: tooltipAnim }] } ]}>
                                    <Text style={styles.tooltipText}>{tooltipData.value.toFixed(1)}°</Text>
                                </Animated.View>
                            )}
                        </View>
                        {/* Overlay'e tıklandığında modal'ı kapatmak için invisible touch area */}
                        <Pressable 
                            style={styles.overlayTouchArea} 
                            onPress={closeModal}
                        />
                    </View>
                </Modal>

                {/* Apple Face ID Tarzı Loading Modal */}
                <Modal visible={loadingModalVisible} transparent animationType="fade">
                    <View style={styles.loadingModalOverlay}>
                        <Animated.View style={[
                            styles.loadingModalContent, 
                            { backgroundColor: colors.cardBackground, transform: [{ scale: pulseAnim }] }
                        ]}>
                            <View style={styles.loadingContainer}>
                                <Animated.View style={[
                                    styles.loadingCircle,
                                    {
                                        opacity: loadingAnim,
                                        transform: [{
                                            rotate: loadingAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: ['0deg', '360deg']
                                            })
                                        }]
                                    }
                                ]} />
                                
                                <Animated.View style={[
                                    styles.checkContainer,
                                    {
                                        opacity: checkAnim,
                                        transform: [{ scale: checkAnim }]
                                    }
                                ]}>
                                    <CheckCircle size={60} color="#4CAF50" />
                                </Animated.View>
                            </View>
                            {/* Hazırlanıyor */}
{loadingPhase === 'prep' ? (
  <Text style={[styles.loadingText, { color: colors.text }]}>
    AI destekli grafik hazırlanıyor...
  </Text>
) : (
  <Text style={[styles.successText, { color: '#4CAF50' }]}>
    Hazır!
  </Text>
)}


                        </Animated.View>
                    </View>
                </Modal>

                {/* Günlük Tahmin Kartı */}
                {(dailyForecastData?.length ?? 0) > 0 && (
                <View style={[styles.card, cardStyle, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
                    <Text style={[styles.cardTitle, { color: colors.icon }]}>HAFTALIK TAHMİN</Text>
                    {dailyForecastData.map((item, index) => (
                        <View key={index} style={[styles.gunlukItem, { borderBottomColor: colors.borderColor }]}>
                            <View style={styles.gunlukSol}>
                                <Text style={[styles.gunText, { color: colors.text }]}>{index === 0 ? 'Bugün' : gunKisaltma(item.gun)}</Text>
                                <View style={styles.gunlukIcon}>{renderWeatherIcon(item.durumKodu, 28)}</View>
                            </View>
                            <View style={styles.gunlukSag}>
                                <Text style={[styles.gunlukDusukSicaklik, { color: colors.text }]}>{Math.round(item.enDusuk)}°</Text>
                                <View style={styles.sicaklikAralikKapsayici}>
                                    <LinearGradient colors={['#4facfe', '#00f2fe']} style={styles.sicaklikAralikArkaPlan} />
                                </View>
                                <Text style={[styles.gunlukYuksekSicaklik, { color: colors.text }]}>{Math.round(item.enYuksek)}°</Text>
                            </View>
                        </View>
                    ))}
                </View>
                )}

                {/* Detay Kartları */}
                <View style={styles.detayKartlarGrid}>
                    {detaylar.map((detay, index) => (
                        <View key={index} style={styles.detayKartKapsayici}>
                            <View style={[styles.detayKart, cardStyle, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor, borderWidth: StyleSheet.hairlineWidth, borderRadius: 16 }]}>
                                <View style={styles.detayKartIcon}>{detay.icon}</View>
                                <Text style={[styles.detayKartBaslik, { color: colors.icon }]}>{detay.title}</Text>
                                <Text style={[styles.detayKartDeger, { color: colors.text }]}>{detay.value}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    backgroundGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    animationContainer: { position: 'absolute', top: 32, left: 16, zIndex: 20, height: 120, width: 120, justifyContent: 'flex-start', alignItems: 'center' },
    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: 100, paddingTop: 80 },
    anaHavaBolumu: { alignItems: 'center', paddingHorizontal: 20, marginBottom: 40 },
    sehirAdi: { fontSize: 34, fontWeight: '300' },
    anlikSicaklik: { fontSize: 96, fontWeight: '200' },
    havaDurumu: { fontSize: 20, fontWeight: '400' },
    yuksekDusukSicaklik: { fontSize: 20, fontWeight: '400' },
    card: { marginHorizontal: 20, marginBottom: 20, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 15 },
    cardShadow: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
    cardTitle: { fontSize: 13, fontWeight: '600', marginBottom: 12, letterSpacing: 0.5, opacity: 0.8 },
    hourlyScrollContent: { paddingRight: 20 },
    hourlyItem: { alignItems: 'center', marginRight: 25 },
    hourlyTime: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
    hourlyIcon: { height: 32, width: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    hourlyTemp: { fontSize: 20, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { borderRadius: 20, paddingVertical: 24, paddingHorizontal: 16, alignItems: 'center', width: '90%', position: 'relative', zIndex: 10 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 10 },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    closeIconButton: { padding: 8 },
    chartContainer: { flexDirection: 'row', alignItems: 'stretch', height: 250, width: '100%', },
    yAxisContainer: { justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 4, paddingTop: 20, paddingBottom: 50, },
    yAxisLabelContainer: { flex: 1, justifyContent: 'center', },
    yAxisLabel: { fontSize: 12, fontWeight: '500', textAlign: 'right', },
    chartScrollView: { flex: 1, },
    chartStyle: { marginVertical: 16, borderRadius: 16, paddingRight: 30 },
    closeButtonText: { fontSize: 16, fontWeight: '600' },
    tooltipContainer: { position: 'absolute', backgroundColor: '#2c3e50', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, zIndex: 20 },
    tooltipText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '100%', marginTop: 20,minHeight: 48, },
    predictButton: { backgroundColor: '#ff4757', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 20, elevation: 2, },
    predictButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, },
    closeButton: { borderRadius: 20, paddingVertical: 12, paddingHorizontal: 30, elevation: 2, },
    
    // Overlay touch area - DÜZELTİLDİ
    overlayTouchArea: { 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 1 
    },
    
    // Loading Modal Styles
    loadingModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
    loadingModalContent: { borderRadius: 20, padding: 40, alignItems: 'center', width: '80%', minHeight: 200 },
    loadingContainer: { position: 'relative', width: 80, height: 80, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    loadingCircle: { 
        position: 'absolute',
        width: 60, 
        height: 60, 
        borderRadius: 30, 
        borderWidth: 3, 
        borderColor: '#007AFF', 
        borderTopColor: 'transparent',
    },
    checkContainer: { position: 'absolute' },
    loadingText: { fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 10 },
    successText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
    
    gunlukItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
    gunlukSol: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    gunText: { fontSize: 17, fontWeight: '400', width: 50 },
    gunlukIcon: { marginLeft: 12, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
    gunlukSag: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
    gunlukDusukSicaklik: { fontSize: 17, fontWeight: '400', width: 35, textAlign: 'right', opacity: 0.8 },
    sicaklikAralikKapsayici: { flex: 1, height: 4, borderRadius: 2, marginHorizontal: 12 },
    sicaklikAralikArkaPlan: { flex: 1, borderRadius: 2 },
    gunlukYuksekSicaklik: { fontSize: 17, fontWeight: '400', width: 35, textAlign: 'right' },
    detayKartlarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20 },
    detayKartKapsayici: { width: (width - 52) / 2, marginBottom: 12 },
    detayKart: { padding: 16, alignItems: 'center', height: 120, margin: 0 },
    detayKartIcon: { alignItems: 'center', marginBottom: 8 },
    detayKartBaslik: { fontSize: 13, fontWeight: '600', marginBottom: 4, letterSpacing: 0.5, textAlign: 'center' },
    detayKartDeger: { fontSize: 24, fontWeight: '400', flex: 1, textAlign: 'center' },


    infoCard: {
  width: '100%',
  borderRadius: 14,
  borderWidth: StyleSheet.hairlineWidth,
  padding: 12,
  marginBottom: 8,
  marginTop: 6,
  alignSelf: 'center',
  shadowColor: '#000',
  shadowOpacity: 0.12,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
},
infoTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
legendText: { fontSize: 12, opacity: 0.8 },
infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
infoLabel: { fontSize: 13, fontWeight: '600', opacity: 0.8 },
infoValue: { fontSize: 16, fontWeight: '700' },
infoBadge: { fontSize: 14, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderRadius: 12 },
infoCloseBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
infoCloseText: { color: 'white', fontWeight: '700' },

hourStripContainer: { width: '100%', marginTop: 10, marginBottom: 6 },
hourChip: {
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 999,
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: '#94a3b8',
  marginRight: 8,
  backgroundColor: 'rgba(148,163,184,0.12)',
},
hourChipSelected: { backgroundColor: 'rgba(59,130,246,0.2)', borderColor: '#3b82f6' },
hourChipText: { fontSize: 13, fontWeight: '700', color: '#94a3b8' },
hourChipTextSelected: { color: '#2563eb' },

labelTapRow: { // SEFFAF
  position: 'absolute',
  left: 0,
  right: 0,
  bottom: 0,        // X etiketlerinin çizildiği bant
  height: LABEL_TAP_HEIGHT, // 👈 36 yerine bu
  flexDirection: 'row',
  zIndex: 10,
  backgroundColor: 'transparent',
},

});