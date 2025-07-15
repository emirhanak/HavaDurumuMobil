import React from 'react';
import { StyleSheet, SafeAreaView, View, StatusBar } from 'react-native';
import { useSettings } from '@/context/SettingsContext';
import { useSehirler } from '@/context/SehirContext';
import SehirArama from '@/components/SehirArama';
import SehirListesi from '@/components/SehirListesi';

export default function ListeEkrani() {
  const { colors } = useSettings();
  // Artık sadece bu üçüne ihtiyacımız var
  const { sehirler, sehirEkle, sehirKaldir } = useSehirler();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.background === '#1E1E1E' ? 'light-content' : 'dark-content'} />
      
      <View style={styles.aramaKapsayici}>
        <SehirArama 
          onSehirEkle={sehirEkle} 
          mevcutSehirler={sehirler} 
        />
      </View>
      
      {/* SehirListesi artık daha az prop alıyor */}
      <SehirListesi 
        sehirler={sehirler} 
        sehirKaldir={sehirKaldir}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  aramaKapsayici: {
    paddingTop: 60, // Üstten boşluk
    paddingHorizontal: 16,
  }
});