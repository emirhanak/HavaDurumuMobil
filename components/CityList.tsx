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

interface City {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  temperature: number;
}

interface CityListProps {
  cities: City[];
  onRemoveCity: (cityId: string) => void;
  onSelectCity?: (city: City) => void;
}

export default function CityList({ cities, onRemoveCity, onSelectCity }: CityListProps) {
  const handleRemoveCity = (city: City) => {
    Alert.alert(
      'Şehri Kaldır',
      `${city.name} şehrini listeden kaldırmak istediğinizden emin misiniz?`,
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: () => onRemoveCity(city.id),
        },
      ]
    );
  };

  const handleCityPress = (city: City) => {
    router.push(`/(tabs)/weather/${encodeURIComponent(city.name)}?temperature=${city.temperature}`);
  };
  const renderCity = ({ item }: { item: City }) => (
    <TouchableOpacity
      style={styles.cityItem}
      onPress={() => handleCityPress(item)}
    >
      <BlurView intensity={80} style={styles.cityItemBlur}>
        <View style={styles.cityItemContent}>
          <View style={styles.cityInfo}>
            <View style={styles.cityHeader}>
              <MapPin size={16} color="rgba(255, 255, 255, 0.6)" />
              <Text style={styles.cityName}>{item.name}</Text>
            </View>
            <Text style={styles.cityCoordinates}>
              {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
            </Text>
          </View>
          <View style={styles.cityActions}>
            <Text style={styles.cityTemperature}>{item.temperature}°</Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveCity(item)}
            >
              <Trash2 size={18} color="rgba(255, 255, 255, 0.6)" />
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  if (cities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <BlurView intensity={80} style={styles.emptyBlur}>
          <MapPin size={48} color="rgba(255, 255, 255, 0.4)" />
          <Text style={styles.emptyTitle}>Henüz şehir eklenmedi</Text>
          <Text style={styles.emptyDescription}>
            Yukarıdaki arama kutusunu kullanarak şehir ekleyebilirsiniz
          </Text>
        </BlurView>
      </View>
    );
  }

  return (
    <FlatList
      data={cities}
      renderItem={renderCity}
      keyExtractor={(item) => item.id}
      style={styles.list}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  cityItem: {
    marginBottom: 12,
  },
  cityItemBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cityItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  cityInfo: {
    flex: 1,
  },
  cityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cityName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  cityCoordinates: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 24,
  },
  cityActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityTemperature: {
    fontSize: 24,
    fontWeight: '300',
    color: '#ffffff',
    marginRight: 16,
  },
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyBlur: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
  },
});