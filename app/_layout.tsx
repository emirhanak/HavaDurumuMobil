import { Stack } from 'expo-router';
import { SettingsProvider } from '@/context/SettingsContext';
import { SehirProvider } from '@/context/SehirContext';

// Font ve Splash Screen ile ilgili importlar ve kodlar projenizde varsa kalmalı
// import { useFonts } from 'expo-font';
// import * as SplashScreen from 'expo-splash-screen';
// import { useEffect } from 'react';

export default function RootLayout() {
  // Font yükleme mantığı burada olabilir...

  return (
    <SettingsProvider>
      <SehirProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(sekmeler)" />
          <Stack.Screen name="havadurumu/[sehir]" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </SehirProvider>
    </SettingsProvider>
  );
}