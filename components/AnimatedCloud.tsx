// AnimatedCloud: Sağa-sola yavaşça hareket eden bulut, sade ve projeye özel. Sadece react-native-svg ve Animated kullanılır.
import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Ellipse, Circle, G, Defs, RadialGradient, Stop } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);

export default function AnimatedCloud({ size = 120, color = '#dbeafe' }) {
  const move = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(move, {
          toValue: 1,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(move, {
          toValue: 0,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [move]);

  const translateX = move.interpolate({
    inputRange: [0, 1],
    outputRange: [0, size * 0.12],
  });

  return (
    <Svg width={size} height={size * 0.7}>
      <Defs>
        <RadialGradient id="cloudGrad" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <Stop offset="100%" stopColor={color} stopOpacity="0.8" />
        </RadialGradient>
      </Defs>
      <AnimatedG style={{ transform: [{ translateX }] }}>
        <Ellipse
          cx={size * 0.45}
          cy={size * 0.48}
          rx={size * 0.28}
          ry={size * 0.18}
          fill="url(#cloudGrad)"
          opacity={0.95}
        />
        <Circle
          cx={size * 0.32}
          cy={size * 0.48}
          r={size * 0.13}
          fill="url(#cloudGrad)"
          opacity={0.92}
        />
        <Circle
          cx={size * 0.58}
          cy={size * 0.48}
          r={size * 0.16}
          fill="url(#cloudGrad)"
          opacity={0.92}
        />
        <Ellipse
          cx={size * 0.5}
          cy={size * 0.6}
          rx={size * 0.18}
          ry={size * 0.11}
          fill="url(#cloudGrad)"
          opacity={0.85}
        />
      </AnimatedG>
    </Svg>
  );
} 