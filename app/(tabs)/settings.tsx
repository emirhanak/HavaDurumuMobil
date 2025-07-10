import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { 
  Thermometer, 
  Globe, 
  Bell, 
  Palette, 
  Info, 
  ChevronRight 
} from 'lucide-react-native';

export default function SettingsScreen() {
  const settingsItems = [
    {
      icon: <Thermometer size={24} color="rgba(255, 255, 255, 0.8)" />,
      title: 'Sıcaklık Birimi',
      subtitle: 'Celsius',
      onPress: () => console.log('Temperature unit'),
    },
    {
      icon: <Globe size={24} color="rgba(255, 255, 255, 0.8)" />,
      title: 'Konum Servisleri',
      subtitle: 'Açık',
      onPress: () => console.log('Location services'),
    },
    {
      icon: <Bell size={24} color="rgba(255, 255, 255, 0.8)" />,
      title: 'Bildirimler',
      subtitle: 'Hava durumu uyarıları',
      onPress: () => console.log('Notifications'),
    },
    {
      icon: <Palette size={24} color="rgba(255, 255, 255, 0.8)" />,
      title: 'Tema',
      subtitle: 'Otomatik',
      onPress: () => console.log('Theme'),
    },
    {
      icon: <Info size={24} color="rgba(255, 255, 255, 0.8)" />,
      title: 'Hakkında',
      subtitle: 'Versiyon 1.0.0',
      onPress: () => console.log('About'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1e3c72', '#2a5298', '#4c6ef5']}
        style={styles.backgroundGradient}
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Ayarlar</Text>
        
        <View style={styles.settingsContainer}>
          <BlurView intensity={80} style={styles.settingsBlur}>
            {settingsItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.settingItem,
                  index < settingsItems.length - 1 && styles.settingItemBorder,
                ]}
                onPress={item.onPress}
              >
                <View style={styles.settingItemLeft}>
                  <View style={styles.settingIcon}>
                    {item.icon}
                  </View>
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="rgba(255, 255, 255, 0.4)" />
              </TouchableOpacity>
            ))}
          </BlurView>
        </View>

        <View style={styles.infoContainer}>
          <BlurView intensity={80} style={styles.infoBlur}>
            <Text style={styles.infoTitle}>Hava Durumu Uygulaması</Text>
            <Text style={styles.infoDescription}>
              Bu uygulama, güncel hava durumu bilgilerini ve tahminlerini 
              görüntülemenizi sağlar. Şehir ekleyerek farklı konumların 
              hava durumunu takip edebilirsiniz.
            </Text>
          </BlurView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3c72',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 30,
  },
  settingsContainer: {
    marginBottom: 30,
  },
  settingsBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  infoContainer: {
    marginBottom: 30,
  },
  infoBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 20,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  infoDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 24,
  },
});