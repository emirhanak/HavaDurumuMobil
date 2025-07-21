import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Dimensions } from 'react-native';
import Svg, { Ellipse, Defs, RadialGradient, Stop } from 'react-native-svg';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

export default function AnimatedCokBulutlu({ size = windowWidth, color = '#dbeafe' }) {
  const svgHeight = windowHeight * 0.33;
  const move = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(move, {
          toValue: 1,
          duration: 7000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(move, {
          toValue: 0,
          duration: 7000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [move]);

  const translateX = move.interpolate({
    inputRange: [0, 1],
    outputRange: [0, windowWidth * 0.04],
  });

  // Doğal ve asimetrik bulut kümeleri
  return (
    <Animated.View style={{ position: 'absolute', left: 0, top: 0, width: windowWidth, height: svgHeight, transform: [{ translateX }], zIndex: 1 }} pointerEvents="none">
      <Svg width={windowWidth} height={svgHeight}>
        <Defs>
          <RadialGradient id="cloudGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.92" />
          </RadialGradient>
        </Defs>
        {/* Büyük ana bulut ortada */}
        <Ellipse cx={windowWidth * 0.52} cy={svgHeight * 0.38} rx={windowWidth * 0.32} ry={svgHeight * 0.15} fill="url(#cloudGrad)" opacity={0.7} />
        {/* Üst sağ büyük bulut */}
        <Ellipse cx={windowWidth * 0.68} cy={svgHeight * 0.22} rx={windowWidth * 0.19} ry={svgHeight * 0.09} fill="url(#cloudGrad)" opacity={0.55} />
        {/* Üst sol büyük bulut */}
        <Ellipse cx={windowWidth * 0.34} cy={svgHeight * 0.18} rx={windowWidth * 0.17} ry={svgHeight * 0.08} fill="url(#cloudGrad)" opacity={0.5} />
        {/* Alt sağ küçük bulut */}
        <Ellipse cx={windowWidth * 0.7} cy={svgHeight * 0.60} rx={windowWidth * 0.13} ry={svgHeight * 0.06} fill="url(#cloudGrad)" opacity={0.38} />
        {/* Alt sol küçük bulut */}
        <Ellipse cx={windowWidth * 0.36} cy={svgHeight * 0.62} rx={windowWidth * 0.11} ry={svgHeight * 0.05} fill="url(#cloudGrad)" opacity={0.32} />
        {/* Orta sağ ekstra bulut */}
        <Ellipse cx={windowWidth * 0.62} cy={svgHeight * 0.36} rx={windowWidth * 0.13} ry={svgHeight * 0.07} fill="url(#cloudGrad)" opacity={0.44} />
        {/* Orta sol ekstra bulut */}
        <Ellipse cx={windowWidth * 0.42} cy={svgHeight * 0.34} rx={windowWidth * 0.12} ry={svgHeight * 0.06} fill="url(#cloudGrad)" opacity={0.41} />
        {/* Üst orta küçük bulut */}
        <Ellipse cx={windowWidth * 0.5} cy={svgHeight * 0.12} rx={windowWidth * 0.10} ry={svgHeight * 0.04} fill="url(#cloudGrad)" opacity={0.28} />
        {/* Alt orta küçük bulut */}
        <Ellipse cx={windowWidth * 0.5} cy={svgHeight * 0.68} rx={windowWidth * 0.09} ry={svgHeight * 0.04} fill="url(#cloudGrad)" opacity={0.25} />
      </Svg>
    </Animated.View>
  );
} 