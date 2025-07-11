import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Search, Plus } from 'lucide-react-native';

interface Sehir {
  id: string;
  ad: string;
  enlem: number;
  boylam: number;
  sicaklik: number;
}

interface SehirAramaProps {
  onSehirEkle: (sehir: Sehir) => void;
  mevcutSehirler: Sehir[];
}

// Mock city database - in a real app, this would come from an API
const SEHIR_DATABASE: Omit<Sehir, 'id' | 'sicaklik'>[] = [
  { ad: 'Ankara', enlem: 39.9334, boylam: 32.8597 },
  { ad: 'İstanbul', enlem: 41.0082, boylam: 28.9784 },
  { ad: 'İzmir', enlem: 38.4192, boylam: 27.1287 },
  { ad: 'Antalya', enlem: 36.8969, boylam: 30.7133 },
  { ad: 'Bursa', enlem: 40.1826, boylam: 29.0665 },
  { ad: 'Adana', enlem: 37.0000, boylam: 35.3213 },
  { ad: 'Gaziantep', enlem: 37.0662, boylam: 37.3833 },
  { ad: 'Konya', enlem: 37.8667, boylam: 32.4833 },
  { ad: 'Mersin', enlem: 36.8000, boylam: 34.6333 },
  { ad: 'Diyarbakır', enlem: 37.9144, boylam: 40.2306 },
  { ad: 'Kayseri', enlem: 38.7312, boylam: 35.4787 },
  { ad: 'Eskişehir', enlem: 39.7767, boylam: 30.5206 },
  { ad: 'Urfa', enlem: 37.1591, boylam: 38.7969 },
  { ad: 'Malatya', enlem: 38.3552, boylam: 38.3095 },
  { ad: 'Erzurum', enlem: 39.9000, boylam: 41.2700 },
  { ad: 'Van', enlem: 38.4891, boylam: 43.4089 },
  { ad: 'Batman', enlem: 37.8812, boylam: 41.1351 },
  { ad: 'Elazığ', enlem: 38.6810, boylam: 39.2264 },
  { ad: 'Trabzon', enlem: 41.0015, boylam: 39.7178 },
  { ad: 'Samsun', enlem: 41.2928, boylam: 36.3313 },
];

export default function SehirArama({ onSehirEkle, mevcutSehirler }: SehirAramaProps) {
  const [aramaMetni, setAramaMetni] = useState('');
  const [oneriler, setOneriler] = useState<Omit<Sehir, 'id' | 'sicaklik'>[]>([]);
  const [onerileriGoster, setOnerileriGoster] = useState(false);

  useEffect(() => {
    if (aramaMetni.length > 0) {
      const filtrelenen = SEHIR_DATABASE.filter(
        (sehir) =>
          sehir.ad.toLowerCase().includes(aramaMetni.toLowerCase()) &&
          !mevcutSehirler.some((mevcut) => mevcut.ad === sehir.ad)
      );
      setOneriler(filtrelenen);
      setOnerileriGoster(true);
    } else {
      setOneriler([]);
      setOnerileriGoster(false);
    }
  }, [aramaMetni, mevcutSehirler]);

  const sehirEkleHandler = (sehirVerisi: Omit<Sehir, 'id' | 'sicaklik'>) => {
    const yeniSehir: Sehir = {
      ...sehirVerisi,
      id: Date.now().toString(),
      sicaklik: Math.floor(Math.random() * 30) + 5,
    };
    onSehirEkle(yeniSehir);
    setAramaMetni('');
    setOnerileriGoster(false);
    Keyboard.dismiss();
  };

  const oneriyiRenderla = ({ item }: { item: Omit<Sehir, 'id' | 'sicaklik'> }) => (
    <TouchableOpacity
      style={styles.oneriItem}
      onPress={() => sehirEkleHandler(item)}
    >
      <Text style={styles.oneriMetni}>{item.ad}</Text>
      <Plus size={20} color="rgba(255, 255, 255, 0.6)" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.kapsayici}>
      <BlurView intensity={80} style={styles.containerAra}>
        <View style={styles.inputContainerAra}>
          <Search size={20} color="rgba(255, 255, 255, 0.6)" style={styles.iconAra} />
          <TextInput
            style={styles.inputAra}
            placeholder="Şehir ara..."
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            value={aramaMetni}
            onChangeText={setAramaMetni}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>
      </BlurView>

      {onerileriGoster && oneriler.length > 0 && (
        <View style={styles.containerOnerileri}>
          <BlurView intensity={80} style={styles.onerilerBlurlama}>
            <FlatList
              data={oneriler}
              renderItem={oneriyiRenderla}
              keyExtractor={(item) => item.ad}
              style={styles.onerilerListesi}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          </BlurView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  kapsayici: {
    marginBottom: 20,
  },
  containerAra: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputContainerAra: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconAra: {
    marginRight: 12,
  },
  inputAra: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '400',
  },
  containerOnerileri: {
    marginTop: 8,
    maxHeight: 200,
  },
  onerilerBlurlama: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  onerilerListesi: {
    maxHeight: 200,
  },
  oneriItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  oneriMetni: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '400',
  },
});