// WeatherAnimation: Hava durumu koduna göre uygun animasyon. Güneşli havada güneş daha aşağıda (offsetY=80), diğerlerinde normal boyut.
import React from 'react';
import AnimatedSun from './AnimatedSun';
import AnimatedCloud from './AnimatedCloud';
import AnimatedPartlyCloudy from './AnimatedPartlyCloudy';
import AnimatedRain from './AnimatedRain';
import AnimatedSnow from './AnimatedSnow';
import AnimatedFog from './AnimatedFog';
import AnimatedCokBulutlu from './AnimatedCokBulutlu';

const sunnyCodes = [1000, 1100];
const partlyCloudyCodes = [1101, 1104]; // Parçalı Bulutlu
const cokBulutluCodes = [1001, 1102, 1103];   // Çok Bulutlu
const rainyCodes = [4000, 4200, 4201, 4210, 4214, 4218, 4220, 4224, 4226, 4228, 4230, 4232, 4234, 4236, 4238, 4240];
const snowyCodes = [5000, 5100, 5101, 5110, 5111, 5112, 6000, 6001, 6200, 6201];
const foggyCodes = [2100, 2101, 2102, 2106, 2107, 2108];

export default function WeatherAnimation({ code, durum, size = 120 }: { code: number | undefined; durum?: string; size?: number }) {
  // Çok bulutlu: kod veya metinle kontrol
  if ((typeof code === 'number' && cokBulutluCodes.includes(code)) || (durum && durum.toLowerCase().includes('çok bulutlu'))) {
    return <AnimatedCokBulutlu size={size} />;
  }
  if (typeof code === 'number' && sunnyCodes.includes(code)) return (
    <AnimatedSun size={120} offsetY={80} />
  );
  if (typeof code === 'number' && partlyCloudyCodes.includes(code)) return <AnimatedPartlyCloudy size={size} />;
  if (typeof code === 'number' && rainyCodes.includes(code)) return <AnimatedRain size={size} />;
  if (typeof code === 'number' && snowyCodes.includes(code)) return <AnimatedSnow size={size} />;
  if (typeof code === 'number' && foggyCodes.includes(code)) return <AnimatedFog size={size} />;
  return <AnimatedSun size={size} />;
} 