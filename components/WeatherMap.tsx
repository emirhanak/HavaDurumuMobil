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

interface City {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  temperature: number;
}

interface WeatherMapProps {
  cities: City[];
}

type MapLayer = 'precipitation' | 'temperature' | 'air-quality' | 'wind';

const mapLayers: { key: MapLayer; title: string }[] = [
  { key: 'precipitation', title: 'Yağış' },
  { key: 'temperature', title: 'Sıcaklık' },
  { key: 'air-quality', title: 'Hava Kalitesi' },
  { key: 'wind', title: 'Rüzgar' },
];

export default function WeatherMap({ cities }: WeatherMapProps) {
  const [selectedLayer, setSelectedLayer] = useState<MapLayer>('precipitation');

  const getMarkerColor = (layer: MapLayer) => {
    switch (layer) {
      case 'precipitation':
        return '#4A90E2';
      case 'temperature':
        return '#FF6B6B';
      case 'air-quality':
        return '#4ECDC4';
      case 'wind':
        return '#95E1D3';
      default:
        return '#4A90E2';
    }
  };

  const renderWebView = () => (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1e3c72', '#2a5298', '#4c6ef5']}
        style={styles.backgroundGradient}
      />
      
      {/* Map Layer Selector */}
      <View style={styles.layerSelector}>
        <BlurView intensity={80} style={styles.layerSelectorBlur}>
          {mapLayers.map((layer) => (
            <TouchableOpacity
              key={layer.key}
              style={[
                styles.layerButton,
                selectedLayer === layer.key && styles.layerButtonActive,
              ]}
              onPress={() => setSelectedLayer(layer.key)}
            >
              <Text
                style={[
                  styles.layerButtonText,
                  selectedLayer === layer.key && styles.layerButtonTextActive,
                ]}
              >
                {layer.title}
              </Text>
            </TouchableOpacity>
          ))}
        </BlurView>
      </View>

      {/* Web Map Placeholder */}
      <View style={styles.mapPlaceholder}>
        <BlurView intensity={80} style={styles.mapPlaceholderBlur}>
          <Text style={styles.mapPlaceholderTitle}>Harita Görünümü</Text>
          <Text style={styles.mapPlaceholderText}>
            Web platformunda harita görünümü desteklenmemektedir.
            Mobil uygulamayı kullanarak harita özelliklerini deneyimleyebilirsiniz.
          </Text>
          
          {/* City List for Web */}
          {cities.length > 0 && (
            <View style={styles.cityList}>
              <Text style={styles.cityListTitle}>Şehirler:</Text>
              {cities.map((city) => (
                <View key={city.id} style={styles.cityItem}>
                  <View
                    style={[
                      styles.cityDot,
                      { backgroundColor: getMarkerColor(selectedLayer) },
                    ]}
                  />
                  <Text style={styles.cityName}>{city.name}</Text>
                  <Text style={styles.cityTemp}>{city.temperature}°</Text>
                </View>
              ))}
            </View>
          )}
        </BlurView>
      </View>

      {/* Layer Info */}
      <View style={styles.layerInfo}>
        <BlurView intensity={80} style={styles.layerInfoBlur}>
          <Text style={styles.layerInfoTitle}>
            {mapLayers.find(l => l.key === selectedLayer)?.title} Haritası
          </Text>
          <Text style={styles.layerInfoDescription}>
            {selectedLayer === 'precipitation' && 'Yağış yoğunluğu ve dağılımı'}
            {selectedLayer === 'temperature' && 'Sıcaklık dağılımı'}
            {selectedLayer === 'air-quality' && 'Hava kalitesi indeksi'}
            {selectedLayer === 'wind' && 'Rüzgar hızı ve yönü'}
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
          {mapLayers.map((layer) => (
            <TouchableOpacity
              key={layer.key}
              style={[
                styles.layerButton,
                selectedLayer === layer.key && styles.layerButtonActive,
              ]}
              onPress={() => setSelectedLayer(layer.key)}
            >
              <Text
                style={[
                  styles.layerButtonText,
                  selectedLayer === layer.key && styles.layerButtonTextActive,
                ]}
              >
                {layer.title}
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
          {cities.map((city) => (
            <Marker
              key={city.id}
              coordinate={{
                latitude: city.latitude,
                longitude: city.longitude,
              }}
            >
              <View style={styles.markerContainer}>
                <BlurView intensity={80} style={styles.markerBlur}>
                  <View
                    style={[
                      styles.markerDot,
                      { backgroundColor: getMarkerColor(selectedLayer) },
                    ]}
                  />
                  <Text style={styles.markerText}>{city.temperature}°</Text>
                </BlurView>
              </View>
            </Marker>
          ))}
        </MapView>
      )}

      {/* Layer Info */}
      <View style={styles.layerInfo}>
        <BlurView intensity={80} style={styles.layerInfoBlur}>
          <Text style={styles.layerInfoTitle}>
            {mapLayers.find(l => l.key === selectedLayer)?.title} Haritası
          </Text>
          <Text style={styles.layerInfoDescription}>
            {selectedLayer === 'precipitation' && 'Yağış yoğunluğu ve dağılımı'}
            {selectedLayer === 'temperature' && 'Sıcaklık dağılımı'}
            {selectedLayer === 'air-quality' && 'Hava kalitesi indeksi'}
            {selectedLayer === 'wind' && 'Rüzgar hızı ve yönü'}
          </Text>
        </BlurView>
      </View>
    </View>
  );

  return Platform.OS === 'web' ? renderWebView() : renderNativeView();
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
  mapPlaceholder: {
    flex: 1,
    margin: 20,
    marginTop: 140,
    marginBottom: 200,
  },
  mapPlaceholderBlur: {
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
  mapPlaceholderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  cityList: {
    width: '100%',
    maxWidth: 300,
  },
  cityListTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 8,
  },
  cityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  cityName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  cityTemp: {
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