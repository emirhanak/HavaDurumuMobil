import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useSettings } from '@/context/SettingsContext';
import { Thermometer, Palette, Sun, Moon } from 'lucide-react-native';

export default function AyarlarEkrani() {
  const { theme, setTheme, unit, setUnit, colors } = useSettings();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
       <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Ayarlar</Text>
        
        <View style={styles.card}>
            {/* Sıcaklık Birimi */}
            <View style={[styles.optionRow, styles.borderBottom, { borderColor: colors.borderColor }]}>
              <View style={styles.optionTextContainer}>
                <Thermometer size={22} color={colors.icon} />
                <Text style={[styles.optionTitle, { color: colors.text }]}>Sıcaklık Birimi</Text>
              </View>
              <View style={[styles.segmentedControl, { borderColor: colors.borderColor }]}>
                <TouchableOpacity 
                  style={[styles.segmentButton, unit === 'C' && { backgroundColor: colors.tint }]}
                  onPress={() => setUnit('C')}>
                  <Text style={[styles.segmentText, { color: colors.text }, unit === 'C' && { color: theme === 'light' ? '#fff' : '#000' }]}>°C</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.segmentButton, unit === 'F' && { backgroundColor: colors.tint }]}
                  onPress={() => setUnit('F')}>
                  <Text style={[styles.segmentText, { color: colors.text }, unit === 'F' && { color: theme === 'light' ? '#fff' : '#000' }]}>°F</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Tema */}
            <View style={styles.optionRow}>
              <View style={styles.optionTextContainer}>
                <Palette size={22} color={colors.icon} />
                <Text style={[styles.optionTitle, { color: colors.text }]}>Tema</Text>
              </View>
              <View style={[styles.segmentedControl, { borderColor: colors.borderColor }]}>
                 <TouchableOpacity 
                    style={[styles.segmentButton, theme === 'light' && { backgroundColor: colors.tint }]}
                    onPress={() => setTheme('light')}>
                    <Sun size={18} color={theme === 'light' ? (colors.background === '#FFFFFF' ? '#000' : '#fff') : colors.icon} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.segmentButton, theme === 'dark' && { backgroundColor: colors.tint }]}
                    onPress={() => setTheme('dark')}>
                    <Moon size={18} color={theme === 'dark' ? (colors.background === '#FFFFFF' ? '#000' : '#fff') : colors.icon} />
                  </TouchableOpacity>
              </View>
            </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 34, fontWeight: '700', marginBottom: 30 },
  card: { borderRadius: 12, overflow: 'hidden' },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  optionTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '500',
  },
  borderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
  },
  segmentButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  segmentText: {
    fontSize: 16,
    fontWeight: '600',
  },
});