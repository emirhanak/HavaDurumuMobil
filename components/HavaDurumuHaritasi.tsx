import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Platform-specific map import
let MapView: React.ComponentType<any> | null = null;
let Marker: React.ComponentType<any> | null = null;

if (Platform.OS !== 'web') {
  try {
    const MapModule = require('react-native-maps');
    MapView = MapModule.default;
    Marker = MapModule.Marker;
  } catch (error) {
    console.warn('Maps not available on this platform');
  }
}

const { width, height } = Dimensions.get('window');

interface Sehir {
  id: string;
  ad: string;
  enlem: number;
  boylam: number;
  sicaklik: number;
}

interface HavaDurumuHaritasiProps {
  sehirler: Sehir[];
}

type HaritaKatmani = 'precipitation' | 'sicaklik' | 'air-quality' | 'wind';

const haritaKatmanlari: { key: HaritaKatmani; title: string }[] = [
  { key: 'precipitation', title: 'Yağış' },
  { key: 'sicaklik', title: 'Sıcaklık' },
  { key: 'air-quality', title: 'Hava Kalitesi' },
  { key: 'wind', title: 'Rüzgar' },
];

export default function HavaDurumuHaritasi({ sehirler }: HavaDurumuHaritasiProps) {
  const [seciliKatman, setSeciliKatman] = useState<HaritaKatmani>('precipitation');

  const isaretciRengiGetir = (katman: HaritaKatmani) => {
    switch (katman) {
      case 'precipitation':
        return '#4A90E2';
      case 'sicaklik':
        return '#FF6B6B';
      case 'air-quality':
        return '#4ECDC4';
      case 'wind':
        return '#95E1D3';
      default:
        return '#4A90E2';
    }
  };

  const webGorunumunuRenderla = () => (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e3c72', '#2a5298', '#4c6ef5']}
        style={styles.backgroundGradient}
      />
      {/* Katman Seçici */}
      <View style={styles.layerSelector}>
        <BlurView intensity={80} style={styles.layerSelectorBlur}>
          {haritaKatmanlari.map((katman) => (
            <TouchableOpacity
              key={katman.key}
              style={[
                styles.layerButton,
                seciliKatman === katman.key && styles.layerButtonActive,
              ]}
              onPress={() => setSeciliKatman(katman.key)}
            >
              <Text
                style={[
                  styles.layerButtonText,
                  seciliKatman === katman.key && styles.layerButtonTextActive,
                ]}
              >
                {katman.title}
              </Text>
            </TouchableOpacity>
          ))}
        </BlurView>
      </View>

      {/* Web Harita Placeholder */}
      <View style={styles.haritaplaceholder}>
        <BlurView intensity={80} style={styles.haritaplaceholderBlurlama}>
          <Text style={styles.haritaplaceholderBaslik}>Harita Görünümü</Text>
          <Text style={styles.haritaplaceholderMetin}>
            Web platformunda harita görünümü desteklenmemektedir.
            Mobil uygulamayı kullanarak harita özelliklerini deneyimleyebilirsiniz.
          </Text>
          {/* Şehir Listesi */}
          {sehirler.length > 0 && (
            <View style={styles.sehirListesi}>
              <Text style={styles.sehirListesiBaslik}>Şehirler:</Text>
              {sehirler.map((sehir) => (
                <View key={sehir.id} style={styles.sehirItem}>
                  <View
                    style={[
                      styles.sehirNoktasi,
                      { backgroundColor: isaretciRengiGetir(seciliKatman) },
                    ]}
                  />
                  <Text style={styles.sehirAdi}>{sehir.ad}</Text>
                  <Text style={styles.sehirSicaklik}>{sehir.sicaklik}°</Text>
                </View>
              ))}
            </View>
          )}
        </BlurView>
      </View>
      {/* Katman Bilgi */}
      <View style={styles.layerInfo}>
        <BlurView intensity={80} style={styles.layerInfoBlur}>
          <Text style={styles.layerInfoTitle}>
            {haritaKatmanlari.find(l => l.key === seciliKatman)?.title} Haritası
          </Text>
          <Text style={styles.layerInfoDescription}>
            {seciliKatman === 'precipitation' && 'Yağış yoğunluğu ve dağılımı'}
            {seciliKatman === 'sicaklik' && 'Sıcaklık dağılımı'}
            {seciliKatman === 'air-quality' && 'Hava kalitesi indeksi'}
            {seciliKatman === 'wind' && 'Rüzgar hızı ve yönü'}
          </Text>
        </BlurView>
      </View>
    </View>
  );

  const renderNativeView = () => (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e3c72', '#2a5298', '#4c6ef5']}
        style={styles.backgroundGradient}
      />
      
      {/* Map Layer Selector */}
      <View style={styles.layerSelector}>
        <BlurView intensity={80} style={styles.layerSelectorBlur}>
          {haritaKatmanlari.map((katman) => (
            <TouchableOpacity
              key={katman.key}
              style={[
                styles.layerButton,
                seciliKatman === katman.key && styles.layerButtonActive,
              ]}
              onPress={() => setSeciliKatman(katman.key)}
            >
              <Text
                style={[
                  styles.layerButtonText,
                  seciliKatman === katman.key && styles.layerButtonTextActive,
                ]}
              >
                {katman.title}
              </Text>
            </TouchableOpacity>
          ))}
        </BlurView>
      </View>

      {/* Native Map */}
      {MapView && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 40.7831,
            longitude: 29.9167,
            latitudeDelta: 8.0,
            longitudeDelta: 8.0,
          }}
          mapType="standard"
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          {sehirler.map((sehir) => (
            Marker && (
              <Marker
                key={sehir.id}
                coordinate={{
                  latitude: sehir.enlem,
                  longitude: sehir.boylam,
                }}
              >
                <View style={styles.markerContainer}>
                  <BlurView intensity={80} style={styles.markerBlur}>
                    <View
                      style={[
                        styles.markerDot,
                        { backgroundColor: isaretciRengiGetir(seciliKatman) },
                      ]}
                    />
                    <Text style={styles.markerText}>{sehir.sicaklik}°</Text>
                  </BlurView>
                </View>
              </Marker>
            )
          ))}
        </MapView>
      )}

      {/* Layer Info */}
      <View style={styles.layerInfo}>
        <BlurView intensity={80} style={styles.layerInfoBlur}>
          <Text style={styles.layerInfoTitle}>
            {haritaKatmanlari.find(l => l.key === seciliKatman)?.title} Haritası
          </Text>
          <Text style={styles.layerInfoDescription}>
            {seciliKatman === 'precipitation' && 'Yağış yoğunluğu ve dağılımı'}
            {seciliKatman === 'sicaklik' && 'Sıcaklık dağılımı'}
            {seciliKatman === 'air-quality' && 'Hava kalitesi indeksi'}
            {seciliKatman === 'wind' && 'Rüzgar hızı ve yönü'}
          </Text>
        </BlurView>
      </View>
    </View>
  );

  return Platform.OS === 'web' ? webGorunumunuRenderla() : renderNativeView();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3c72',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  map: {
    flex: 1,
  },
  layerSelector: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1000,
  },
  layerSelectorBlur: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
  },
  layerButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: 100,
  },
  layerButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  layerButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  layerButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerBlur: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  markerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  markerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  haritaplaceholder: {
    flex: 1,
    margin: 20,
    marginTop: 140,
    marginBottom: 200,
  },
  haritaplaceholderBlurlama: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  haritaplaceholderBaslik: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  haritaplaceholderMetin: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  sehirListesi: {
    width: '100%',
    maxWidth: 300,
  },
  sehirListesiBaslik: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  sehirItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 8,
  },
  sehirNoktasi: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  sehirAdi: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  sehirSicaklik: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  layerInfo: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  layerInfoBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
  },
  layerInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  layerInfoDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});