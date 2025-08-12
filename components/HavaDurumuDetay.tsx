import { LineChart } from "react-native-chart-kit";
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Modal, Animated, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Cloud, Thermometer, Droplets, Wind, Eye, Sun, CloudRain, X, CheckCircle } from 'lucide-react-native';
import { useSettings } from '@/context/SettingsContext';
import WeatherAnimation from './WeatherAnimation';
import { LineChartData } from "react-native-chart-kit/dist/line-chart/LineChart";

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
    const infoAnim = React.useRef(new Animated.Value(0)).current;

    const openInfo = (i: number) => {
    setSelectedHourIndex(i);
    infoAnim.setValue(0);
    Animated.spring(infoAnim, { toValue: 1, useNativeDriver: true, friction: 7 }).start();
    };
    const closeInfo = () => {
    Animated.timing(infoAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() =>
        setSelectedHourIndex(null)
    );
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
const convertTemperature = (celsius?: number | null): number => {
  if (celsius == null) return 0; // (artık ilk 24'te null gelmiyor ama kalsın)
  if (unit === 'F') return +(((celsius * 9) / 5) + 32).toFixed(1);
  return +celsius.toFixed(1);
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

    const showLoadingModal = () => {
        setLoadingModalVisible(true);
        loadingAnim.setValue(0);
        checkAnim.setValue(0);
        pulseAnim.setValue(1);
        const pulseAnimation = Animated.loop(Animated.sequence([
            Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
            Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
        ]));
        const loadingAnimation = Animated.loop(Animated.timing(loadingAnim, { toValue: 1, duration: 1000, useNativeDriver: true }));
        pulseAnimation.start();
        loadingAnimation.start();
        setTimeout(() => {
            pulseAnimation.stop();
            loadingAnimation.stop();
            Animated.sequence([
                Animated.timing(loadingAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
                Animated.spring(checkAnim, { toValue: 1, friction: 6, useNativeDriver: true })
            ]).start(() => {
                setTimeout(() => {
                    setLoadingModalVisible(false);
                    setForecastHoursToShow(30);
                }, 300);
            });
        }, 1000);
    };

    const closeModal = () => {
        setTooltipData(null);
        setModalVisible(false);
        setForecastHoursToShow(24);
        setIsAtEndOfScroll(false);
    };
// Konum: HavaDurumuDetay.tsx
const getChartData = (): LineChartData => {
  const emptyData: LineChartData = { labels: [], datasets: [{ data: [] }] };
  if (!saatlikVeri || saatlikVeri.length === 0) return emptyData;

  const dataSlice = saatlikVeri.slice(0, forecastHoursToShow);
  const labels = dataSlice.map(i => i.saat);

  // Mavi: API | Yeşil: AI (artık backend 0–24'te dolduruyor)
  const apiData = dataSlice.map(i => convertTemperature(i.sicaklik));
  const aiData  = dataSlice.map(i => convertTemperature(i.aiSicaklikTahmini as number | null));

  return {
    labels,
    datasets: [
      { data: apiData, color: (o=1) => `rgba(37,99,235,${o})`, strokeWidth: 2, withDots: true },
      { data: aiData,  color: (o=1) => `rgba(16,185,129,${o})`, strokeWidth: 2, withDots: true },
    ],
  };
};


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

    return (
        <View style={styles.container}>
            <LinearGradient colors={theme === 'dark' ? ['#1e3c72', '#2a5298', '#4c6ef5'] : ['#87CEEB', '#B0E0E6']} style={styles.backgroundGradient} />
            <View style={styles.animationContainer}><WeatherAnimation code={anlikVeri.durumKodu} durum={anlikVeri.durum} /></View>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.anaHavaBolumu}>
                    <Text style={[styles.sehirAdi, { color: colors.text }]}>{sehir.ad}</Text>
                    <Text style={[styles.anlikSicaklik, { color: colors.text }]}>{Math.round(anlikVeri.sicaklik)}°</Text>
                    <Text style={[styles.havaDurumu, { color: colors.text, marginBottom: 8 }]}>{anlikVeri.durum} · Hissedilen: {Math.round(anlikVeri.hissedilen)}°</Text>
                    <Text style={[styles.yuksekDusukSicaklik, { color: colors.text }]}>Y:{Math.round(anlikVeri.enYuksek)}° D:{Math.round(anlikVeri.enDusuk)}°</Text>
                </View>

                <View style={[styles.card, cardStyle, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
                    <Text style={[styles.cardTitle, { color: colors.icon }]}>SAATLİK TAHMİN</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {saatlikVeri.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.hourlyItem}
                                onPress={() => { setModalVisible(true); }}
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
                                <Text style={[styles.modalTitle, { color: colors.text }]}>Sonraki Saatler için Sıcaklık</Text>
                                <TouchableOpacity onPress={closeModal} style={styles.closeIconButton}>
                                    <X size={24} color={colors.text} />
                                </TouchableOpacity>
                            </View>
                            {/* Seçili saat bilgi kartı (YENİ) */}
                            {selectedHourIndex !== null && (
                            <Animated.View
                                style={[
                                styles.infoCard,
                                {
                                    backgroundColor: colors.cardBackground,
                                    borderColor: colors.borderColor,
                                    opacity: infoAnim,
                                    transform: [{ scale: infoAnim }],
                                },
                                ]}
                            >
                                {(() => {
                                const dataSlice = (weatherData?.saatlikTahmin || []).slice(0, forecastHoursToShow);
                                const h = dataSlice[selectedHourIndex!];
                                const api = h ? convertTemperature(h.sicaklik) : null;
                                const ai  = h && h.aiSicaklikTahmini != null ? convertTemperature(h.aiSicaklikTahmini) : null;
                                const acc = h?.dogrulukYuzdesi ?? null;

                                return (
                                    <View>
                                    <Text style={[styles.infoTitle, { color: colors.text }]}>
                                        {h?.saat ?? '--:--'} için detay
                                    </Text>

                                    {/* Legend */}
                                    <View style={styles.legendRow}>
                                        <View style={[styles.legendDot, { backgroundColor: '#2563eb' }]} />
                                        <Text style={[styles.legendText, { color: colors.text }]}>API</Text>
                                        <View style={{ width: 12 }} />
                                        <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
                                        <Text style={[styles.legendText, { color: colors.text }]}>AI</Text>
                                    </View>

                                    {/* Değerler */}
                                    <View style={styles.infoRow}>
                                        <Text style={[styles.infoLabel, { color: colors.icon }]}>API Tahmin</Text>
                                        <Text style={[styles.infoValue, { color: colors.text }]}>
                                        {api != null ? `${api.toFixed(1)}°` : '—'}
                                        </Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={[styles.infoLabel, { color: colors.icon }]}>AI Tahmin</Text>
                                        <Text style={[styles.infoValue, { color: colors.text }]}>
                                        {ai != null ? `${ai.toFixed(1)}°` : '—'}
                                        </Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Text style={[styles.infoLabel, { color: colors.icon }]}>AI Başarı</Text>
                                        <Text style={[styles.infoBadge, { borderColor: colors.borderColor, color: colors.text }]}>
                                        {typeof acc === 'number' ? `%${acc.toFixed(0)}` : '—'}
                                        </Text>
                                    </View>

                                    <View style={[styles.infoRow, { marginTop: 8 }]}>
                                        <Text style={[styles.infoLabel, { color: colors.icon }]}>Günlük AI Ortalama</Text>
                                        <Text style={[styles.infoBadge, { borderColor: colors.borderColor, color: colors.text }]}>
                                        {typeof dailyAiAvg === 'number' ? `%${dailyAiAvg.toFixed(0)}` : '—'}
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
                            </Animated.View>
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
                                        setIsAtEndOfScroll(isEnd);
                                        scrollX.current = nativeEvent.contentOffset.x;
                                    }}
                                    scrollEventThrottle={16}
                                    style={styles.chartScrollView}
                                >
                                    {chartData.labels.length > 0 && (
                                        <LineChart
                                            data={chartData} 
                                            width={totalChartWidth} 
                                            height={250} 
                                            chartConfig={chartConfig}
                                            //bezier 
                                            style={styles.chartStyle}
                                            fromZero={false}
                                            segments={4}
                                            onDataPointClick={handleDataPointClick}
                                            withVerticalLabels={true} 
                                            withHorizontalLabels={false}
                                        />
                                    )}
                                </ScrollView>
                            </View>
                            {/* Saat şeridi – tıklanabilir (YENİ) */}
                            <View style={styles.hourStripContainer}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {saatlikVeri.slice(0, forecastHoursToShow).map((h, idx) => {
                                const isSel = selectedHourIndex === idx;
                                return (
                                    <TouchableOpacity
                                    key={idx}
                                    style={[styles.hourChip, isSel && styles.hourChipSelected]}
                                    onPress={() => (isSel ? closeInfo() : openInfo(idx))}
                                    activeOpacity={0.9}
                                    >
                                    <Text style={[styles.hourChipText, isSel && styles.hourChipTextSelected]}>
                                        {idx === 0 ? 'Şimdi' : h.saat}
                                    </Text>
                                    </TouchableOpacity>
                                );
                                })}
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
                            
                            <Animated.Text style={[
                                styles.loadingText, 
                                { color: colors.text, opacity: loadingAnim }
                            ]}>
                                AI Tahmini Yükleniyor...
                            </Animated.Text>
                            
                            <Animated.Text style={[
                                styles.successText, 
                                { color: '#4CAF50', opacity: checkAnim }
                            ]}>
                                Tahmin Hazır!
                            </Animated.Text>
                        </Animated.View>
                    </View>
                </Modal>

                {/* Günlük Tahmin Kartı */}
                <View style={[styles.card, cardStyle, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
                    <Text style={[styles.cardTitle, { color: colors.icon }]}>HAFTALIK TAHMİN</Text>
                    {gunlukVeri.map((item, index) => (
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
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '100%', marginTop: 20, },
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

});