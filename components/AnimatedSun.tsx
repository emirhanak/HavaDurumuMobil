// AnimatedSun: Sabit güneş ve ışınlar, sadece ışınların opaklığı animasyonla kayar. Dönme yok, ışık geçişi efekti var.
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Circle, G, Line, Defs, RadialGradient, Stop } from 'react-native-svg';

export default function AnimatedSun({ size = 120, color = '#FFD700', offsetY = 0 }) {
  // Tam halka ışınlar
  const raysCount = 24;
  const rayLength = size * 0.42;
  const rayInner = size * 0.36;
  const center = size / 2;

  // Animasyon
  const rotate = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 3200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [rotate]);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Opaklık fade fonksiyonu: sağ üstte opak, sol altta şeffaf
  function rayOpacity(angleRad: number) {
    // -45° (sağ üst) = 0, 135° (sol alt) = PI*1.25
    // Fade: cos(a - (-PI/4)) ^ 2
    const rel = Math.cos(angleRad + Math.PI/4);
    return 0.7 * Math.max(0, rel) ** 2; // sağ üstte 0.7, sol altta 0
  }

  const rays = Array.from({ length: raysCount });

  return (
    <View style={{ transform: [{ translateY: offsetY }], width: size, height: size }}>
      {/* Dönen ışınlar halkası */}
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: size,
          height: size,
          transform: [{ rotate: spin }],
          pointerEvents: 'none',
        }}
        pointerEvents="none"
      >
        <Svg width={size} height={size}>
          <G originX={center} originY={center}>
            {rays.map((_, i) => {
              const angle = (i * 2 * Math.PI) / raysCount;
              const x1 = center + Math.cos(angle) * rayInner;
              const y1 = center + Math.sin(angle) * rayInner;
              const x2 = center + Math.cos(angle) * rayLength;
              const y2 = center + Math.sin(angle) * rayLength;
              const opacity = rayOpacity(angle);
              return (
                <Line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={color}
                  strokeWidth={4}
                  strokeLinecap="round"
                  opacity={opacity}
                />
              );
            })}
          </G>
        </Svg>
      </Animated.View>
      {/* Sabit güneş */}
      <Svg width={size} height={size} style={{ position: 'absolute', left: 0, top: 0 }}>
        <Defs>
          <RadialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#fffbe6" stopOpacity="1" />
            <Stop offset="80%" stopColor={color} stopOpacity="0.9" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.7" />
          </RadialGradient>
        </Defs>
        <Circle
          cx={center}
          cy={center}
          r={size * 0.32}
          fill="url(#sunGrad)"
          stroke={color}
          strokeWidth={4}
          opacity={0.98}
        />
      </Svg>
    </View>
  );
} 