import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import HavaDurumuHaritasi from '@/components/HavaDurumuHaritasi';
import { useSehirler } from '@/hooks/useSehirler';

export default function MapScreen() {
  const { sehirler } = useSehirler();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e3c72', '#2a5298', '#4c6ef5']}
        style={styles.backgroundGradient}
      />
      <HavaDurumuHaritasi sehirler={sehirler} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3c72',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});