import { Tabs, router } from 'expo-router'; // <-- DÜZELTME: 'router' buraya import edildi
import { Cloud, Map, List, Settings } from 'lucide-react-native';
import { useSettings } from '@/context/SettingsContext';
import { useSehirler } from '@/context/SehirContext';

function ThemedTabs() {
  const { colors } = useSettings();
  const { setMod } = useSehirler();

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
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hava Durumu',
          tabBarIcon: ({ size, color }) => <Cloud size={size} color={color} />,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            setMod('konum');
            router.push('/'); // Artık 'router' tanınıyor
          },
        }}
      />
      <Tabs.Screen
        name="harita"
        options={{
          title: 'Harita',
          tabBarIcon: ({ size, color }) => <Map size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="liste"
        options={{
          title: 'Şehirler',
          tabBarIcon: ({ size, color }) => <List size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ayarlar"
        options={{
          title: 'Ayarlar',
          tabBarIcon: ({ size, color }) => <Settings size={size} color={color} />,
        }}
      />
      
      {/* Bu satır, (sekmeler) içindeki 'havadurumu' klasörünün bir sekme olmasını engeller */}
      <Tabs.Screen
        name="havadurumu"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return <ThemedTabs />;
}