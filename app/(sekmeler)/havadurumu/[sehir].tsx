import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { Cloud, Thermometer, Droplets, Wind, Eye, ChartBar as BarChart3, Sun, CloudRain, ArrowLeft } from 'lucide-react-native';
import { useSettings } from '@/context/SettingsContext';
import mockHavaVerisi from '@/mocks/mockHavaDetay.json';

// Interface Tanımlamaları
interface HourlyData { time: string; temp: number; icon: keyof typeof iconMap; }
interface DailyData { day: string; icon: keyof typeof iconMapDaily; low: number; high: number; lowPos: number; highPos: number; }
interface DetailData { title: string; value: string; icon: keyof typeof iconMap; }
interface WeatherData {
  location: string;
  currentWeather: { temperature: number; condition: string; high: number; low: number; };
  hourlyForecast: HourlyData[];
  dailyForecast: DailyData[];
  details: DetailData[];
}
const { width } = Dimensions.get('window');

// İkon Haritaları (Component Dışında)
const iconMap = { Cloud, Sun, CloudRain, Thermometer, Droplets, Wind, Eye, BarChart3 };
const iconMapDaily = { Cloud, Sun, CloudRain };

export default function SehirHavaDurumuEkrani() {
  const { sehir } = useLocalSearchParams<{ sehir: string }>();
  const { unit, colors } = useSettings();

  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setWeatherData(mockHavaVerisi as WeatherData);
      setLoading(false);
    }, 1000);
  }, []);

  const convertTemperature = (celsius: number) => {
    if (unit === 'F') return Math.round((celsius * 9/5) + 32);
    return Math.round(celsius);
  };

  const renderIcon = (iconName: keyof typeof iconMap, size: number) => {
    const IconComponent = iconMap[iconName];
    if (!IconComponent) return null;
    return <IconComponent size={size} color={colors.text} />;
  }
  const renderDailyIcon = (iconName: keyof typeof iconMapDaily, size: number) => {
    const IconComponent = iconMapDaily[iconName];
    if (!IconComponent) return null;
    return <IconComponent size={size} color={colors.text} />;
  }

  if (loading || !weatherData) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.text} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Hava durumu yükleniyor...</Text>
      </View>
    );
  }
  
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={colors.background === '#1E1E1E' ? ['#1e3c72', '#2a5298', '#4c6ef5'] : ['#87CEEB', '#B0E0E6']}
          style={styles.backgroundGradient}
        />
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.anaHavaBolumu}>
            <Text style={[styles.sehirAdi, { color: colors.text }]}>{sehir || weatherData.location}</Text>
            <Text style={[styles.anlikSicaklik, { color: colors.text }]}>{convertTemperature(weatherData.currentWeather.temperature)}°</Text>
            <Text style={[styles.havaDurumu, { color: colors.text }]}>{weatherData.currentWeather.condition}</Text>
            <Text style={[styles.yuksekDusukSicaklik, { color: colors.text }]}>
              Y:{convertTemperature(weatherData.currentWeather.high)}° D:{convertTemperature(weatherData.currentWeather.low)}°
            </Text>
          </View>
          <View style={styles.cardContainer}>
            <BlurView intensity={80} style={[styles.blurCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
              <Text style={[styles.cardTitle, { color: colors.icon }]}>SAATLİK HAVA DURUMU</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hourlyScrollContent}>
                {weatherData.hourlyForecast.map((item, index) => (
                  <View key={index} style={styles.hourlyItem}>
                    <Text style={[styles.hourlyTime, { color: colors.icon }]}>{item.time}</Text>
                    <View style={styles.hourlyIcon}>{renderIcon(item.icon, 24)}</View>
                    <Text style={[styles.hourlyTemp, { color: colors.text }]}>{convertTemperature(item.temp)}°</Text>
                  </View>
                ))}
              </ScrollView>
            </BlurView>
          </View>
          <View style={styles.cardContainer}>
             <BlurView intensity={80} style={[styles.blurCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
              <Text style={[styles.cardTitle, { color: colors.icon }]}>GÜNLÜK TAHMİN</Text>
              <View style={styles.gunlukTahminKapsayici}>
                {weatherData.dailyForecast.map((item, index) => (
                  <View key={index} style={[styles.gunlukItem, { borderBottomColor: colors.borderColor }]}>
                    <View style={styles.gunlukSol}><Text style={[styles.gunText, {color: colors.text}]}>{item.day}</Text><View style={styles.gunlukIcon}>{renderDailyIcon(item.icon, 20)}</View></View>
                    <View style={styles.gunlukSag}><Text style={[styles.gunlukDusukSicaklik, {color: colors.icon}]}>{convertTemperature(item.low)}°</Text><View style={styles.sicaklikAralikKapsayici}><View style={[styles.sicaklikAralikArkaPlan, {backgroundColor: colors.borderColor}]}><View style={[styles.sicaklikAralikBar, {left: `${item.lowPos}%`, right: `${100 - item.highPos}%`}]}/></View></View><Text style={[styles.gunlukYuksekSicaklik, {color: colors.text}]}>{convertTemperature(item.high)}°</Text></View>
                  </View>
                ))}
              </View>
            </BlurView>
          </View>
          <View style={styles.detayKartlarGrid}>
            {weatherData.details.map((item, index) => (
              <View key={index} style={styles.detayKartKapsayici}>
                <BlurView intensity={80} style={[styles.detayKart, {backgroundColor: colors.cardBackground, borderColor: colors.borderColor}]}>
                  <View style={styles.detayKartIcon}>{renderIcon(item.icon, 20)}</View>
                  <Text style={[styles.detayKartBaslik, {color: colors.icon}]}>{item.title}</Text>
                  <Text style={[styles.detayKartDeger, {color: colors.text}]}>{item.title === 'HİSSEDİLEN' ? `${convertTemperature(parseInt(item.value))}°` : item.value}</Text>
                </BlurView>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16 },
  backButton: { position: 'absolute', top: 60, left: 10, zIndex: 10, padding: 10, borderRadius: 20 },
  container: { flex: 1 },
  backgroundGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  anaHavaBolumu: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 20, marginBottom: 40 },
  sehirAdi: { fontSize: 34, fontWeight: '300', marginBottom: 8 },
  anlikSicaklik: { fontSize: 96, fontWeight: '200', marginBottom: 4 },
  havaDurumu: { fontSize: 20, fontWeight: '400', marginBottom: 8 },
  yuksekDusukSicaklik: { fontSize: 20, fontWeight: '400' },
  cardContainer: { marginHorizontal: 20, marginBottom: 20 },
  blurCard: { borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  cardTitle: { fontSize: 13, fontWeight: '600', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, letterSpacing: 0.5 },
  hourlyScrollView: { paddingLeft: 20, paddingRight: 0 },
  hourlyScrollContent: { paddingRight: 20, paddingBottom: 10 },
  hourlyItem: { alignItems: 'center', marginRight: 20, width: 44 },
  hourlyTime: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  hourlyIcon: { height: 32, width: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  hourlyTemp: { fontSize: 20, fontWeight: '600' },
  gunlukTahminKapsayici: { paddingHorizontal: 20, paddingBottom: 8 },
  gunlukItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  gunlukSol: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  gunText: { fontSize: 17, fontWeight: '400', width: 50 },
  gunlukIcon: { marginLeft: 12, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  gunlukSag: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
  gunlukDusukSicaklik: { fontSize: 17, fontWeight: '400', width: 35, textAlign: 'right' },
  sicaklikAralikKapsayici: { width: 80, height: 20, justifyContent: 'center', marginHorizontal: 12 },
  sicaklikAralikArkaPlan: { height: 4, borderRadius: 2, position: 'relative' },
  sicaklikAralikBar: { position: 'absolute', height: 4, backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 2, top: 0 },
  gunlukYuksekSicaklik: { fontSize: 17, fontWeight: '400', width: 35, textAlign: 'right' },
  detayKartlarGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12 },
  detayKartKapsayici: { width: (width - 52) / 2 },
  detayKart: { borderRadius: 16, padding: 16, height: 120, borderWidth: 1 },
  detayKartIcon: { alignItems: 'center', marginBottom: 8 },
  detayKartBaslik: { fontSize: 13, fontWeight: '600', marginBottom: 4, letterSpacing: 0.5, textAlign: 'center' },
  detayKartDeger: { fontSize: 24, fontWeight: '400', flex: 1, textAlign: 'center' },
});