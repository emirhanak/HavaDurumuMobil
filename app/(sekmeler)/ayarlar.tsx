import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { useSettings } from '@/context/SettingsContext';
import { Thermometer, Palette, Info, Sun, Moon, Smartphone } from 'lucide-react-native';

export default function AyarlarEkrani() {
  const { unit, setUnit, theme, setTheme, colors } = useSettings();
  const phoneTheme = useColorScheme();

  // Dinamik stilleri component içinde oluşturuyoruz
  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    title: { color: colors.text },
    sectionTitle: { color: colors.text },
    subtitle: { color: colors.icon },
    blur: {
      backgroundColor: colors.cardBackground,
      borderColor: colors.borderColor,
    },
    border: { borderBottomColor: colors.borderColor },
    segmentButton: {
      // Temel stil, aktif olmayınca
    },
    segmentText: {
      color: colors.text,
    },
    segmentButtonActive: {
      backgroundColor: colors.tint,
    },
    segmentTextActive: {
      color: colors.background, // Aktifken arkaplan rengini alır (kontrast için)
    },
    infoText: { color: colors.icon },
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      <ScrollView style={styles.content}>
        <Text style={[styles.title, dynamicStyles.title]}>Ayarlar</Text>
        
        <View style={styles.settingsContainer}>
          <View style={[styles.settingsBlur, dynamicStyles.blur]}>
            {/* Sıcaklık Birimi */}
            <View style={[styles.settingItem, styles.settingItemBorder, dynamicStyles.border]}>
              <View style={styles.settingItemLeft}>
                <Thermometer size={22} color={colors.icon} />
                <Text style={[styles.settingTitle, dynamicStyles.sectionTitle]}>Sıcaklık Birimi</Text>
              </View>
              <View style={styles.segmentedControl}>
                <TouchableOpacity 
                  style={[styles.segmentButton, unit === 'C' && dynamicStyles.segmentButtonActive]}
                  onPress={() => setUnit('C')}>
                  <Text style={[styles.segmentText, unit === 'C' ? dynamicStyles.segmentTextActive : dynamicStyles.segmentText]}>°C</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.segmentButton, unit === 'F' && dynamicStyles.segmentButtonActive]}
                  onPress={() => setUnit('F')}>
                  <Text style={[styles.segmentText, unit === 'F' ? dynamicStyles.segmentTextActive : dynamicStyles.segmentText]}>°F</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Tema */}
            <View style={styles.settingItem}>
              <View style={styles.settingItemLeft}>
                <Palette size={22} color={colors.icon} />
                <Text style={[styles.settingTitle, dynamicStyles.sectionTitle]}>Tema</Text>
              </View>
              <View style={styles.segmentedControl}>
                 <TouchableOpacity 
                    style={[styles.segmentButton, theme === 'light' && dynamicStyles.segmentButtonActive]}
                    onPress={() => setTheme('light')}>
                    <Sun size={18} color={theme === 'light' ? dynamicStyles.segmentTextActive.color : colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.segmentButton, theme === 'dark' && dynamicStyles.segmentButtonActive]}
                    onPress={() => setTheme('dark')}>
                    <Moon size={18} color={theme === 'dark' ? dynamicStyles.segmentTextActive.color : colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.segmentButton, theme === 'automatic' && dynamicStyles.segmentButtonActive]}
                    onPress={() => setTheme('automatic')}>
                    <Smartphone size={18} color={theme === 'automatic' ? dynamicStyles.segmentTextActive.color : colors.text} />
                  </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 30,
  },
  settingsContainer: {
    marginBottom: 30,
  },
  settingsBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
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
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 15,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  segmentButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontSize: 16,
    fontWeight: '600'
  },
});