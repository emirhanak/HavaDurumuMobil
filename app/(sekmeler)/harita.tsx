import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import HavaDurumuHaritasi from '@/components/HavaDurumuHaritasi';
import { useSehirler } from '@/context/SehirContext'; // <-- DEĞİŞEN SATIR: Doğru yoldan import ediyoruz
import { useSettings } from '@/context/SettingsContext'; // Tema için renkleri alıyoruz

export default function HaritaEkrani() {
  const { sehirler } = useSehirler();
  const { colors, theme } = useSettings(); // Temadan renkleri ve mevcut temayı alıyoruz

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        // Açık ve koyu tema için farklı arkaplan gradient'leri
        colors={theme === 'dark' ? ['#1e3c72', '#2a5298'] : ['#87CEEB', '#B0E0E6']}
        style={styles.backgroundGradient}
      />
      <HavaDurumuHaritasi sehirler={sehirler} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});