import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import AnimatedCloud from './AnimatedCloud';

const AnimatedG = Animated.createAnimatedComponent(G);

export default function AnimatedSnow({ size = 120 }) {
  // 3 kar tanesi için ayrı animasyon
  const flakes = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    flakes.forEach((flake, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(flake, {
            toValue: 1,
            duration: 1800 + i * 300,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(flake, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [flakes]);

  const flakeYs = flakes.map(flake => flake.interpolate({
    inputRange: [0, 1],
    outputRange: [0, size * 0.18],
  }));

  return (
    <View style={{ width: size, height: size * 0.9, position: 'relative' }}>
      <View style={{ position: 'absolute', left: 0, top: size * 0.18, zIndex: 2 }}>
        <AnimatedCloud size={size * 0.95} />
      </View>
      <Svg width={size} height={size * 0.9} style={{ position: 'absolute', left: 0, top: 0, zIndex: 1 }}>
        {flakeYs.map((flakeY, i) => (
          <AnimatedG key={i} style={{ transform: [{ translateY: flakeY }] }}>
            <Circle
              cx={size * (0.38 + i * 0.13)}
              cy={size * 0.62}
              r={7}
              fill="#fff"
              opacity={0.85}
            />
          </AnimatedG>
        ))}
      </Svg>
    </View>
  );
} 