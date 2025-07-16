import { Stack } from 'expo-router';
import { SettingsProvider } from '@/context/SettingsContext';
import { SehirProvider } from '@/context/SehirContext';

export default function RootLayout() {
  return (
    <SettingsProvider>
      <SehirProvider>
        <Stack screenOptions={{ headerShown: false }}>
          {}
          <Stack.Screen name="(sekmeler)" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </SehirProvider>
    </SettingsProvider>
  );
}