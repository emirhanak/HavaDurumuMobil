import { LineChart } from "react-native-chart-kit";
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Modal, Animated, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Cloud, Thermometer, Droplets, Wind, Eye, Sun, CloudRain } from 'lucide-react-native';
import { useSettings } from '@/context/SettingsContext';
import WeatherAnimation from './WeatherAnimation';
import { LineChartData } from "react-native-chart-kit/dist/line-chart/LineChart";

// --- Interface Tanımlamaları (GÜNCELLENDİ) ---
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
}
interface GunlukTahmin { gun: string; enDusuk: number; enYuksek: number; durumKodu: number; }
interface WeatherData { anlikHavaDurumu: AnlikHavaDurumu; saatlikTahmin: SaatlikTahmin[]; gunlukTahmin: GunlukTahmin[]; }
interface HavaDurumuDetayProps { sehir: Sehir; weatherData: WeatherData | null; }

const { width } = Dimensions.get('window');
const Y_AXIS_WIDTH = 40;

export default function HavaDurumuDetay({ sehir, weatherData }: HavaDurumuDetayProps) {
    const { unit, colors, theme } = useSettings();

    const [modalVisible, setModalVisible] = React.useState(false);
    const [selectedHourIndex, setSelectedHourIndex] = React.useState(0);
    const [tooltipData, setTooltipData] = React.useState<{ x: number, y: number, value: number, index: number } | null>(null);
    const tooltipAnim = React.useRef(new Animated.Value(0)).current;
    const scrollX = React.useRef(0);

    // --- YENİ EKLENEN STATE'LER ---
    const [isAtEndOfScroll, setIsAtEndOfScroll] = React.useState(false);
    const [forecastHoursToShow, setForecastHoursToShow] = React.useState(24);

    if (!weatherData || !sehir || !weatherData.anlikHavaDurumu) return null;

    const anlikVeri = weatherData.anlikHavaDurumu;
    const saatlikVeri = weatherData.saatlikTahmin || [];
    const gunlukVeri = weatherData.gunlukTahmin || [];

    const handleDataPointClick = (data: { value: number; index: number; x: number; y: number; }) => {
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
        { title: 'HİSSEDİLEN', value: `${convertTemperature(anlikVeri.hissedilen)}°`, icon: <Thermometer size={20} color={colors.icon} /> },
        { title: 'NEM', value: `${Math.round(anlikVeri.nem)}%`, icon: <Droplets size={20} color={colors.icon} /> },
        { title: 'RÜZGAR', value: `${anlikVeri.ruzgarHizi.toFixed(1)} km/s`, icon: <Wind size={20} color={colors.icon} /> },
        { title: 'GÖRÜŞ MESAFESİ', value: `${anlikVeri.gorusMesafesi.toFixed(1)} km`, icon: <Eye size={20} color={colors.icon} /> },
    ];

    const cardStyle = theme === 'light' ? styles.cardShadow : {};
    const DATA_POINT_WIDTH = 60;

    // --- GRAFİK VERİ FONKSİYONU GÜNCELLENDİ ---
    const getChartData = (): LineChartData => {
        const emptyData: LineChartData = { labels: [], datasets: [{ data: [] }] };
        if (!saatlikVeri || saatlikVeri.length === 0) return emptyData;

        const dataSlice = saatlikVeri.slice(selectedHourIndex, selectedHourIndex + forecastHoursToShow);

        const anaVeri = dataSlice.map(item => Math.round(item.sicaklik));
        
        const aiVeri = dataSlice.map((item, index) => {
            if (item.aiSicaklikTahmini == null) {
                return null;
            }
            return Math.round(item.aiSicaklikTahmini);
        });
        
        // Kırmızı ve mavi çizgiyi birleştirmek için kesişim noktasını ayarla
        if (forecastHoursToShow > 24 && anaVeri.length > 24 && aiVeri[24] != null) {
            aiVeri[23] = anaVeri[23];
        }
        
        const labels = dataSlice.map((item) => item.saat);

        return {
            labels: labels,
            datasets: [
                { data: anaVeri as number[], color: (opacity = 1) => `rgba(135, 206, 250, ${opacity})`, strokeWidth: 2 },
                { data: aiVeri as number[], color: (opacity = 1) => `rgba(255, 71, 87, ${opacity})`, strokeWidth: 2 }
            ]
        };
    };
    
    const chartConfig = {
        backgroundGradientFrom: colors.cardBackground, 
        backgroundGradientTo: colors.cardBackground, 
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(${theme === 'dark' ? 255 : 0}, ${theme === 'dark' ? 255 : 0}, ${theme === 'dark' ? 255 : 0}, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(${theme === 'dark' ? 255 : 0}, ${theme === 'dark' ? 255 : 0}, ${theme === 'dark' ? 255 : 0}, ${opacity})`,
        style: { borderRadius: 16 }, 
        propsForDots: { r: "5", strokeWidth: "2", stroke: "#ffa726" },
        withVerticalLines: false,
        withHorizontalLines: true,
        fromZero: false,
    };

    const chartData = getChartData();
    const totalChartWidth = Math.max(width - 80, (chartData.labels?.length || 0) * DATA_POINT_WIDTH);
    
    const allTemperatures = saatlikVeri.slice(selectedHourIndex, selectedHourIndex + forecastHoursToShow).map(item => item.sicaklik);
    const minTemp = allTemperatures.length > 0 ? Math.min(...allTemperatures) : 0;
    const maxTemp = allTemperatures.length > 0 ? Math.max(...allTemperatures) : 30;
    
    const updatedChartConfig = { ...chartConfig, segments: 4 };

    const generateYAxisLabels = () => {
        if(minTemp === maxTemp) return [`${Math.round(minTemp)}°`];
        const labels = [];
        const range = maxTemp - minTemp;
        const step = range > 0 ? range / 4 : 1;
        for (let i = 0; i <= 4; i++) {
            labels.push(`${Math.round(maxTemp - (i * step))}°`);
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

                <View style={[styles.card, cardStyle, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
                    <Text style={[styles.cardTitle, { color: colors.icon }]}>SAATLİK TAHMİN</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {saatlikVeri.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.hourlyItem}
                                onPress={() => { setSelectedHourIndex(index); setModalVisible(true); }}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.hourlyTime, { color: colors.icon }]}>{index === 0 ? 'Şimdi' : item.saat}</Text>
                                <View style={styles.hourlyIcon}>{renderWeatherIcon(item.durumKodu, 24)}</View>
                                <Text style={[styles.hourlyTemp, { color: colors.text }]}>{convertTemperature(item.sicaklik)}°</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Sonraki Saatler için Sıcaklık</Text>
                            
                            <View style={styles.chartContainer}>
                                <View style={[styles.yAxisContainer, { width: Y_AXIS_WIDTH }]}>
                                    {yAxisLabels.map((label, index) => (
                                        <View key={index} style={styles.yAxisLabelContainer}><Text style={[styles.yAxisLabel, { color: colors.text }]}>{label}</Text></View>
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
                                    {chartData.labels && chartData.labels.length > 0 && (
                                        <LineChart
                                            data={chartData} width={totalChartWidth} height={250} 
                                            chartConfig={updatedChartConfig} bezier style={styles.chartStyle} 
                                            fromZero={false} segments={4}
                                            onDataPointClick={handleDataPointClick}
                                            withVerticalLabels={true} withHorizontalLabels={false}
                                        />
                                    )}
                                </ScrollView>
                            </View>
                            
                            {/* --- BUTON MANTIĞI GÜNCELLENDİ --- */}
                            <View style={styles.buttonContainer}>
                                {isAtEndOfScroll && forecastHoursToShow < 30 && saatlikVeri.length >= 30 && (
                                    <TouchableOpacity 
                                        style={styles.predictButton}
                                        onPress={() => setForecastHoursToShow(30)}
                                    >
                                        <Text style={styles.predictButtonText}>+6 Saat AI Tahmini</Text>
                                    </TouchableOpacity>
                                )}
                                <Pressable style={[styles.closeButton]} onPress={() => { setTooltipData(null); setModalVisible(false); setForecastHoursToShow(24); setIsAtEndOfScroll(false); }}>
                                    <Text style={[styles.closeButtonText, { color: colors.text }]}>Kapat</Text>
                                </Pressable>
                            </View>

                            {tooltipData && (
                                <Animated.View style={[
                                    styles.tooltipContainer,
                                    { left: tooltipData.x - 25, top: tooltipData.y - 45, opacity: tooltipAnim, transform: [{ scale: tooltipAnim }] }
                                ]}><Text style={styles.tooltipText}>{Math.round(tooltipData.value)}°</Text></Animated.View>
                            )}
                        </View>
                    </View>
                </Modal>
                
                {/* ... (Günlük Tahmin ve Detay Kartları aynı) ... */}
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
    // ... (diğer stiller)
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { borderRadius: 20, paddingVertical: 24, paddingHorizontal: 16, alignItems: 'center', width: '90%' },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    chartContainer: { flexDirection: 'row', alignItems: 'stretch', height: 250, width: '100%', },
    yAxisContainer: { justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 4, paddingTop: 20, paddingBottom: 50, },
    yAxisLabelContainer: { flex: 1, justifyContent: 'center', },
    yAxisLabel: { fontSize: 12, fontWeight: '500', textAlign: 'right', },
    chartScrollView: { flex: 1, },
    chartStyle: { marginVertical: 16, borderRadius: 16 },
    closeButtonText: { fontSize: 16, fontWeight: '600' },
    tooltipContainer: { position: 'absolute', backgroundColor: '#2c3e50', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, zIndex: 20 },
    tooltipText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    // YENİ EKLENEN STİLLER
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        marginTop: 20,
    },
    predictButton: {
        backgroundColor: '#ff4757',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20,
        elevation: 2,
    },
    predictButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    closeButton: {
        borderRadius: 20,
        paddingVertical: 12,
        paddingHorizontal: 30,
        elevation: 2,
    },
});