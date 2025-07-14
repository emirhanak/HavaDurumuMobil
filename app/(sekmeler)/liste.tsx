import React from 'react';
import { StyleSheet, SafeAreaView, View, Text, StatusBar } from 'react-native';
import { useSettings } from '@/context/SettingsContext';
import { useSehirler } from '@/context/SehirContext';
import SehirArama from '@/components/SehirArama';
import SehirListesi from '@/components/SehirListesi';

export default function ListeEkrani() {
  const { colors } = useSettings();
  const { 
    sehirler, 
    sehirEkle, 
    sehirKaldir, 
    setAktifSehir 
  } = useSehirler();

  const ListeBasligi = () => (
    <View style={styles.bolum}>
      <Text style={[styles.baslik, { color: colors.text }]}>Şehir Yönetimi</Text>
      <SehirArama 
        onSehirEkle={sehirEkle} 
        mevcutSehirler={sehirler} 
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.background === '#1E1E1E' ? 'light-content' : 'dark-content'} />
      <SehirListesi 
        sehirler={sehirler} 
        sehirKaldir={sehirKaldir}
        setAktifSehir={setAktifSehir}
        ListHeaderComponent={<ListeBasligi />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bolum: { 
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  baslik: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 16, 
  },
});