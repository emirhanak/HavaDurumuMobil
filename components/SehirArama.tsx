import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Keyboard, Alert } from 'react-native';
import { Search, Plus } from 'lucide-react-native';
import { useSettings } from '@/context/SettingsContext';
import SEHIR_DATABASE from '../mocks/mockSehirlerTR.json';
import { fetchWeatherFromBackend } from '@/services/havaDurumuService';
import { Sehir } from '@/context/SehirContext'; // DÜZELTME: Sehir tipini merkezi yerden import ediyoruz

// Buradaki yerel 'interface Sehir' tanımını siliyoruz.

interface SehirAramaProps {
  onSehirEkle: (sehir: Sehir) => void;
  mevcutSehirler: Sehir[];
}
// Mock city database - in a real app, this would come from an API
/*const SEHIR_DATABASE: Omit<Sehir, 'id' | 'sicaklik'>[] = [
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
*/


export default function SehirArama({ onSehirEkle, mevcutSehirler }: SehirAramaProps) {
  const { colors, theme } = useSettings();
  const [aramaMetni, setAramaMetni] = useState('');
  const [oneriler, setOneriler] = useState<Omit<Sehir, 'id' | 'sicaklik' | 'enDusuk' | 'enYuksek'>[]>([]);

  useEffect(() => {
    setOneriler(aramaMetni.length > 0 ? SEHIR_DATABASE.filter(s => s.ad.toLowerCase().includes(aramaMetni.toLowerCase()) && !mevcutSehirler.some(m => m.ad === s.ad)) : []);
  }, [aramaMetni, mevcutSehirler]);

  const sehirEkleHandler = async (sehirVerisi: Omit<Sehir, 'id' | 'sicaklik' | 'enDusuk' | 'enYuksek'>) => {
    try {
      const anlikVeri = await fetchWeatherFromBackend(sehirVerisi.enlem, sehirVerisi.boylam);
      if (!anlikVeri || !anlikVeri.anlikHavaDurumu) { throw new Error('API yanıtı beklenen formatta değil.'); }
      
      const anlikSicaklik = Math.round(anlikVeri.anlikHavaDurumu.sicaklik);
      const enDusukSicaklik = Math.round(anlikVeri.anlikHavaDurumu.enDusuk);
      const enYuksekSicaklik = Math.round(anlikVeri.anlikHavaDurumu.enYuksek);

      const yeniSehir: Sehir = {
        ...sehirVerisi,
        id: Date.now().toString(),
        sicaklik: anlikSicaklik,
        enDusuk: enDusukSicaklik,
        enYuksek: enYuksekSicaklik,
      };
      
      onSehirEkle(yeniSehir);
      setAramaMetni('');
      Keyboard.dismiss();
    } catch (error) {
      Alert.alert('Hata', 'Şehir eklenemedi. Lütfen internet bağlantınızı ve backend sunucunuzun çalıştığını kontrol edin.');
    }
  };

  const cardStyle = theme === 'light' ? styles.cardShadow : {};

  const oneriyiRenderla = ({ item }: { item: Omit<Sehir, 'id' | 'sicaklik' | 'enDusuk' | 'enYuksek'> }) => (
    <TouchableOpacity 
      style={[styles.oneriItem, { borderBottomColor: colors.borderColor }]} 
      onPress={() => sehirEkleHandler(item)}
    >
      <Text style={[styles.oneriMetni, { color: colors.text }]}>{item.ad}</Text>
      <Plus size={20} color={colors.icon} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.kapsayici}>
      <View style={[styles.containerAra, cardStyle, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
        <View style={styles.inputContainerAra}>
          <Search size={20} color={colors.icon} style={styles.iconAra} />
          <TextInput
            style={[styles.inputAra, { color: colors.text }]}
            placeholder="Şehir ara..."
            placeholderTextColor={colors.icon}
            value={aramaMetni}
            onChangeText={setAramaMetni}
          />
        </View>
      </View>
      {oneriler.length > 0 && (
        <View style={styles.containerOnerileri}>
          <View style={[styles.onerilerKutusu, cardStyle, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
            <FlatList
              data={oneriler}
              renderItem={oneriyiRenderla}
              keyExtractor={(item) => item.ad}
              ItemSeparatorComponent={() => <View style={[styles.ayirici, { backgroundColor: colors.borderColor }]} />}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  kapsayici: { zIndex: 10 },
  containerAra: { borderRadius: 12, borderWidth: 1 },
  cardShadow: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  inputContainerAra: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 50 },
  iconAra: { marginRight: 12 },
  inputAra: { flex: 1, fontSize: 16, fontWeight: '400' },
  containerOnerileri: { position: 'absolute', top: 55, left: 0, right: 0 },
  onerilerKutusu: { borderRadius: 12, borderWidth: 1, maxHeight: 220 },
  oneriItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  oneriMetni: { fontSize: 16, fontWeight: '400' },
  ayirici: { height: StyleSheet.hairlineWidth }
});