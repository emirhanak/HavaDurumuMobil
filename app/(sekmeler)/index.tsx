import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as Location from 'expo-location';
import { useSettings } from '@/context/SettingsContext';
import HavaDurumuDetay from '@/components/HavaDurumuDetay';
import { fetchWeatherFromBackend } from '@/services/havaDurumuService';

interface Sehir {
  id: string;
  ad: string;
  enlem: number;
  boylam: number;
  sicaklik: number;
}

export default function AnaHavaDurumuSekmesi() {
  const { colors } = useSettings();
  const [weatherData, setWeatherData] = useState<any>(null);
  const [konumSehri, setKonumSehri] = useState<Sehir | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hataMesaji, setHataMesaji] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const getKonumVeHavaDurumu = async () => {
        setIsLoading(true);
        setHataMesaji(null);
        try {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            throw new Error('Hava durumunu göstermek için konum izni gereklidir.');
          }
          
          let location = await Location.getCurrentPositionAsync({});
          const { latitude, longitude } = location.coords;

          let geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
          const sehirAdi = geocode[0]?.city || 'Konumum';

          const data = await fetchWeatherFromBackend(latitude, longitude);
          if (!data || !data.anlikHavaDurumu) {
            throw new Error("API'den gelen veri formatı hatalı.");
          }

          const anlikKonumSehri: Sehir = { 
              id: 'konum', 
              ad: sehirAdi, 
              enlem: latitude, 
              boylam: longitude, 
              sicaklik: data.anlikHavaDurumu.sicaklik 
          };
          
          setKonumSehri(anlikKonumSehri);
          setWeatherData(data);

        } catch (error: any) {
          setHataMesaji(error.message || 'Bir hata oluştu.');
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };
      
      getKonumVeHavaDurumu();
      
    }, [])
  );

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  if (hataMesaji) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, padding: 20 }]}>
        <Text style={{ color: colors.text, textAlign: 'center', marginBottom: 20 }}>{hataMesaji}</Text>
        {/* Yeniden deneme butonu, sekmeye tekrar tıklandığında focus efekti zaten yeniden çalışacağı için kaldırılabilir veya başka bir mantıkla eklenebilir. */}
      </View>
    );
  }
  
  if (weatherData && konumSehri) {
    return <HavaDurumuDetay sehir={konumSehri} weatherData={weatherData} />;
  }

  return <View style={[styles.center, { backgroundColor: colors.background }]} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});