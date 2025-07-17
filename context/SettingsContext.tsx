import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useColorScheme, View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/temalar/Colors';

type Theme = 'light' | 'dark' | 'automatic';
type Unit = 'C' | 'F';
const THEME_KEY = '@theme_v2';
const UNIT_KEY = '@unit_v2';

interface SettingsContextState {
  theme: Theme;
  unit: Unit;
  colors: typeof Colors.light | typeof Colors.dark;
  activeTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  setUnit: (unit: Unit) => void;
}

const SettingsContext = createContext<SettingsContextState | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const colorScheme = useColorScheme(); 
  const [theme, setThemeState] = useState<Theme>('automatic'); 
  const [unit, setUnit] = useState<Unit>('C');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_KEY) as Theme | null;
        const savedUnit = await AsyncStorage.getItem(UNIT_KEY) as Unit | null;
        if (savedTheme) setThemeState(savedTheme);
        if (savedUnit) setUnit(savedUnit);
      } catch (e) {
        console.error("Ayarlar yüklenemedi.", e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadSettings();
  }, []);

  const setTheme = async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, newTheme);
      setThemeState(newTheme);
    } catch (e) { console.error("Tema kaydedilemedi.", e); }
  };

  const setUnitAndSave = async (newUnit: Unit) => {
    try {
      await AsyncStorage.setItem(UNIT_KEY, newUnit);
      setUnit(newUnit);
    } catch (e) { console.error("Birim kaydedilemedi.", e); }
  };

  if (!isLoaded) {
    return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>;
  }
  
  const activeTheme = theme === 'automatic' ? colorScheme ?? 'light' : theme;
  const colors = Colors[activeTheme];

  const value = { theme, unit, colors, activeTheme, setTheme, setUnit: setUnitAndSave };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};