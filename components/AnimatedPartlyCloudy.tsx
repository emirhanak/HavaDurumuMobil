// AnimatedPartlyCloudy: Parçalı bulutlu için, dönen güneş ve sağa-sola hareket eden bulut birlikte. Bulut güneşi kısmen örter.
import React from 'react';
import AnimatedSun from './AnimatedSun';
import AnimatedCloud from './AnimatedCloud';
import { View } from 'react-native';

export default function AnimatedPartlyCloudy({ size = 120 }) {
  // Güneş ve bulut üst üste, bulut biraz sağda ve yukarıda, güneşi kısmen örter
  return (
    <View style={{ width: size, height: size * 0.8, position: 'relative' }}>
      <View style={{ position: 'absolute', left: size * 0.10, top: size * 0.22, zIndex: 1 }}>
        <AnimatedSun size={size * 0.85} />
      </View>
      <View style={{ position: 'absolute', left: size * 0.00, top: size * 0.28, zIndex: 2 }}>
        <AnimatedCloud size={size * 1.00} />
      </View>
    </View>
  );
} 