import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Cloud, Thermometer, Droplets, Wind, Eye, ChartBar as BarChart3, Sun, CloudRain } from 'lucide-react-native';
import { useSettings } from '@/context/SettingsContext';

// --- Interface Tanımları ---
interface Sehir {
  id: string;
  ad: string;
  enlem: number;
  boylam: number;
  sicaklik: number;
}
interface WeatherData {
  location: string;
  currentWeather: { temperature: number; condition: string; high: number; low: number; };
  hourlyForecast: { time: string; temp: number; icon: keyof typeof iconMap; }[];
  dailyForecast: { day: string; icon: keyof typeof iconMapDaily; low: number; high: number; lowPos: number; highPos: number; }[];
  details: { title: string; value: string; icon: keyof typeof iconMap; }[];
}
interface HavaDurumuDetayProps {
    sehir: Sehir;
    weatherData: WeatherData | null;
}

const { width } = Dimensions.get('window');
const iconMap = { Cloud, Sun, CloudRain, Thermometer, Droplets, Wind, Eye, BarChart3 };
const iconMapDaily = { Cloud, Sun, CloudRain };

export default function HavaDurumuDetay({ sehir, weatherData }: HavaDurumuDetayProps) {
  const { unit, colors, theme } = useSettings();

  const convertTemperature = (celsius: number) => {
    if (unit === 'F') return Math.round((celsius * 9 / 5) + 32);
    return Math.round(celsius);
  };

  const renderIcon = (iconName: keyof typeof iconMap, size: number) => {
    const IconComponent = iconMap[iconName];
    if (!IconComponent) return null;
    return <IconComponent size={size} color={colors.text} />;
  };

  const renderDailyIcon = (iconName: keyof typeof iconMapDaily, size: number) => {
    const IconComponent = iconMapDaily[iconName];
    if (!IconComponent) return null;
    return <IconComponent size={size} color={colors.text} />;
  };

  if (!weatherData || !sehir) {
    return null;
  }
  
  // Açık tema için gölge efekti, koyu tema için sadece kenarlık
  const cardStyle = theme === 'light' ? styles.cardShadow : {};

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={theme === 'dark' ? ['#1e3c72', '#2a5298', '#4c6ef5'] : ['#87CEEB', '#B0E0E6']}
        style={styles.backgroundGradient}
      />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.anaHavaBolumu}>
          <Text style={[styles.sehirAdi, { color: colors.text }]}>{sehir.ad}</Text>
          <Text style={[styles.anlikSicaklik, { color: colors.text }]}>{convertTemperature(weatherData.currentWeather.temperature)}°</Text>
          <Text style={[styles.havaDurumu, { color: colors.text }]}>{weatherData.currentWeather.condition}</Text>
          <Text style={[styles.yuksekDusukSicaklik, { color: colors.text }]}>
            Y:{convertTemperature(weatherData.currentWeather.high)}° D:{convertTemperature(weatherData.currentWeather.low)}°
          </Text>
        </View>

        <View style={[styles.card, cardStyle, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
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
        </View>

        <View style={[styles.card, cardStyle, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
          <Text style={[styles.cardTitle, { color: colors.icon }]}>GÜNLÜK TAHMİN</Text>
          <View style={styles.gunlukTahminKapsayici}>
            {weatherData.dailyForecast.map((item, index) => (
              <View key={index} style={[styles.gunlukItem, { borderBottomColor: colors.borderColor }]}>
                <View style={styles.gunlukSol}><Text style={[styles.gunText, { color: colors.text }]}>{item.day}</Text><View style={styles.gunlukIcon}>{renderDailyIcon(item.icon, 20)}</View></View>
                <View style={styles.gunlukSag}><Text style={[styles.gunlukDusukSicaklik, { color: colors.icon }]}>{convertTemperature(item.low)}°</Text><View style={styles.sicaklikAralikKapsayici}><View style={[styles.sicaklikAralikArkaPlan, { backgroundColor: colors.borderColor }]}><View style={[styles.sicaklikAralikBar, { left: `${item.lowPos}%`, right: `${100 - item.highPos}%` }]} /></View></View><Text style={[styles.gunlukYuksekSicaklik, { color: colors.text }]}>{convertTemperature(item.high)}°</Text></View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.detayKartlarGrid}>
          {weatherData.details.map((item, index) => (
            <View key={index} style={styles.detayKartKapsayici}>
              <View style={[styles.card, styles.detayKart, cardStyle, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
                <View style={styles.detayKartIcon}>{renderIcon(item.icon, 20)}</View>
                <Text style={[styles.detayKartBaslik, { color: colors.icon }]}>{item.title}</Text>
                <Text style={[styles.detayKartDeger, { color: colors.text }]}>{item.title === 'HİSSEDİLEN' ? `${convertTemperature(parseInt(item.value))}°` : item.value}</Text>
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
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100, paddingTop: 60 },
  anaHavaBolumu: { alignItems: 'center', paddingHorizontal: 20, marginBottom: 40 },
  sehirAdi: { fontSize: 34, fontWeight: '300' },
  anlikSicaklik: { fontSize: 96, fontWeight: '200' },
  havaDurumu: { fontSize: 20, fontWeight: '400', marginBottom: 8 },
  yuksekDusukSicaklik: { fontSize: 20, fontWeight: '400' },
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 0,
  },
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    letterSpacing: 0.5,
  },
  hourlyScrollContent: { paddingHorizontal: 20, paddingBottom: 10 },
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
  detayKart: { padding: 16, alignItems: 'center', height: 120 },
  detayKartIcon: { marginBottom: 8 },
  detayKartBaslik: { fontSize: 13, fontWeight: '600', marginBottom: 4, letterSpacing: 0.5, textAlign: 'center' },
  detayKartDeger: { fontSize: 24, fontWeight: '400', flex: 1, textAlign: 'center' },
});