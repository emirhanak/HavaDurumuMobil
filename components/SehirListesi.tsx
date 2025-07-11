import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MapPin, Trash2 } from 'lucide-react-native';
import { router } from 'expo-router';

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
  onSehirSec?: (sehir: Sehir) => void;
}

export default function SehirListesi({ sehirler, sehirKaldir, onSehirSec }: SehirListesiProps) {
  const sehirSecHandler = (sehir: Sehir) => {
    sehirKaldir(sehir.id);
  };

  const handleSehirPress = (sehir: Sehir) => {
    router.push(`/(sekmeler)/havadurumu/${encodeURIComponent(sehir.ad)}?sicaklik=${sehir.sicaklik}` as any);
  };
  const sehirRender = ({ item }: { item: Sehir }) => (
    <TouchableOpacity
      style={styles.sehirItem}
      onPress={() => {
        sehirSecHandler(item);
        if (onSehirSec) onSehirSec(item);
      }}
    >
      <BlurView intensity={80} style={styles.sehirItemBlurlama}>
        <View style={styles.sehirItemContent}>
          <View style={styles.sehirInfo}>
            <View style={styles.sehirHeader}>
              <MapPin size={16} color="rgba(255, 255, 255, 0.6)" />
              <Text style={styles.sehirAdi}>{item.ad}</Text>
            </View>
            <Text style={styles.sehirKoordinat}>
              {item.enlem}, {item.boylam}
            </Text>
          </View>
          <View style={styles.sehirIslemleri}>
            <Text style={styles.sehirSicaklik}>{item.sicaklik}°</Text>
            <TouchableOpacity
              style={styles.kaldirButonu}
              onPress={() => sehirSecHandler(item)}
            >
              <Trash2 size={18} color="rgba(255, 255, 255, 0.6)" />
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  if (sehirler.length === 0) {
    return (
      <View style={styles.bosContainer}>
        <BlurView intensity={80} style={styles.bosBlurlama}>
          <MapPin size={48} color="rgba(255, 255, 255, 0.4)" />
          <Text style={styles.bosTitle}>Henüz şehir eklenmedi</Text>
          <Text style={styles.bosAciklama}>
            Şehir eklemek için arama yapın ve ekleyin.
          </Text>
        </BlurView>
      </View>
    );
  }

  return (
    <FlatList
      data={sehirler}
      renderItem={sehirRender}
      keyExtractor={(item) => item.id}
      style={styles.liste}
      contentContainerStyle={styles.listeContent}
    />
  );
}

const styles = StyleSheet.create({
  liste: {
    flex: 1,
  },
  listeContent: {
    paddingBottom: 20,
  },
  sehirItem: {
    marginBottom: 12,
  },
  sehirItemBlurlama: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sehirItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  sehirInfo: {
    flex: 1,
  },
  sehirHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sehirAdi: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  sehirKoordinat: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 24,
  },
  sehirIslemleri: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sehirSicaklik: {
    fontSize: 24,
    fontWeight: '300',
    color: '#ffffff',
    marginRight: 16,
  },
  kaldirButonu: {
    padding: 8,
  },
  bosContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  bosBlurlama: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 32,
    alignItems: 'center',
  },
  bosTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  bosAciklama: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
  },
});