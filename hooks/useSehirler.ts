import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Sehir {
  id: string;
  ad: string;
  enlem: number;
  boylam: number;
  sicaklik: number;
}

const SEHIRLER_KEY = '@sehirler';

export function useSehirler() {
  const [sehirler, sehirleriAyarla] = useState<Sehir[]>([]);
  const [loading, yukleniyor] = useState(true);

  // Load sehirler from storage on mount
  useEffect(() => {
    sehirleriYukle();
  }, []);

  const sehirleriYukle = async () => {
    try {
      const kayitliSehirler = await AsyncStorage.getItem(SEHIRLER_KEY);
      if (kayitliSehirler) {
        sehirleriAyarla(JSON.parse(kayitliSehirler));
      }
    } catch (error) {
      console.error('Sehirler yüklenirken hata oluştu:', error);
    } finally {
      yukleniyor(false);
    }
  };

  const sehirleriKaydet = async (yeniSehirler: Sehir[]) => {
    try {
      await AsyncStorage.setItem(SEHIRLER_KEY, JSON.stringify(yeniSehirler));
      sehirleriAyarla(yeniSehirler);
    } catch (error) {
      console.error('Sehirler kaydedilirken hata oluştu:', error);
    }
  };

  const sehirEkle = async (sehir: Sehir) => {
    const yeniSehirler = [...sehirler, sehir];
    await sehirleriKaydet(yeniSehirler);
  };

  const sehirKaldir = async (sehirId: string) => {
    const yeniSehirler = sehirler.filter(sehir => sehir.id !== sehirId);
    await sehirleriKaydet(yeniSehirler);
    sehirleriAyarla(yeniSehirler);
  };

  const sehirSicaklikGuncelle = async (sehirId: string, sicaklik: number) => {
    const yeniSehirler = sehirler.map(sehir =>
      sehir.id === sehirId ? { ...sehir, sicaklik: sicaklik } : sehir
    );
    await sehirleriKaydet(yeniSehirler);
  };

  return {
    sehirler,
    loading,
    sehirEkle,
    sehirKaldir,
    sehirSicaklikGuncelle,
  };
}