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

interface City {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  temperature: number;
}

interface CitySearchProps {
  onAddCity: (city: City) => void;
  existingCities: City[];
}

// Mock city database - in a real app, this would come from an API
const CITY_DATABASE: Omit<City, 'id' | 'temperature'>[] = [
  { name: 'Ankara', latitude: 39.9334, longitude: 32.8597 },
  { name: 'İstanbul', latitude: 41.0082, longitude: 28.9784 },
  { name: 'İzmir', latitude: 38.4192, longitude: 27.1287 },
  { name: 'Antalya', latitude: 36.8969, longitude: 30.7133 },
  { name: 'Bursa', latitude: 40.1826, longitude: 29.0665 },
  { name: 'Adana', latitude: 37.0000, longitude: 35.3213 },
  { name: 'Gaziantep', latitude: 37.0662, longitude: 37.3833 },
  { name: 'Konya', latitude: 37.8667, longitude: 32.4833 },
  { name: 'Mersin', latitude: 36.8000, longitude: 34.6333 },
  { name: 'Diyarbakır', latitude: 37.9144, longitude: 40.2306 },
  { name: 'Kayseri', latitude: 38.7312, longitude: 35.4787 },
  { name: 'Eskişehir', latitude: 39.7767, longitude: 30.5206 },
  { name: 'Urfa', latitude: 37.1591, longitude: 38.7969 },
  { name: 'Malatya', latitude: 38.3552, longitude: 38.3095 },
  { name: 'Erzurum', latitude: 39.9000, longitude: 41.2700 },
  { name: 'Van', latitude: 38.4891, longitude: 43.4089 },
  { name: 'Batman', latitude: 37.8812, longitude: 41.1351 },
  { name: 'Elazığ', latitude: 38.6810, longitude: 39.2264 },
  { name: 'Trabzon', latitude: 41.0015, longitude: 39.7178 },
  { name: 'Samsun', latitude: 41.2928, longitude: 36.3313 },
];

export default function CitySearch({ onAddCity, existingCities }: CitySearchProps) {
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<Omit<City, 'id' | 'temperature'>[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (searchText.length > 0) {
      const filtered = CITY_DATABASE.filter(
        (city) =>
          city.name.toLowerCase().includes(searchText.toLowerCase()) &&
          !existingCities.some((existing) => existing.name === city.name)
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchText, existingCities]);

  const handleAddCity = (cityData: Omit<City, 'id' | 'temperature'>) => {
    const newCity: City = {
      ...cityData,
      id: Date.now().toString(),
      temperature: Math.floor(Math.random() * 30) + 5, // Mock temperature
    };
    onAddCity(newCity);
    setSearchText('');
    setShowSuggestions(false);
    Keyboard.dismiss();
  };

  const renderSuggestion = ({ item }: { item: Omit<City, 'id' | 'temperature'> }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleAddCity(item)}
    >
      <Text style={styles.suggestionText}>{item.name}</Text>
      <Plus size={20} color="rgba(255, 255, 255, 0.6)" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <BlurView intensity={80} style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="rgba(255, 255, 255, 0.6)" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Şehir ara..."
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>
      </BlurView>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <BlurView intensity={80} style={styles.suggestionsBlur}>
            <FlatList
              data={suggestions}
              renderItem={renderSuggestion}
              keyExtractor={(item) => item.name}
              style={styles.suggestionsList}
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
  container: {
    marginBottom: 20,
  },
  searchContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '400',
  },
  suggestionsContainer: {
    marginTop: 8,
    maxHeight: 200,
  },
  suggestionsBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  suggestionText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '400',
  },
});