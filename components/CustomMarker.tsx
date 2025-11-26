import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface CustomMarkerProps {
  sehir: { 
    ad: string; 
    sicaklik: number; 
    enDusuk?: number; 
    enYuksek?: number; 
  };
  isSelected: boolean;
}

export default function CustomMarker({ sehir, isSelected }: CustomMarkerProps) {
  // Use React Native Animated instead of reanimated to avoid native module issues
  const scale = useRef(new Animated.Value(isSelected ? 1 : 0.7)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isSelected ? 1 : 0.7,
      damping: 15,
      stiffness: 200,
      useNativeDriver: true,
    }).start();
  }, [isSelected, scale]);

  const animatedStyle = { transform: [{ scale }] };

  const sicaklik = Math.round(sehir.sicaklik);
  const dusuk = sehir.enDusuk ? Math.round(sehir.enDusuk) : sicaklik - 4;
  const yuksek = sehir.enYuksek ? Math.round(sehir.enYuksek) : sicaklik + 4;

  if (isSelected) {
    return (
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.largeMarker}>
          <Text style={styles.largeCity}>{sehir.ad}</Text>
          <Text style={styles.largeTemp}>{sicaklik}°</Text>
          <View style={styles.rangeContainer}>
            <Text style={styles.rangeText}>{dusuk}°</Text>
            <View style={styles.rangeBar} />
            <Text style={styles.rangeText}>{yuksek}°</Text>
          </View>
        </View>
        <View style={styles.pointer} />
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.smallMarker, animatedStyle]}>
      <Text style={styles.smallTemp}>{sicaklik}°</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  smallMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5,
  },
  smallTemp: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  largeMarker: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
  },
  largeCity: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  largeTemp: {
    fontSize: 28,
    color: 'white',
    fontWeight: '300',
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  rangeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '500',
  },
  rangeBar: {
    height: 2,
    width: 40,
    backgroundColor: 'gray',
    borderRadius: 1,
    marginHorizontal: 4,
  },
  pointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#1F1F1F',
    alignSelf: 'center',
  },
});