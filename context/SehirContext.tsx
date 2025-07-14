import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Sehir {
  id: string;
  ad: string;
  enlem: number;
  boylam: number;
  sicaklik: number;
}
const SEHIRLER_KEY = '@sehirler';
const VARSAYILAN_SEHIR: Sehir = { id: 'default_golcuk', ad: 'Gölcük', enlem: 40.7186, boylam: 29.8261, sicaklik: 15 };

interface SehirContextState {
  sehirler: Sehir[];
  aktifSehir: Sehir | null;
  loading: boolean;
  sehirEkle: (sehir: Sehir) => Promise<void>;
  sehirKaldir: (sehirId: string) => Promise<void>;
  setAktifSehir: (sehir: Sehir | null) => void;
}

const SehirContext = createContext<SehirContextState | undefined>(undefined);

export const SehirProvider = ({ children }: { children: ReactNode }) => {
  const [sehirler, setSehirler] = useState<Sehir[]>([]);
  const [aktifSehir, setAktifSehir] = useState<Sehir | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sehirleriYukle = async () => {
      try {
        const kayitliSehirlerString = await AsyncStorage.getItem(SEHIRLER_KEY);
        const yuklenenSehirler = kayitliSehirlerString ? JSON.parse(kayitliSehirlerString) : [];
        if (yuklenenSehirler.length === 0) {
          setSehirler([VARSAYILAN_SEHIR]);
          setAktifSehir(VARSAYILAN_SEHIR);
        } else {
          setSehirler(yuklenenSehirler);
          setAktifSehir(yuklenenSehirler[0]);
        }
      } catch (e) { console.error("Failed to load cities.", e); }
      finally { setLoading(false); }
    };
    sehirleriYukle();
  }, []);

  const sehirleriKaydet = async (yeniSehirler: Sehir[]) => {
    try {
      const kaydedilecekSehirler = yeniSehirler.filter(s => s.id !== 'default_golcuk');
      await AsyncStorage.setItem(SEHIRLER_KEY, JSON.stringify(kaydedilecekSehirler));
      setSehirler(yeniSehirler);
    } catch (e) { console.error("Failed to save cities.", e); }
  };

  const sehirEkle = async (sehir: Sehir) => {
    const mevcutSehirler = sehirler[0]?.id === 'default_golcuk' ? [] : sehirler;
    const yeniSehirler = [...mevcutSehirler, sehir];
    await sehirleriKaydet(yeniSehirler);
    setAktifSehir(sehir);
  };

  const sehirKaldir = async (sehirId: string) => {
    const yeniSehirler = sehirler.filter(s => s.id !== sehirId);
    if (yeniSehirler.length === 0) {
      await sehirleriKaydet([]);
      setSehirler([VARSAYILAN_SEHIR]);
      setAktifSehir(VARSAYILAN_SEHIR);
    } else {
      await sehirleriKaydet(yeniSehirler);
      if (aktifSehir?.id === sehirId) {
        setAktifSehir(yeniSehirler[0]);
      }
    }
  };

  const value = {
    sehirler,
    aktifSehir,
    loading,
    sehirEkle,
    sehirKaldir,
    setAktifSehir: setAktifSehir,
  };

  return <SehirContext.Provider value={value}>{children}</SehirContext.Provider>;
};

// Bu hook, context'e kolayca erişmemizi sağlar ve export edilmelidir.
export const useSehirler = () => {
  const context = useContext(SehirContext);
  if (context === undefined) {
    throw new Error('useSehirler must be used within a SehirProvider');
  }
  return context;
};