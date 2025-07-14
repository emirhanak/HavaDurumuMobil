import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import Colors from '../temalar/Colors'; // Renk paletimizi import ediyoruz

type Unit = 'C' | 'F';
type Theme = 'light' | 'dark' | 'automatic';

interface SettingsContextState {
  unit: Unit;
  setUnit: (unit: Unit) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colors: typeof Colors.light; // Renk paletini de context'e ekliyoruz
}

const SettingsContext = createContext<SettingsContextState | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [unit, setUnit] = useState<Unit>('C');
  const [theme, setTheme] = useState<Theme>('automatic');

  // Telefonun mevcut renk şemasını (light/dark) alıyoruz
  const colorScheme = useColorScheme();
  
  // Hangi temanın aktif olacağına karar veren mantık:
  // Eğer ayar 'automatic' ise telefonun temasını, değilse seçilen temayı kullan.
  const activeTheme = theme === 'automatic' ? colorScheme ?? 'light' : theme;
  
  const colors = Colors[activeTheme];

  const value = {
    unit,
    setUnit,
    theme,
    setTheme,
    colors, // Aktif renk paletini context aracılığıyla sunuyoruz
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};