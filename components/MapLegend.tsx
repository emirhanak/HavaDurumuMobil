import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { KatmanKey } from './HavaDurumuHaritasi';

// DÜZELTME: objenin sonuna 'as const' ekliyoruz ve tip tanımını kaldırıyoruz.
const legendData = {
    precipitation_new: { title: 'Yağış', colors: ['#4A90E2', '#2E5E9A'] },
    temperature_new: { title: 'Sıcaklık', colors: ['#5EDFFF', '#FDE15C', '#F2513C'] },
    wind_speed: { title: 'Rüzgâr', colors: ['#A8E6CF', '#FF8A80'] },
} as const;

interface MapLegendProps {
    aktifKatman: KatmanKey | null;
}

export default function MapLegend({ aktifKatman }: MapLegendProps) {
  if (!aktifKatman) return null;
  
  const currentLegend = legendData[aktifKatman];
  if (!currentLegend) return null;

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
        <Text style={styles.title}>{currentLegend.title}</Text>
        <LinearGradient
          colors={currentLegend.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBar}
        />
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 60, left: 15 },
  blurContainer: { borderRadius: 8, padding: 10, overflow: 'hidden' },
  title: { color: 'white', fontSize: 12, fontWeight: '500', marginBottom: 5 },
  gradientBar: { height: 5, width: 100, borderRadius: 2.5 },
});