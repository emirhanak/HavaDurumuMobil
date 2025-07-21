import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Line, G } from 'react-native-svg';
import AnimatedCloud from './AnimatedCloud';

const AnimatedG = Animated.createAnimatedComponent(G);

export default function AnimatedRain({ size = 120 }) {
  // 3 damla için ayrı animasyon
  const drops = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    drops.forEach((drop, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(drop, {
            toValue: 1,
            duration: 1200 + i * 200,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(drop, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [drops]);

  const dropYs = drops.map(drop => drop.interpolate({
    inputRange: [0, 1],
    outputRange: [0, size * 0.22],
  }));

  return (
    <View style={{ width: size, height: size * 0.9, position: 'relative' }}>
      <View style={{ position: 'absolute', left: 0, top: size * 0.18, zIndex: 2 }}>
        <AnimatedCloud size={size * 0.95} />
      </View>
      <Svg width={size} height={size * 0.9} style={{ position: 'absolute', left: 0, top: 0, zIndex: 1 }}>
        {dropYs.map((dropY, i) => (
          <AnimatedG key={i} style={{ transform: [{ translateY: dropY }] }}>
            <Line
              x1={size * (0.38 + i * 0.13)}
              y1={size * 0.62}
              x2={size * (0.38 + i * 0.13)}
              y2={size * 0.72}
              stroke="#4fc3f7"
              strokeWidth={5}
              strokeLinecap="round"
              opacity={0.85}
            />
          </AnimatedG>
        ))}
      </Svg>
    </View>
  );
} 