import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { useSehirler } from '@/context/SehirContext';
import { useSettings } from '@/context/SettingsContext';
import mockHavaVerisi from '@/mocks/mockHavaDetay.json';
import HavaDurumuDetay from '../../components/HavaDurumuDetay';

export default function AnaHavaDurumuSekmesi() {
  const { colors } = useSettings();
  const { aktifSehir, loading: sehirlerLoading } = useSehirler();

  const [weatherData, setWeatherData] = useState<any>(null);
  const [isTabLoading, setIsTabLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadWeatherData = () => {
        if (aktifSehir) {
          setIsTabLoading(true);
          setTimeout(() => {
            if (isActive) {
              setWeatherData(mockHavaVerisi);
              setIsTabLoading(false);
            }
          }, 400); 
        } else if (!sehirlerLoading && !aktifSehir) {
            router.replace('/liste');
        }
      };

      loadWeatherData();

      return () => { isActive = false; };
    }, [aktifSehir, sehirlerLoading])
  );
  
  if (sehirlerLoading || (isTabLoading && aktifSehir)) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  if (!aktifSehir) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text, textAlign: 'center', paddingHorizontal: 20 }}>
          Hava durumunu görmek için 'Şehirler' sekmesinden bir şehir ekleyin.
        </Text>
      </View>
    );
  }
  
  return <HavaDurumuDetay sehir={aktifSehir} weatherData={weatherData} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});