import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CitySearch from '@/components/CitySearch';
import CityList from '@/components/CityList';
import { useCityStorage } from '@/hooks/useCityStorage';

export default function ListScreen() {
  const { cities, loading, addCity, removeCity } = useCityStorage();

  const handleSelectCity = (city: any) => {
    // This function is now optional since navigation is handled in CityList
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1e3c72', '#2a5298', '#4c6ef5']}
          style={styles.backgroundGradient}
        />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1e3c72', '#2a5298', '#4c6ef5']}
        style={styles.backgroundGradient}
      />
      <View style={styles.content}>
        <Text style={styles.title}>Şehirler</Text>
        <CitySearch onAddCity={addCity} existingCities={cities} />
        <CityList
          cities={cities}
          onRemoveCity={removeCity}
          onSelectCity={handleSelectCity}
        />
      </View>
    </SafeAreaView>
  );
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 100,
  }
});