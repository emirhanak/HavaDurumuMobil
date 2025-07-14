import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MapPin, Trash2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { useSettings } from '@/context/SettingsContext';
import { useSehirler } from '@/context/SehirContext';
// 1. DÜZELTME: Sehir tipini tam olarak tanımlıyoruz
interface Sehir {
  id: string;
  ad: string;
  enlem: number;
  boylam: number;
  sicaklik: number;
}

// 2. DÜZELTME: Component'in alacağı tüm prop'ları eksiksiz tanımlıyoruz
interface SehirListesiProps {
  sehirler: Sehir[];
  sehirKaldir: (sehirId: string) => void;
  setAktifSehir: (sehir: Sehir) => void;
  ListHeaderComponent: React.ReactElement;
}

export default function SehirListesi({
  sehirler,
  sehirKaldir,
  setAktifSehir,
  ListHeaderComponent,
}: SehirListesiProps) {
  const { colors, theme } = useSettings();
  const { aktifSehir } = useSehirler();

  const handleSehirPress = (sehir: Sehir) => {
    setAktifSehir(sehir);
    router.push('/');
  };
  
  const cardStyle = theme === 'light' ? styles.cardShadow : {};

  const sehirRender = ({ item }: { item: Sehir }) => {
    const isActive = aktifSehir?.id === item.id;
    return (
      <TouchableOpacity
        style={styles.sehirItem}
        onPress={() => handleSehirPress(item)}
      >
        <View style={[ styles.sehirItemContainer, cardStyle, { backgroundColor: isActive ? colors.tint + '30' : colors.cardBackground, borderColor: isActive ? colors.tint : colors.borderColor } ]}>
          <View style={styles.sehirInfo}>
            <MapPin size={16} color={colors.icon} />
            <Text style={[styles.sehirAdi, { color: colors.text }]}>{item.ad}</Text>
          </View>
          <View style={styles.sehirIslemleri}>
            <Text style={[styles.sehirSicaklik, { color: colors.text }]}>{item.sicaklik}°</Text>
            <TouchableOpacity
              style={styles.kaldirButonu}
              onPress={() => sehirKaldir(item.id)}
            >
              <Trash2 size={18} color={colors.icon} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (sehirler.length === 0) {
    return (
      <View style={styles.listeBosKapsayici}>
        {ListHeaderComponent}
        <View style={styles.bosContainer}>
          <MapPin size={48} color={colors.icon} />
          <Text style={[styles.bosTitle, { color: colors.text }]}>Henüz şehir eklenmedi</Text>
          <Text style={[styles.bosAciklama, { color: colors.icon }]}>Arama çubuğunu kullanarak yeni bir şehir ekleyin.</Text>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={sehirler}
      renderItem={sehirRender}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={ListHeaderComponent}
      contentContainerStyle={{ paddingTop: 10 }}
    />
  );
}

const styles = StyleSheet.create({
  cardShadow: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 5 },
  sehirItem: { paddingHorizontal: 16, marginBottom: 12 },
  sehirItemContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, borderWidth: 1 },
  sehirInfo: { flexDirection: 'row', alignItems: 'center' },
  sehirAdi: { fontSize: 18, fontWeight: '600', marginLeft: 12 },
  sehirIslemleri: { flexDirection: 'row', alignItems: 'center' },
  sehirSicaklik: { fontSize: 24, fontWeight: '300', marginRight: 16 },
  kaldirButonu: { padding: 8 },
  listeBosKapsayici: { flex: 1 },
  bosContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  bosTitle: { fontSize: 20, fontWeight: '600', marginTop: 16, marginBottom: 8, textAlign: 'center' },
  bosAciklama: { fontSize: 16, textAlign: 'center', lineHeight: 22 },
});