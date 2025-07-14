import { Tabs } from 'expo-router';
import { Cloud, Map, List, Settings } from 'lucide-react-native';
import { useSettings, SettingsProvider } from '@/context/SettingsContext';

// Bu iç component, renkleri context'ten alıp Tabs'e uygular
function ThemedTabs() {
  const { colors } = useSettings();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          borderTopWidth: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
        },
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.icon,
      }}
    >
      {/* 1. Sekme: Hava Durumu -> index.tsx dosyasını kullanır */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hava Durumu',
          tabBarIcon: ({ size, color }) => <Cloud size={size} color={color} />,
        }}
      />
      {/* 2. Sekme: Harita -> harita.tsx dosyasını kullanır */}
      <Tabs.Screen
        name="harita"
        options={{
          title: 'Harita',
          tabBarIcon: ({ size, color }) => <Map size={size} color={color} />,
        }}
      />
      {/* 3. Sekme: Şehirler -> liste.tsx dosyasını kullanır */}
      <Tabs.Screen
        name="liste"
        options={{
          title: 'Şehirler',
          tabBarIcon: ({ size, color }) => <List size={size} color={color} />,
        }}
      />
      {/* 4. Sekme: Ayarlar -> ayarlar.tsx dosyasını kullanır */}
      <Tabs.Screen
        name="ayarlar"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ size, color }) => <Settings size={size} color={color} />,
        }}
      />
      
      {/* Bu ekran sekme barında görünmez, sadece yönlendirme için var */}
      <Tabs.Screen
        name="havadurumu"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

// Ana Layout component'i
export default function TabLayout() {
  return (
    <SettingsProvider>
      <ThemedTabs />
    </SettingsProvider>
  );
}