import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Sehir {
  id: string;
  ad: string;
  enlem: number;
  boylam: number;
  sicaklik: number;
  enDusuk?: number;
  enYuksek?: number;
}
type HavaDurumuModu = 'konum' | 'sehir';
const SEHIRLER_KEY = '@sehirler_v3';

interface SehirContextState {
  sehirler: Sehir[];
  aktifSehir: Sehir | null;
  loading: boolean;
  mod: HavaDurumuModu;
  sehirEkle: (sehir: Sehir) => Promise<void>;
  sehirKaldir: (sehirId: string) => Promise<void>;
  setAktifSehir: (sehir: Sehir | null) => void;
  setMod: (mod: HavaDurumuModu) => void;
}

const SehirContext = createContext<SehirContextState | undefined>(undefined);

export const SehirProvider = ({ children }: { children: ReactNode }) => {
  const [sehirler, setSehirler] = useState<Sehir[]>([]);
  const [aktifSehir, setAktifSehir] = useState<Sehir | null>(null);
  const [loading, setLoading] = useState(true);
  const [mod, setMod] = useState<HavaDurumuModu>('konum');

  useEffect(() => {
    const sehirleriYukle = async () => {
      try {
        const kayitliSehirlerString = await AsyncStorage.getItem(SEHIRLER_KEY);
        const yuklenenSehirler: Sehir[] = kayitliSehirlerString ? JSON.parse(kayitliSehirlerString) : [];
        setSehirler(yuklenenSehirler);
      } catch (e) {
        console.error("Depodan şehirler yüklenemedi.", e);
        setSehirler([]);
      } finally {
        setLoading(false);
      }
    };
    sehirleriYukle();
  }, []);

  const sehirleriKaydet = async (yeniSehirler: Sehir[]) => {
    try {
      await AsyncStorage.setItem(SEHIRLER_KEY, JSON.stringify(yeniSehirler));
      setSehirler(yeniSehirler);
    } catch (e) { console.error("Şehirler kaydedilemedi.", e); }
  };

  const sehirEkle = async (sehir: Sehir) => {
    if (sehirler.some(s => s.ad === sehir.ad)) return;
    const yeniSehirler = [...sehirler, sehir];
    await sehirleriKaydet(yeniSehirler);
    setAktifSehir(sehir);
    setMod('sehir');
  };

  const sehirKaldir = async (sehirId: string) => {
    const yeniSehirler = sehirler.filter(s => s.id !== sehirId);
    await sehirleriKaydet(yeniSehirler);
    if (aktifSehir?.id === sehirId || yeniSehirler.length === 0) {
      setAktifSehir(null);
      setMod('konum');
    }
  };

  const handleSetAktifSehir = (sehir: Sehir | null) => {
    setAktifSehir(sehir);
    if (sehir) { setMod('sehir'); }
  };

  const value = {
    sehirler, aktifSehir, loading, mod,
    sehirEkle, sehirKaldir,
    setAktifSehir: handleSetAktifSehir,
    setMod,
  };

  return <SehirContext.Provider value={value}>{children}</SehirContext.Provider>;
};

export const useSehirler = () => {
  const context = useContext(SehirContext);
  if (context === undefined) { throw new Error('useSehirler must be used within a SehirProvider'); }
  return context;
};