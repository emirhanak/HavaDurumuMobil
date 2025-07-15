import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import CustomMarker from './CustomMarker';
import { mapStyle } from '@/temalar/mapStyle';

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

export default function HavaDurumuHaritasi({ sehirler }: HavaDurumuHaritasiProps) {
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const turkiyeKonumu = {
    latitude: 39.9,
    longitude: 35.2,
    latitudeDelta: 15,
    longitudeDelta: 15,
  };

  const handleMarkerPress = (sehirId: string) => {
    setIsAnimating(true);
    setSelectedCityId(prevId => (prevId === sehirId ? null : sehirId));
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={turkiyeKonumu}
        // DÜZELTME: Boş bir yere tıklandığında seçimi doğrudan kaldırıyoruz.
        onPress={() => setSelectedCityId(null)}
        customMapStyle={mapStyle}
      >
        {sehirler.map((sehir) => {
          if (sehir.id === 'default_golcuk' && sehirler.length > 1) {
            return null;
          }
          
          const isSelected = selectedCityId === sehir.id;

          return (
            <Marker
              key={sehir.id}
              coordinate={{
                latitude: sehir.enlem,
                longitude: sehir.boylam,
              }}
              onPress={(e) => {
                e.stopPropagation();
                handleMarkerPress(sehir.id);
              }}
              anchor={{ x: 0.5, y: 1.1 }}
              tracksViewChanges={isAnimating}
            >
              <CustomMarker
                sehir={sehir}
                isSelected={isSelected}
              />
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});