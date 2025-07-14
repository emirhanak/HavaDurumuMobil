import { Stack } from 'expo-router';
import { SettingsProvider } from '@/context/SettingsContext';
import { SehirProvider } from '@/context/SehirContext'; // YENİ

export default function RootLayout() {
  return (
    // İki provider iç içe. Sıralamaları önemli değil.
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