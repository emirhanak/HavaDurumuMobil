import { Tabs } from 'expo-router';
import { Cloud, Map, Building2, Settings } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hava Durumu',
          tabBarIcon: ({ size, color }) => (
            <Cloud size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Harita',
          tabBarIcon: ({ size, color }) => (
            <Map size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: 'Şehirler',
          tabBarIcon: ({ size, color }) => (
            <Building2 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="weather"
        options={{
          title: 'Detay',
          tabBarIcon: ({ size, color }) => (
            <Cloud size={size} color={color} />
          ),
          href: null as any, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}