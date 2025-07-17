import React, { useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Alert, Platform } from 'react-native';
import MapView, { Marker, UrlTile, PROVIDER_GOOGLE } from 'react-native-maps';
import CustomMarker from './CustomMarker';
import { mapStyle } from '@/temalar/mapStyle';
import { Layers, Send, List, CloudRain, Thermometer, Wind } from 'lucide-react-native';
import LayerMenu from './LayerMenu';
import MapLegend from './MapLegend';
import * as Location from 'expo-location';
import { fetchWeatherFromBackend } from '@/services/havaDurumuService';

// --- Tipler ve Sabitler ---
const ikonlar = { CloudRain, Thermometer, Wind };
export type KatmanIkonAdi = keyof typeof ikonlar;
export type KatmanKey = 'precipitation_new' | 'temperature_new' | 'wind_speed';
export interface HaritaKatmani {
  key: KatmanKey;
  title: string;
  iconName: KatmanIkonAdi;
}
interface Sehir {
  id: string;
  ad: string;
  enlem: number;
  boylam: number;
  sicaklik: number;
  enDusuk?: number;
  enYuksek?: number;
}
interface HavaDurumuHaritasiProps {
  sehirler: Sehir[];
}

export const haritaKatmanlari: HaritaKatmani[] = [
    { key: 'precipitation_new', title: 'Yağış', iconName: 'CloudRain' },
    { key: 'temperature_new', title: 'Sıcaklık', iconName: 'Thermometer' },
    { key: 'wind_speed', title: 'Rüzgar', iconName: 'Wind' },
];

const JAVA_BACKEND_URL = 'http://192.168.1.46:8080/api'; // KENDİ IP ADRESİNİZİ GİRİN

export default function HavaDurumuHaritasi({ sehirler }: HavaDurumuHaritasiProps) {
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  // DÜZELTME: 'any' yerine doğru tipi belirtiyoruz
  const [aktifKatman, setAktifKatman] = useState<KatmanKey | null>(null);
  const [menuGorunur, setMenuGorunur] = useState(false);
  const [konumum, setKonumum] = useState<Sehir | null>(null);
  
  const mapRef = useRef<MapView>(null);

  const tileUrl = aktifKatman ? `${JAVA_BACKEND_URL}/map/${aktifKatman}/{z}/{x}/{y}.png` : undefined;
  const turkiyeKonumu = { latitude: 39.9, longitude: 35.2, latitudeDelta: 15, longitudeDelta: 15 };

  const handleMarkerPress = (sehirId: string) => {
    setSelectedCityId(prevId => (prevId === sehirId ? null : sehirId));
  };

  const KonumumaGit = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Konumunuza gidebilmek için konum izni vermeniz gerekiyor.');
      return;
    }
    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const data = await fetchWeatherFromBackend(latitude, longitude);
      if (!data) throw new Error("Backend'den veri alınamadı.");
      const yeniKonum: Sehir = {
        id: 'user_location',
        ad: 'Konumum',
        enlem: latitude,
        boylam: longitude,
        sicaklik: Math.round(data.anlikHavaDurumu.sicaklik),
        enDusuk: Math.round(data.anlikHavaDurumu.enDusuk),
        enYuksek: Math.round(data.anlikHavaDurumu.enYuksek),
      };
      setKonumum(yeniKonum);
      mapRef.current?.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      }, 1000);
      setTimeout(() => { handleMarkerPress(yeniKonum.id); }, 1100);
    } catch (error) {
      Alert.alert('Hata', 'Konum bilgisi alınamadı veya sunucuya ulaşılamadı.');
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={turkiyeKonumu}
        onPress={() => setSelectedCityId(null)}
        customMapStyle={mapStyle}
      >
        {tileUrl && <UrlTile urlTemplate={tileUrl} zIndex={1} opacity={0.6} />}
        {sehirler.map((sehir) => {
          if (sehir.id === 'default_golcuk' && sehirler.length > 1) return null;
          const isSelected = selectedCityId === sehir.id;
          return (
            <Marker
              key={sehir.id}
              coordinate={{ latitude: sehir.enlem, longitude: sehir.boylam }}
              onPress={(e) => { e.stopPropagation(); handleMarkerPress(sehir.id); }}
              anchor={{ x: 0.5, y: 1.1 }}
              zIndex={isSelected ? 10 : 2}
            >
              <CustomMarker sehir={sehir} isSelected={isSelected} />
            </Marker>
          );
        })}
        {konumum && (
          <Marker
            key={konumum.id}
            coordinate={{ latitude: konumum.enlem, longitude: konumum.boylam }}
            onPress={(e) => { e.stopPropagation(); handleMarkerPress(konumum.id); }}
            anchor={{ x: 0.5, y: 1.1 }}
            zIndex={selectedCityId === konumum.id ? 10 : 3}
          >
            <CustomMarker sehir={konumum} isSelected={selectedCityId === konumum.id} />
          </Marker>
        )}
      </MapView>
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.controlButton} onPress={KonumumaGit}>
          <Send size={20} color="white" style={{ transform: [{ rotate: '-45deg' }] }}/>
        </TouchableOpacity>
      
      
      </View>
      {aktifKatman && <MapLegend aktifKatman={aktifKatman} />}
      <LayerMenu
        visible={menuGorunur}
        aktifKatman={aktifKatman}
        onKatmanSec={(katman) => {
          setAktifKatman(prev => prev === katman ? null : katman);
          setMenuGorunur(false);
        }}
        onClose={() => setMenuGorunur(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  controlsContainer: { position: 'absolute', top: 60, right: 15, gap: 12 },
  controlButton: {
    backgroundColor: 'rgba(50,50,50,0.8)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 4,
  },
});