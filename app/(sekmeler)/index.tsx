import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import * as Location from 'expo-location';
import { useSettings } from '@/context/SettingsContext';
import { useSehirler } from '@/context/SehirContext';
import mockHavaVerisi from '@/mocks/mockHavaDetay.json';
import HavaDurumuDetay from '@/components/HavaDurumuDetay';

export default function AnaHavaDurumuSekmesi() {
  const { colors } = useSettings();
  const { mod, aktifSehir, loading: sehirlerLoading } = useSehirler();

  const [weatherData, setWeatherData] = useState<any>(null);
  const [isTabLoading, setIsTabLoading] = useState(true);
  const [hataMesaji, setHataMesaji] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const veriYukle = async () => {
        if (!isActive) return;

        setIsTabLoading(true);
        setHataMesaji(null);

        try {
          if (mod === 'konum') {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
              setHataMesaji('Hava durumunu göstermek için konum izni gerekiyor.');
              setIsTabLoading(false);
              return;
            }
            let location = await Location.getCurrentPositionAsync({});
            // API'ye geçince bu kısım gerçek veriyle dolacak
            const konumSehri = { id: 'konum', ad: 'Konumum', enlem: location.coords.latitude, boylam: location.coords.longitude, sicaklik: mockHavaVerisi.currentWeather.temperature };
            setWeatherData({ sehir: konumSehri, ...mockHavaVerisi });

          } else if (mod === 'sehir' && aktifSehir) {
            // API'ye geçince bu kısım aktif şehrin verisiyle dolacak
            setWeatherData({ sehir: aktifSehir, ...mockHavaVerisi });
          }
        } catch (error) {
          setHataMesaji('Bir hata oluştu. Lütfen tekrar deneyin.');
          console.error(error);
        } finally {
          if (isActive) {
            setIsTabLoading(false);
          }
        }
      };

      // Eğer şehirler hala yükleniyorsa bekle, bittiyse veriyi yükle
      if (!sehirlerLoading) {
        veriYukle();
      }

      return () => { isActive = false; };
    }, [mod, aktifSehir, sehirlerLoading])
  );

  // Genel yükleme durumu (ilk şehir listesi veya detay yüklemesi)
  if (sehirlerLoading || (isTabLoading && (mod === 'konum' || aktifSehir))) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  // Hata durumu
  if (hataMesaji) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, padding: 20 }]}>
        <Text style={{ color: colors.text, textAlign: 'center' }}>{hataMesaji}</Text>
      </View>
    );
  }
  
  // Gösterilecek veri varsa, detay component'ini render et
  if (weatherData && weatherData.sehir) {
    return <HavaDurumuDetay sehir={weatherData.sehir} weatherData={weatherData} />;
  }

  // Diğer tüm durumlar için (örn: hiç şehir eklenmemiş ve yönlendirme bekleniyor)
  // boş veya bir yükleme ekranı göster
  return (
     <View style={[styles.center, { backgroundColor: colors.background }]} />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});