import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface City {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  temperature: number;
}

const CITIES_STORAGE_KEY = '@weather_cities';

export function useCityStorage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cities from storage on mount
  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      const storedCities = await AsyncStorage.getItem(CITIES_STORAGE_KEY);
      if (storedCities) {
        setCities(JSON.parse(storedCities));
      }
    } catch (error) {
      console.error('Error loading cities:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCities = async (newCities: City[]) => {
    try {
      await AsyncStorage.setItem(CITIES_STORAGE_KEY, JSON.stringify(newCities));
      setCities(newCities);
    } catch (error) {
      console.error('Error saving cities:', error);
    }
  };

  const addCity = async (city: City) => {
    const newCities = [...cities, city];
    await saveCities(newCities);
  };

  const removeCity = async (cityId: string) => {
    const newCities = cities.filter(city => city.id !== cityId);
    await saveCities(newCities);
  };

  const updateCityTemperature = async (cityId: string, temperature: number) => {
    const newCities = cities.map(city =>
      city.id === cityId ? { ...city, temperature } : city
    );
    await saveCities(newCities);
  };

  return {
    cities,
    loading,
    addCity,
    removeCity,
    updateCityTemperature,
  };
}