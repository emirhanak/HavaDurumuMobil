import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Modal, PanResponder, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Cloud, Thermometer, Droplets, Wind, Eye, Sun, CloudRain } from 'lucide-react-native';
import Svg, { G, Circle, Text as SvgText, Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
// import Animated, { useSharedValue, useAnimatedProps, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { useSettings } from '@/context/SettingsContext';
import dayjs from 'dayjs';

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
  durumKodu: number; // eklendi
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
  if (!weatherData || !sehir || !weatherData.anlikHavaDurumu) return null;
  const saatlikVeri = weatherData.saatlikTahmin || [];

  // --- Şu anki saate en yakın index'i bulma fonksiyonu ---
  function getClosestHourIndex(): number {
    const now = dayjs();
    let minDiff = 9999;
    let minIdx = 0;
    for (let i = 0; i < saatlikVeri.length; i++) {
      // saatlikVeri[i].saat formatı 'HH:mm' veya 'HH' olabilir
      const hourStr = saatlikVeri[i].saat.length === 2 ? saatlikVeri[i].saat + ':00' : saatlikVeri[i].saat;
      const tahminTime = dayjs(now.format('YYYY-MM-DD') + 'T' + hourStr);
      let diff = Math.abs(now.diff(tahminTime, 'minute'));
      if (diff < minDiff) {
        minDiff = diff;
        minIdx = i;
      }
    }
    return minIdx;
  }

  // --- Çark state'leri ---
  const [modalVisible, setModalVisible] = React.useState(false);
  const [rotation, setRotation] = React.useState(0);
  const rotationValue = React.useRef(new Animated.Value(0)).current;
  const rotationRef = React.useRef(0);
  const lastRotation = React.useRef(0);
  const currentRotationRef = React.useRef(0);
  const rotationAtPanStart = React.useRef(0);
  const touchAngleAtPanStart = React.useRef(0);
  // Açısal farkı -180 ile +180 arasında normalize eden fonksiyon
  function angleDiff(a: number, b: number) {
    let diff = (a - b + 180) % 360 - 180;
    return diff < -180 ? diff + 360 : diff;
  }
  // İki açı arasındaki farkı -180 ile +180 arasında normalize eden fonksiyon
  function normalizeDeltaAngle(a: number, b: number) {
    let delta = a - b;
    while (delta > 180) delta -= 360;
    while (delta < -180) delta += 360;
    return delta;
  }
  // Saat açılarının hesaplanması ve seçili saat
  const slice = 360 / saatlikVeri.length;
  const saatAcilari = saatlikVeri.map((_, i) => i * slice - 90);
  function getClosestIndex(rot: number) {
    let minDiff = 9999;
    let minIdx = 0;
    for (let i = 0; i < saatAcilari.length; i++) {
      let diff = Math.abs(angleDiff(rot % 360, saatAcilari[i] % 360));
      if (diff < minDiff) {
        minDiff = diff;
        minIdx = i;
      }
    }
    return minIdx;
  }
  // --- Seçili saat state'i ---
  const [selectedHour, setSelectedHour] = React.useState(() => getClosestIndex(-rotation));
  const secili = saatlikVeri[selectedHour];
  // Seçili saat animasyonu için
  const [infoScale, setInfoScale] = React.useState(1);
  const infoScaleValue = React.useRef(new Animated.Value(1)).current;
  // Son seçili saat index'ini takip et
  const lastSelectedHour = React.useRef(selectedHour);

  // Pan gesture: çarkı serbestçe döndür, bırakınca snaple
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        const { x0, y0 } = gestureState;
        const centerX = 130;
        const centerY = 130;
        const touchAngle = Math.atan2(y0 - centerY, x0 - centerX) * 180 / Math.PI;
        rotationAtPanStart.current = rotationRef.current;
        touchAngleAtPanStart.current = touchAngle;
        // LOG: Pan start
        console.log('PanStart:', { rotationAtPanStart: rotationAtPanStart.current, touchAngleAtPanStart: touchAngle });
      },
      onPanResponderMove: (evt, gestureState) => {
        const { moveX, moveY } = gestureState;
        const centerX = 130;
        const centerY = 130;
        const currentTouchAngle = Math.atan2(moveY - centerY, moveX - centerX) * 180 / Math.PI;
        const gain = 2.5;
        let delta = normalizeDeltaAngle(currentTouchAngle, touchAngleAtPanStart.current);
        let newRotation = rotationAtPanStart.current + gain * delta;
        setRotation(newRotation);
        rotationValue.setValue(newRotation);
        // Pan sırasında seçili saat anlık güncellensin
        const idx = getClosestIndex(-newRotation);
        if (idx !== lastSelectedHour.current) {
          setSelectedHour(idx);
          lastSelectedHour.current = idx;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          Animated.sequence([
            Animated.timing(infoScaleValue, { toValue: 1.08, duration: 80, useNativeDriver: true }),
            Animated.timing(infoScaleValue, { toValue: 1, duration: 80, useNativeDriver: true })
          ]).start();
        }
        currentRotationRef.current = newRotation;
        // LOG: Pan move
        console.log('PanMove:', { newRotation, rotationAtPanStart: rotationAtPanStart.current, currentTouchAngle, touchAngleAtPanStart: touchAngleAtPanStart.current, delta, idx, saat: saatlikVeri[idx]?.saat });
      },
      onPanResponderRelease: () => {
        const lastRot = currentRotationRef.current;
        const idx = getClosestIndex(-lastRot);
        const snapped = -saatAcilari[idx];
        setRotation(snapped);
        rotationValue.setValue(snapped);
        setSelectedHour(idx);
        lastSelectedHour.current = idx;
        // LOG: Snap bırakınca
        console.log('Snap:', { lastRot, idx, saat: saatlikVeri[idx]?.saat, saatAci: saatAcilari[idx], snapped });
        Animated.spring(rotationValue, { toValue: snapped, useNativeDriver: true, damping: 10, stiffness: 120, mass: 0.5 }).start();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Animated.sequence([
          Animated.timing(infoScaleValue, { toValue: 1.08, duration: 80, useNativeDriver: true }),
          Animated.timing(infoScaleValue, { toValue: 1, duration: 80, useNativeDriver: true })
        ]).start();
      },
    })
  ).current;

  // Modal açıldığında şu anki saate en yakın index'e snaple
  React.useEffect(() => {
    if (modalVisible && saatlikVeri.length > 0) {
      const idx = getClosestHourIndex();
      const snapped = -saatAcilari[idx];
      setRotation(snapped);
      rotationValue.setValue(snapped);
      setSelectedHour(idx);
    }
  }, [modalVisible, saatlikVeri.length]);

  // rotation güncellendiğinde rotationRef de güncellensin
  React.useEffect(() => {
    rotationValue.setValue(rotation);
    rotationRef.current = rotation;
  }, [rotation]);

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

  // ✅ GÜN KISALTMALARINI BURADA TANIMLIYORUZ
  const gunKisaltma = (gun: string) => {
    const map: Record<string, string> = {
      'Pazartesi': 'Pts',
      'Salı': 'Sal',
      'Çarşamba': 'Çrş',
      'Perşembe': 'Prş',
      'Cuma': 'Cum',
      'Cumartesi': 'Cts',
      'Pazar': 'Paz',
    };
    return map[gun] || gun.substring(0, 3);
  };

  if (!weatherData || !sehir || !weatherData.anlikHavaDurumu) return null;

  const anlikVeri = weatherData.anlikHavaDurumu;
  const gunlukVeri = weatherData.gunlukTahmin || [];

  const detaylar = [
    { title: 'HİSSEDİLEN', value: `${convertTemperature(anlikVeri.hissedilen)}°`, icon: <Thermometer size={20} color={colors.icon} /> },
    { title: 'NEM', value: `${Math.round(anlikVeri.nem)}%`, icon: <Droplets size={20} color={colors.icon} /> },
    { title: 'RÜZGAR', value: `${anlikVeri.ruzgarHizi.toFixed(1)} km/s`, icon: <Wind size={20} color={colors.icon} /> },
    { title: 'GÖRÜŞ MESAFESİ', value: `${anlikVeri.gorusMesafesi.toFixed(1)} km`, icon: <Eye size={20} color={colors.icon} /> },
  ];

  const cardStyle = theme === 'light' ? styles.cardShadow : {};

  // Güneş animasyonu için state ve efekt
  const sunRotate = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    if (weatherData.anlikHavaDurumu.durumKodu === 1000 || weatherData.anlikHavaDurumu.durumKodu === 1100) {
      Animated.loop(
        Animated.timing(sunRotate, {
          toValue: 1,
          duration: 6000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      sunRotate.stopAnimation();
      sunRotate.setValue(0);
    }
  }, [weatherData.anlikHavaDurumu.durumKodu]);

  const sunSpin = sunRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={theme === 'dark' ? ['#1e3c72', '#2a5298', '#4c6ef5'] : ['#87CEEB', '#B0E0E6']}
        style={styles.backgroundGradient}
      />
      {/* Güneşli havada sol üstte animasyonlu güneş */}
      {(weatherData.anlikHavaDurumu.durumKodu === 1000 || weatherData.anlikHavaDurumu.durumKodu === 1100) && (
        <Animated.View style={{
          position: 'absolute',
          top: 32,
          left: 24,
          zIndex: 20,
          shadowColor: '#FFD700',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.7,
          shadowRadius: 24,
          elevation: 12,
          transform: [{ rotate: sunSpin }],
        }}>
          <Sun size={54} color={'#FFD700'} />
        </Animated.View>
      )}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.anaHavaBolumu}>
          <Text style={[styles.sehirAdi, { color: colors.text }]}>{sehir.ad}</Text>
          <Text style={[styles.anlikSicaklik, { color: colors.text }]}>{convertTemperature(anlikVeri.sicaklik)}°</Text>
          <Text style={[styles.havaDurumu, { color: colors.text }]}>{anlikVeri.durum}</Text>
          <Text style={[styles.yuksekDusukSicaklik, { color: colors.text }]}>
            Y:{convertTemperature(anlikVeri.enYuksek)}° D:{convertTemperature(anlikVeri.enDusuk)}°
          </Text>
        </View>

        {/* Saatlik Tahmin */}
        <View style={[styles.card, cardStyle, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
          <Text style={[styles.cardTitle, { color: colors.icon }]}>SAATLİK TAHMİN</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hourlyScrollContent}>
            {saatlikVeri.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.hourlyItem}
                onPress={() => {
                  setSelectedHour(index);
                  setModalVisible(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.hourlyTime, { color: colors.icon }]}>{index === 0 ? 'Şimdi' : item.saat}</Text>
                <View style={styles.hourlyIcon}>{renderWeatherIcon(item.durumKodu, 24)}</View>
                <Text style={[styles.hourlyTemp, { color: colors.text }]}>{convertTemperature(item.sicaklik)}°</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {/* Modal ve Çark */}
        <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={{ color: colors.text, fontSize: 18, marginBottom: 12 }}>Saatlik Tahmin Çarkı</Text>
              <View {...panResponder.panHandlers} style={{ marginBottom: 12 }} hitSlop={{top: 60, bottom: 60, left: 60, right: 60}}>
                <Svg width={260} height={260} viewBox="0 0 260 260">
                  <G rotation={rotation} origin="130,130">
                    {saatlikVeri.map((item, i) => {
                      const angle = i * slice - 90;
                      const rad = (angle * Math.PI) / 180;
                      const r1 = 50;
                      const r2 = 110;
                      const x1 = 130 + r1 * Math.cos(rad);
                      const y1 = 130 + r1 * Math.sin(rad);
                      const x2 = 130 + r2 * Math.cos(rad);
                      const y2 = 130 + r2 * Math.sin(rad);
                      const isSelected = i === selectedHour;
                      return (
                        <G key={i}>
                          <Circle cx={x2} cy={y2} r={isSelected ? 20 : 12} fill={isSelected ? colors.tint : colors.cardBackground} stroke={isSelected ? colors.tint : colors.borderColor} strokeWidth={isSelected ? 3 : 1} />
                          <SvgText x={x2} y={y2 + (isSelected ? 6 : 4)} fontSize={isSelected ? 15 : 11} fontWeight={isSelected ? 'bold' : 'normal'} fill={isSelected ? colors.text : colors.icon} textAnchor="middle">
                            {item.saat}
                          </SvgText>
                          <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={isSelected ? colors.tint : colors.icon + '55'} strokeWidth={isSelected ? 3 : 1} />
                        </G>
                      );
                    })}
                  </G>
                  <Circle cx={130} cy={130} r={6} fill={colors.tint} />
                </Svg>
              </View>
              {/* Seçili saat bilgisi */}
              <Animated.View style={{ alignItems: 'center', marginBottom: 8, transform: [{ scale: infoScaleValue }] }}>
                <Text style={{ color: colors.text, fontSize: 22, fontWeight: 'bold', marginBottom: 2 }}>{secili?.saat}</Text>
                <Text style={{ color: colors.text, fontSize: 28, fontWeight: 'bold', marginBottom: 2 }}>{convertTemperature(secili?.sicaklik)}°</Text>
                <Text style={{ color: colors.text, fontSize: 17, marginBottom: 2 }}>
                  {secili?.durumKodu >= 8000 ? 'Yağışlı' : secili?.durumKodu >= 4000 ? 'Sağanak' : secili?.durumKodu === 1000 || secili?.durumKodu === 1100 ? 'Güneşli' : 'Parçalı Bulutlu'}
                </Text>
                <Text style={{ fontSize: 36, marginTop: 2 }}>{secili?.durumKodu >= 8000 ? '🌧️' : secili?.durumKodu >= 4000 ? '🌦️' : secili?.durumKodu === 1000 || secili?.durumKodu === 1100 ? '☀️' : '☁️'}</Text>
              </Animated.View>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Text style={{ color: colors.text, fontSize: 16 }}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Günlük Tahmin */}
        <View style={[styles.card, cardStyle, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
          <Text style={[styles.cardTitle, { color: colors.icon }]}>GÜNLÜK TAHMİN</Text>
          <View style={styles.gunlukTahminKapsayici}>
            {gunlukVeri.map((item, index) => (
              <View key={index} style={[styles.gunlukItem, { borderBottomColor: colors.borderColor }]}>
                <View style={styles.gunlukSol}>
                  <Text style={[styles.gunText, { color: colors.text }]}>
                    {index === 0 ? 'Bugün' : gunKisaltma(item.gun)}
                  </Text>
                  <View style={styles.gunlukIcon}>{renderWeatherIcon(item.durumKodu, 20)}</View>
                </View>
                <View style={styles.gunlukSag}>
                  <Text style={[styles.gunlukDusukSicaklik, { color: colors.icon }]}>{convertTemperature(item.enDusuk)}°</Text>
                  <View style={styles.sicaklikAralikKapsayici}>
                    <View style={[styles.sicaklikAralikArkaPlan, { backgroundColor: colors.borderColor }]} />
                  </View>
                  <Text style={[styles.gunlukYuksekSicaklik, { color: colors.text }]}>{convertTemperature(item.enYuksek)}°</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Detay Kartları */}
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

// --- styles tanımı (değişmediği için aynı kalabilir) ---
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.5,
    opacity: 0.8,
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
    borderBottomWidth: StyleSheet.hairlineWidth,
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
    opacity: 0.8,
  },
  sicaklikAralikKapsayici: { flex: 1, height: 4, borderRadius: 2, marginHorizontal: 12 },
  sicaklikAralikArkaPlan: { flex: 1, borderRadius: 2 },
  gunlukYuksekSicaklik: {
    fontSize: 17,
    fontWeight: '400',
    width: 35,
    textAlign: 'right',
  },
  detayKartlarGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20, gap: 12 },
  detayKartKapsayici: { width: (width - 52) / 2 },
  detayKart: { padding: 16, alignItems: 'center', height: 120 },
  detayKartIcon: { alignItems: 'center', marginBottom: 8 },
  detayKartBaslik: { fontSize: 13, fontWeight: '600', marginBottom: 4, letterSpacing: 0.5, textAlign: 'center' },
  detayKartDeger: { fontSize: 24, fontWeight: '400', flex: 1, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#222C', borderRadius: 20, padding: 24, alignItems: 'center', width: 320 },
  rotateButton: { padding: 12, backgroundColor: '#3338', borderRadius: 12 },
  closeButton: { marginTop: 16, padding: 10, backgroundColor: '#3338', borderRadius: 10 },
});
