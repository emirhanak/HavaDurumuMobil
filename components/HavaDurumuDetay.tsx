import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Cloud, Thermometer, Droplets, Wind, Eye, ChartBar as BarChart3, Sun, CloudRain } from 'lucide-react-native';
import { useSettings } from '@/context/SettingsContext';


// --- Interface Tanımlamaları ---
interface Sehir {
  id: string;
  ad: string;
  enlem: number;
  boylam: number;
  sicaklik: number;
}
interface AnlikHavaDurumu {
  sicaklik: number;
  durum: string;
  enYuksek: number;
  enDusuk: number;
  hissedilen: number;
  nem: number;
  ruzgarHizi: number;
  gorusMesafesi: number;
  basinc: number;
}
interface SaatlikTahmin { saat: string; sicaklik: number; durumKodu: number; }
interface GunlukTahmin { gun: string; enDusuk: number; enYuksek: number; durumKodu: number; }
interface WeatherData {
  anlikHavaDurumu: AnlikHavaDurumu;
  saatlikTahmin: SaatlikTahmin[];
  gunlukTahmin: GunlukTahmin[];
}
interface HavaDurumuDetayProps {
    sehir: Sehir;
    weatherData: WeatherData | null;
}

const { width } = Dimensions.get('window');

export default function HavaDurumuDetay({ sehir, weatherData }: HavaDurumuDetayProps) {
  const { unit, colors, theme } = useSettings();

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
  
  if (!weatherData || !sehir || !weatherData.anlikHavaDurumu) {
    return null;
  }
  
  const anlikVeri = weatherData.anlikHavaDurumu;
  const saatlikVeri = weatherData.saatlikTahmin || [];
  const gunlukVeri = weatherData.gunlukTahmin || [];
  
  const detaylar = [
    { title: 'HİSSEDİLEN', value: `${convertTemperature(anlikVeri.hissedilen)}°`, icon: <Thermometer size={20} color={colors.icon} /> },
    { title: 'NEM', value: `${Math.round(anlikVeri.nem)}%`, icon: <Droplets size={20} color={colors.icon} /> },
    { title: 'RÜZGAR', value: `${anlikVeri.ruzgarHizi.toFixed(1)} km/s`, icon: <Wind size={20} color={colors.icon} /> },
    { title: 'GÖRÜŞ MESAFESİ', value: `${anlikVeri.gorusMesafesi.toFixed(1)} km`, icon: <Eye size={20} color={colors.icon} /> },
  ];

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
          <Text style={[styles.anlikSicaklik, { color: colors.text }]}>{convertTemperature(anlikVeri.sicaklik)}°</Text>
          <Text style={[styles.havaDurumu, { color: colors.text }]}>{anlikVeri.durum}</Text>
          <Text style={[styles.yuksekDusukSicaklik, { color: colors.text }]}>
            Y:{convertTemperature(anlikVeri.enYuksek)}° D:{convertTemperature(anlikVeri.enDusuk)}°
          </Text>
        </View>

        <View style={[styles.card, cardStyle, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
          <Text style={[styles.cardTitle, { color: colors.icon }]}>SAATLİK TAHMİN</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hourlyScrollContent}>
            {saatlikVeri.map((item, index) => (
              <View key={index} style={styles.hourlyItem}>
                <Text style={[styles.hourlyTime, { color: colors.icon }]}>{index === 0 ? 'Şimdi' : item.saat}</Text>
                <View style={styles.hourlyIcon}>{renderWeatherIcon(item.durumKodu, 24)}</View>
                <Text style={[styles.hourlyTemp, { color: colors.text }]}>{convertTemperature(item.sicaklik)}°</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={[styles.card, cardStyle, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
          <Text style={[styles.cardTitle, { color: colors.icon }]}>GÜNLÜK TAHMİN</Text>
          <View style={styles.gunlukTahminKapsayici}>
            {gunlukVeri.map((item, index) => (
              <View key={index} style={[styles.gunlukItem, { borderBottomColor: colors.borderColor }]}>
                <View style={styles.gunlukSol}><Text style={[styles.gunText, { color: colors.text }]}>{index === 0 ? 'Bugün' : item.gun.substring(0,3)}</Text><View style={styles.gunlukIcon}>{renderWeatherIcon(item.durumKodu, 20)}</View></View>
                <View style={styles.gunlukSag}><Text style={[styles.gunlukDusukSicaklik, { color: colors.icon }]}>{convertTemperature(item.enDusuk)}°</Text><View style={styles.sicaklikAralikKapsayici}><View style={[styles.sicaklikAralikArkaPlan, {backgroundColor: colors.borderColor}]}/></View><Text style={[styles.gunlukYuksekSicaklik, { color: colors.text }]}>{convertTemperature(item.enYuksek)}°</Text></View>
              </View>
            ))}
          </View>
        </View>

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
    container: { flex: 1 },
    backgroundGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    scrollView: { flex: 1 },
    scrollContent: { paddingBottom: 100, paddingTop: 80 },
    anaHavaBolumu: { alignItems: 'center', paddingHorizontal: 20, marginBottom: 40 },
    sehirAdi: { fontSize: 34, fontWeight: '300' },
    anlikSicaklik: { fontSize: 96, fontWeight: '200' },
    havaDurumu: { fontSize: 20, fontWeight: '400', marginBottom: 8 },
    yuksekDusukSicaklik: { fontSize: 20, fontWeight: '400' },
    card: { 
      marginHorizontal: 20, 
      marginBottom: 20, 
      borderRadius: 16, 
      borderWidth: StyleSheet.hairlineWidth, 
      padding: 15,
    },
    cardShadow: { 
      shadowColor: "#000", 
      shadowOffset: { width: 0, height: 4, }, 
      shadowOpacity: 0.1, 
      shadowRadius: 12, 
      elevation: 5, 
    },
    cardTitle: { 
      fontSize: 13, 
      fontWeight: '600', 
      marginBottom: 12, 
      letterSpacing: 0.5, 
      opacity: 0.8 
    },
    hourlyScrollContent: { paddingBottom: 10 },
    hourlyItem: { alignItems: 'center', marginRight: 25 },
    hourlyTime: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
    hourlyIcon: { height: 32, width: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    hourlyTemp: { fontSize: 20, fontWeight: '600' },
    gunlukTahminKapsayici: { paddingBottom: 8 },
    gunlukItem: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      paddingVertical: 8, 
      borderBottomWidth: StyleSheet.hairlineWidth 
    },
    gunlukSol: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    gunText: { fontSize: 17, fontWeight: '400', width: 50 },
    gunlukIcon: { marginLeft: 12, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
    gunlukSag: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' },
    gunlukDusukSicaklik: { 
      fontSize: 17, 
      fontWeight: '400', 
      width: 35, 
      textAlign: 'right', 
      opacity: 0.8 
    },
    sicaklikAralikKapsayici: { flex: 1, height: 4, borderRadius: 2, marginHorizontal: 12 },
    sicaklikAralikArkaPlan: { flex: 1, borderRadius: 2 },
    sicaklikAralikBar: { position: 'absolute', height: 4, backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 2, top: 0 },
    // EKSİK OLAN VE HATAYA NEDEN OLAN STİL BURAYA EKLENDİ
    gunlukYuksekSicaklik: { 
      fontSize: 17, 
      fontWeight: '400', 
      width: 35, 
      textAlign: 'right' 
    },
    detayKartlarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20, gap: 12 },
    detayKartKapsayici: { width: (width - 52) / 2 },
    detayKart: { padding: 16, alignItems: 'center', height: 120 },
    detayKartIcon: { alignItems: 'center', marginBottom: 8 },
    detayKartBaslik: { fontSize: 13, fontWeight: '600', marginBottom: 4, letterSpacing: 0.5, textAlign: 'center' },
    detayKartDeger: { fontSize: 24, fontWeight: '400', flex: 1, textAlign: 'center' },
});