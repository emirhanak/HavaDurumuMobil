import { Stack } from 'expo-router';

export default function WeatherLayout() {
  return (
    <Stack>
      <Stack.Screen name="[city]" options={{ headerShown: false }} />
    </Stack>
  );
}