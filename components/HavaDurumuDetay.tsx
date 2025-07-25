import { LineChart } from "react-native-chart-kit";
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Modal, Animated, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Cloud, Thermometer, Droplets, Wind, Eye, Sun, CloudRain } from 'lucide-react-native';
import { useSettings } from '@/context/SettingsContext';
import WeatherAnimation from './WeatherAnimation';

// --- Interface Tanımlamaları (Değişiklik yok) ---
interface Sehir { id: string; ad: string; enlem: number; boylam: number; sicaklik: number; }
interface AnlikHavaDurumu { sicaklik: number; durum: string; enYuksek: number; enDusuk: number; hissedilen: number; nem: number; ruzgarHizi: number; gorusMesafesi: number; basinc: number; durumKodu: number; }
interface SaatlikTahmin { saat: string; sicaklik: number; durumKodu: number; }
interface GunlukTahmin { gun: string; enDusuk: number; enYuksek: number; durumKodu: number; }
interface WeatherData { anlikHavaDurumu: AnlikHavaDurumu; saatlikTahmin: SaatlikTahmin[]; gunlukTahmin: GunlukTahmin[]; }
interface HavaDurumuDetayProps { sehir: Sehir; weatherData: WeatherData | null; }

const { width } = Dimensions.get('window');
const MODAL_HORIZONTAL_PADDING = 16;
const CHART_LEFT_PADDING = 16;
const Y_AXIS_WIDTH = 40; // Y ekseni için sabit alan

export default function HavaDurumuDetay({ sehir, weatherData }: HavaDurumuDetayProps) {
    const { unit, colors, theme } = useSettings();

    const [modalVisible, setModalVisible] = React.useState(false);
    const [selectedHourIndex, setSelectedHourIndex] = React.useState(0);
    
    const [tooltipData, setTooltipData] = React.useState<{ x: number, y: number, value: number, index: number } | null>(null);
    const tooltipAnim = React.useRef(new Animated.Value(0)).current;
    const scrollX = React.useRef(0);

    if (!weatherData || !sehir || !weatherData.anlikHavaDurumu) return null;

    const anlikVeri = weatherData.anlikHavaDurumu;
    const saatlikVeri = weatherData.saatlikTahmin || [];
    const gunlukVeri = weatherData.gunlukTahmin || [];

    const handleDataPointClick = (data: { value: number; index: number; x: number; y: number; }) => {
        // X koordinatını scroll offset'i ve sabit y ekseni alanını dikkate alarak düzelt
        const correctedX = data.x - scrollX.current + Y_AXIS_WIDTH;
        const newData = { ...data, x: correctedX };

        if (tooltipData && tooltipData.index === data.index) {
            Animated.timing(tooltipAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setTooltipData(null));
        } else {
            setTooltipData(newData);
            Animated.spring(tooltipAnim, { toValue: 1, friction: 7, useNativeDriver: true }).start();
        }
    };

    const convertTemperature = (celsius: number) => {
        if (celsius === null || celsius === undefined) return '--';
        if (unit === 'F') return Math.round((celsius * 9 / 5) + 32);
        return Math.round(celsius);
    };

    const renderWeatherIcon = (code: number, size: number) => {
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
        { title: 'HİSSEDİLEN', value: `${convertTemperature(anlikVeri.hissedilen)}°`, icon: <Thermometer size={20} color={colors.icon} /> },
        { title: 'NEM', value: `${Math.round(anlikVeri.nem)}%`, icon: <Droplets size={20} color={colors.icon} /> },
        { title: 'RÜZGAR', value: `${anlikVeri.ruzgarHizi.toFixed(1)} km/s`, icon: <Wind size={20} color={colors.icon} /> },
        { title: 'GÖRÜŞ MESAFESİ', value: `${anlikVeri.gorusMesafesi.toFixed(1)} km`, icon: <Eye size={20} color={colors.icon} /> },
    ];

    const cardStyle = theme === 'light' ? styles.cardShadow : {};
    const DATA_POINT_WIDTH = 60;

    const getChartData = () => {
        if (saatlikVeri.length === 0) return { labels: [], datasets: [{ data: [] }] };
        
        const now = new Date();
        const currentHour = now.getHours();
        const dataSlice = saatlikVeri.slice(0, 24);
        
        const labels = dataSlice.map((_, index) => {
            const displayHour = (currentHour + index) % 24;
            return index === 0 ? 'Şimdi' : `${displayHour.toString().padStart(2, '0')}:00`;
        });
        
        return {
            labels: labels,
            datasets: [{
                data: dataSlice.map(item => Math.round(item.sicaklik)),
                color: (opacity = 1) => `rgba(135, 206, 250, ${opacity})`,
                strokeWidth: 3
            }]
        };
    };

    const chartConfig = {
        backgroundGradientFrom: colors.cardBackground, 
        backgroundGradientTo: colors.cardBackground, 
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(${theme === 'dark' ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(${theme === 'dark' ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
        style: { borderRadius: 16 }, 
        propsForDots: { r: "5", strokeWidth: "2", stroke: "#ffa726" },
        // Y ekseni etiketlerini göster
        formatYLabel: (value: string) => `${value}°`,
        // Y ekseni çizgilerini göster
        withVerticalLines: false,
        withHorizontalLines: true,
        // Y ekseni için minimum ve maksimum değerleri ayarla
        fromZero: false,
    };

    const chartData = getChartData();
    const totalChartWidth = Math.max(width - 80, chartData.labels.length * DATA_POINT_WIDTH);

    // Y ekseni için sıcaklık değerlerini hesapla
    const temperatures = chartData.datasets[0]?.data || [];
    const minTemp = temperatures.length > 0 ? Math.min(...temperatures) : 0;
    const maxTemp = temperatures.length > 0 ? Math.max(...temperatures) : 30;
    
    // ChartConfig'i güncelle - min ve max değerleri ayarla
    const updatedChartConfig = {
        ...chartConfig,
        // Grafik aralığını belirle
        segments: 4, // 5 etiket için 4 segment
    };

    // Y ekseni etiketlerini oluştur - gerçek min/max değerleri kullan
    const generateYAxisLabels = () => {
        const labels = [];
        const step = (maxTemp - minTemp) / 4; // 5 etiket için 4 eşit aralık
        
        for (let i = 0; i <= 4; i++) {
            const temp = maxTemp - (i * step); // Yukarıdan aşağıya
            labels.push(`${Math.round(temp)}°`);
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
                    <Text style={[styles.anlikSicaklik, { color: colors.text }]}>{convertTemperature(anlikVeri.sicaklik)}°</Text>
                    <Text style={[styles.havaDurumu, { color: colors.text, marginBottom: 8 }]}>{anlikVeri.durum} · Hissedilen: {convertTemperature(anlikVeri.hissedilen)}°</Text>
                    <Text style={[styles.yuksekDusukSicaklik, { color: colors.text }]}>Y:{convertTemperature(anlikVeri.enYuksek)}° D:{convertTemperature(anlikVeri.enDusuk)}°</Text>
                </View>

                {/* SAATLİK TAHMİN BÖLÜMÜ */}
                <View style={[styles.card, cardStyle, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
                    <Text style={[styles.cardTitle, { color: colors.icon }]}>SAATLİK TAHMİN</Text>
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false} 
                        contentContainerStyle={styles.hourlyScrollContent}
                        contentOffset={{x: 0, y: 0}}
                    >
                        {saatlikVeri.map((item, index) => {
                            const now = new Date();
                            const currentHour = now.getHours();
                            const displayHour = (currentHour + index) % 24;
                            const isCurrentHour = index === 0;
                            const displayTime = isCurrentHour ? 'Şimdi' : `${displayHour.toString().padStart(2, '0')}:00`;
                            
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.hourlyItem}
                                    onPress={() => {
                                        setSelectedHourIndex(index);
                                        setModalVisible(true);
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.hourlyTime, { color: colors.icon }]}>
                                        {displayTime}
                                    </Text>
                                    <View style={styles.hourlyIcon}>
                                        {renderWeatherIcon(item.durumKodu, 24)}
                                    </View>
                                    <Text style={[styles.hourlyTemp, { color: colors.text }]}>
                                        {convertTemperature(item.sicaklik)}°
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* GRAFİK MODAL - Y EKSENİ SABİTLENMİŞ */}
                <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Sonraki Saatler için Sıcaklık</Text>
                            
                            {/* Y Ekseni Sabitlenmiş Grafik Konteyner */}
                            <View style={styles.chartContainer}>
                                {/* Sabit Y Ekseni */}
                                <View style={[styles.yAxisContainer, { width: Y_AXIS_WIDTH }]}>
                                    {yAxisLabels.map((label, index) => (
                                        <View key={index} style={styles.yAxisLabelContainer}>
                                            <Text style={[styles.yAxisLabel, { color: colors.text }]}>{label}</Text>
                                        </View>
                                    ))}
                                </View>
                                
                                {/* Kaydırılabilir Grafik Alanı */}
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ paddingHorizontal: 0 }}
                                    onScroll={e => {
                                        scrollX.current = e.nativeEvent.contentOffset.x;
                                    }}
                                    scrollEventThrottle={16}
                                    style={styles.chartScrollView}
                                >
                                    {chartData.labels.length > 0 && (
                                        <LineChart
                                            data={chartData} 
                                            width={totalChartWidth} 
                                            height={250} 
                                            chartConfig={updatedChartConfig} 
                                            bezier
                                            style={styles.chartStyle} 
                                            yAxisSuffix=""
                                            fromZero={false}
                                            segments={4}
                                            onDataPointClick={handleDataPointClick}
                                            withVerticalLabels={true}
                                            withHorizontalLabels={false}
                                        />
                                    )}
                                </ScrollView>
                            </View>
                            
                            {tooltipData && (
                                <Animated.View style={[
                                    styles.tooltipContainer,
                                    {
                                        left: tooltipData.x - 25,
                                        top: tooltipData.y - 45,
                                        opacity: tooltipAnim,
                                        transform: [{ scale: tooltipAnim }]
                                    }
                                ]}>
                                    <Text style={styles.tooltipText}>{Math.round(tooltipData.value)}°</Text>
                                </Animated.View>
                            )}
                            
                            <Pressable style={[styles.closeButton, { backgroundColor: colors.background }]} onPress={() => {
                                setTooltipData(null);
                                setModalVisible(false);
                            }}>
                                <Text style={[styles.closeButtonText, { color: colors.text }]}>Kapat</Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>

                {/* GÜNLÜK TAHMİN */}
                <View style={[styles.card, cardStyle, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
                    <Text style={[styles.cardTitle, { color: colors.icon }]}>GÜNLÜK TAHMİN</Text>
                    {gunlukVeri.map((item, index) => (
                        <View key={index} style={[styles.gunlukItem, { borderBottomColor: colors.borderColor }]}>
                            <View style={styles.gunlukSol}>
                                <Text style={[styles.gunText, { color: colors.text }]}>{index === 0 ? 'Bugün' : gunKisaltma(item.gun)}</Text>
                                <View style={styles.gunlukIcon}>{renderWeatherIcon(item.durumKodu, 20)}</View>
                            </View>
                            <View style={styles.gunlukSag}>
                                <Text style={[styles.gunlukDusukSicaklik, { color: colors.icon }]}>{convertTemperature(item.enDusuk)}°</Text>
                                <View style={styles.sicaklikAralikKapsayici}><View style={[styles.sicaklikAralikArkaPlan, { backgroundColor: colors.borderColor }]} /></View>
                                <Text style={[styles.gunlukYuksekSicaklik, { color: colors.text }]}>{convertTemperature(item.enYuksek)}°</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* DETAY KARTLARI */}
                <View style={styles.detayKartlarGrid}>
                    {detaylar.map((item, index) => (
                        <View key={index} style={styles.detayKartKapsayici}>
                            <View style={[styles.card, styles.detayKart, cardStyle, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
                                <View style={styles.detayKartIcon}>{item.icon}</View>
                                <Text style={[styles.detayKartBaslik, { color: colors.icon }]}>{item.title}</Text>
                                <Text style={[styles.detayKartDeger, { color: colors.text }]}>{item.value}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8' },
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
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { borderRadius: 20, paddingVertical: 24, paddingHorizontal: MODAL_HORIZONTAL_PADDING, alignItems: 'center', width: '90%', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    
    // YENİ STILLER - Y EKSENİ SABİTLEME İÇİN
    chartContainer: {
        flexDirection: 'row',
        alignItems: 'stretch',
        height: 250,
        width: '100%',
    },
    yAxisContainer: {
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingRight: 4,
        paddingTop: 20,
        paddingBottom: 50,
    },
    yAxisLabelContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    yAxisLabel: {
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'right',
    },
    chartScrollView: {
        flex: 1,
    },
    
    chartStyle: { marginVertical: 16, borderRadius: 16 },
    closeButton: { marginTop: 20, borderRadius: 20, paddingVertical: 12, paddingHorizontal: 30, elevation: 2 },
    closeButtonText: { fontSize: 16, fontWeight: '600' },
    tooltipContainer: { position: 'absolute', backgroundColor: '#2c3e50', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
    tooltipText: { color: 'white', fontWeight: 'bold', fontSize: 14, },
});