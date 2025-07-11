import { Stack } from 'expo-router';

export default function WeatherLayout() {
  return (
    <Stack>
      <Stack.Screen name="[sehir]" options={{ headerShown: false }} />
    </Stack>
  );
}