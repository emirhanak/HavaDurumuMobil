// components/VarTabs.tsx
import React from "react";
import { ScrollView, Pressable, Text, StyleSheet, ViewStyle,View,TouchableOpacity } from "react-native";
import { useSettings } from "@/context/SettingsContext";
import { useTheme } from "@react-navigation/native";

// components/VarTabs.tsx
export type VarKey = 'temp' | 'rhum' | 'pres' | 'wspd' | 'prcp';

const TABS: { key: VarKey; label: string }[] = [
  { key: 'temp', label: 'Sıcaklık' },
  { key: 'rhum', label: 'Nem' },
  { key: 'pres', label: 'Basınç' },
  { key: 'wspd', label: 'Rüzgar' },
  { key: 'prcp', label: 'Yağış' },
];


export default function VarTabs({ value, onChange }: { value: VarKey; onChange?: (v: VarKey)=>void }) {
  const { colors } = useSettings();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal: 4}}>
      {TABS.map(t => {
        const active = value === t.key;
        return (
          <TouchableOpacity
            key={t.key}
            onPress={() => onChange?.(t.key)}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 999,
              borderWidth: 1,
              marginRight: 6,
              opacity: active ? 1 : 0.9,
              borderColor: active ? "#3b82f6" : "#94a3b8",
              backgroundColor: active ? "rgba(59,130,246,0.15)" : "rgba(148,163,184,0.12)"
            }}
          >
            <Text style={{fontWeight: "700", color: colors.text }}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  row:  { paddingHorizontal: 4, gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  txt:  { fontSize: 14, fontWeight: "700" },
  chipContainer: {
  flexDirection: 'row',
  flexWrap: 'nowrap',  // <<<
}

});
