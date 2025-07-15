import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { MapPin, Trash2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSettings } from '@/context/SettingsContext';
import { useSehirler } from '@/context/SehirContext';

interface Sehir {
  id: string;
  ad: string;
  enlem: number;
  boylam: number;
  sicaklik: number;
}

interface SehirListesiProps {
  sehirler: Sehir[];
  sehirKaldir: (sehirId: string) => void;
}

export default function SehirListesi({ sehirler, sehirKaldir }: SehirListesiProps) {
  const { colors, theme } = useSettings();
  const { aktifSehir, setAktifSehir } = useSehirler();

  const handleSehirPress = (sehir: Sehir) => {
    // DÜZELTME: Yolu ve parametreleri ayrı ayrı, tip-güvenli bir obje olarak gönderiyoruz
    router.push({
      pathname: "/havadurumu/[sehir]",
      params: { 
        sehir: sehir.ad, 
        lat: sehir.enlem, 
        lon: sehir.boylam 
      },
    });
  };
  
  const cardStyle = theme === 'light' ? styles.cardShadow : {};

  const sehirRender = ({ item }: { item: Sehir }) => {
    const isActive = aktifSehir?.id === item.id;
    return (
      <TouchableOpacity
        style={styles.sehirItem}
        onPress={() => handleSehirPress(item)}
      >
        <View style={[ styles.sehirItemContainer, cardStyle, { backgroundColor: isActive ? colors.tint + '20' : colors.cardBackground, borderColor: isActive ? colors.tint : colors.borderColor } ]}>
          <View style={styles.sehirInfo}>
            <MapPin size={18} color={colors.icon} />
            <Text style={[styles.sehirAdi, { color: colors.text }]}>{item.ad}</Text>
          </View>
          <View style={styles.sehirIslemleri}>
            <Text style={[styles.sehirSicaklik, { color: colors.text }]}>{item.sicaklik}°</Text>
            <TouchableOpacity style={styles.kaldirButonu} onPress={() => sehirKaldir(item.id)}>
              <Trash2 size={18} color={colors.icon} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (sehirler.length === 0) {
    return (
      <View style={styles.bosContainer}>
        <MapPin size={48} color={colors.icon} />
        <Text style={[styles.bosTitle, { color: colors.text }]}>Henüz Şehir Eklenmedi</Text>
        <Text style={[styles.bosAciklama, { color: colors.icon }]}>Yukarıdaki arama çubuğunu kullanarak takip etmek istediğiniz şehirleri ekleyin.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={sehirler}
      renderItem={sehirRender}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listeContent}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  cardShadow: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 5 },
  sehirItem: { paddingHorizontal: 16, },
  sehirItemContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  sehirInfo: { flexDirection: 'row', alignItems: 'center' },
  sehirAdi: { fontSize: 18, fontWeight: '600', marginLeft: 12 },
  sehirIslemleri: { flexDirection: 'row', alignItems: 'center' },
  sehirSicaklik: { fontSize: 24, fontWeight: '300', marginRight: 16 },
  kaldirButonu: { padding: 8 },
  bosContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, marginTop: -50 },
  bosTitle: { fontSize: 20, fontWeight: '600', marginTop: 16, marginBottom: 8, textAlign: 'center' },
  bosAciklama: { fontSize: 16, textAlign: 'center', lineHeight: 22 },
  listeContent: { paddingBottom: 100, paddingTop: 20 }
});