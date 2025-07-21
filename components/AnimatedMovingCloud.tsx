import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Ellipse, G, Defs, RadialGradient, Stop } from 'react-native-svg';

const AnimatedG = Animated.createAnimatedComponent(G);

export default function AnimatedMovingCloud({
  size = 60,
  duration = 5000,
  startX = 0.7, // sağ üst (oran)
  startY = 0.05,
  endX = 0.1,   // sol alt (oran)
  endY = 0.65,
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
  }, [progress, duration]);

  // Pozisyon ve opaklık hesapla
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [startX * size * 4, endX * size * 4],
  });
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [startY * size * 4, endY * size * 4],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.85, 0.7, 0],
  });

  return (
    <Animated.View style={{ position: 'absolute', left: 0, top: 0, width: size * 4, height: size * 2, transform: [{ translateX }, { translateY }], opacity }} pointerEvents="none">
      <Svg width={size} height={size * 0.7}>
        <Defs>
          <RadialGradient id="cloudGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <Stop offset="100%" stopColor="#dbeafe" stopOpacity="0.8" />
          </RadialGradient>
        </Defs>
        <G>
          <Ellipse
            cx={size * 0.45}
            cy={size * 0.48}
            rx={size * 0.28}
            ry={size * 0.18}
            fill="url(#cloudGrad)"
            opacity={0.95}
          />
          <Ellipse
            cx={size * 0.32}
            cy={size * 0.48}
            rx={size * 0.13}
            ry={size * 0.13}
            fill="url(#cloudGrad)"
            opacity={0.92}
          />
          <Ellipse
            cx={size * 0.58}
            cy={size * 0.48}
            rx={size * 0.16}
            ry={size * 0.16}
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
        </G>
      </Svg>
    </Animated.View>
  );
} 