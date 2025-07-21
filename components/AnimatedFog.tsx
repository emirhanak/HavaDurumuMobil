import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Ellipse, G } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);

export default function AnimatedFog({ size = 120 }) {
  // 2 sis şeridi için ayrı animasyon
  const fogs = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    fogs.forEach((fog, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fog, {
            toValue: 1,
            duration: 4000 + i * 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(fog, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [fogs]);

  const fogXs = fogs.map((fog, i) => fog.interpolate({
    inputRange: [0, 1],
    outputRange: [0, size * (0.18 + i * 0.08)],
  }));

  return (
    <View style={{ width: size, height: size * 0.7, position: 'relative' }}>
      <Svg width={size} height={size * 0.7}>
        {fogXs.map((fogX, i) => (
          <AnimatedG key={i} style={{ transform: [{ translateX: fogX }] }}>
            <Ellipse
              cx={size * 0.5}
              cy={size * (0.38 + i * 0.18)}
              rx={size * (0.32 - i * 0.08)}
              ry={size * 0.09}
              fill="#e0e7ef"
              opacity={0.38 + i * 0.18}
            />
          </AnimatedG>
        ))}
      </Svg>
    </View>
  );
} 