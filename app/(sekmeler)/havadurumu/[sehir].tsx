import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { fetchWeatherFromBackend } from '../../../services/havaDurumuService';
import HavaDurumuDetay from '@/components/HavaDurumuDetay';
import { useSettings } from '@/context/SettingsContext';

// Sehir interface'ini burada da tanımlamak iyi bir pratiktir
interface Sehir {
  id: string;
  ad: string;
  enlem: number;
  boylam: number;
  sicaklik: number;
}

export default function SehirHavaDurumuEkrani() {
  const { sehir, lat, lon } = useLocalSearchParams<{ sehir: string; lat: string; lon: string }>();
  const { colors } = useSettings();

  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // lat ve lon parametrelerinin var olduğundan ve geçerli olduğundan emin olalım
    if (lat && lon) {
      const loadData = async () => {
        try {
          setLoading(true);
          setError(null);
          // Artık kendi backend'imizden canlı veri çekiyoruz
          const data = await fetchWeatherFromBackend(parseFloat(lat), parseFloat(lon));
          setWeatherData(data);
        } catch (err) {
          setError('Hava durumu bilgisi alınamadı. Backend sunucunuzun çalıştığından emin olun.');
          console.error("Detay ekranı için veri çekilemedi:", err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [lat, lon]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  if (error || !weatherData) {
    return (
       <View style={[styles.center, { backgroundColor: colors.background, padding: 20 }]}>
        <Text style={{ color: colors.text, textAlign: 'center' }}>{error || 'Veri bulunamadı.'}</Text>
      </View>
    );
  }

  // Gelen veriyi ve sehir bilgisini Detay component'ine yolluyoruz
  const sehirDetay: Sehir = {
      id: lat + lon, // Geçici bir id
      ad: sehir || 'Bilinmeyen Şehir',
      enlem: parseFloat(lat),
      boylam: parseFloat(lon),
      // Anlık sıcaklığı API'den gelen veriye göre belirliyoruz
      sicaklik: weatherData.timelines?.daily[0]?.values?.temperatureAvg ? Math.round(weatherData.timelines.daily[0].values.temperatureAvg) : 0
  };

  return <HavaDurumuDetay sehir={sehirDetay} weatherData={weatherData} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});