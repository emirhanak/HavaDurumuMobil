import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tipleri tanımlıyoruz
interface Sehir {
  id: string;
  ad: string;
  enlem: number;
  boylam: number;
  sicaklik: number;
  enDusuk: number;  // YENİ
  enYuksek: number; // YENİ
}
type HavaDurumuModu = 'konum' | 'sehir';
const SEHIRLER_KEY = '@sehirler';

// Context'in yapısı
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
  const [mod, setMod] = useState<HavaDurumuModu>('konum'); // Varsayılan mod her zaman 'konum'

  useEffect(() => {
    const sehirleriYukle = async () => {
      try {
        const kayitliSehirlerString = await AsyncStorage.getItem(SEHIRLER_KEY);
        const yuklenenSehirler = kayitliSehirlerString ? JSON.parse(kayitliSehirlerString) : [];
        setSehirler(yuklenenSehirler);
        // Not: Başlangıçta aktif şehir belirlemiyoruz. Mod 'konum' olduğu için uygulama GPS'i deneyecek.
      } catch (e) {
        console.error("Depodan şehirler yüklenemedi.", e);
        setSehirler([]); // Hata durumunda boş liste ile başla
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
    } catch (e) {
      console.error("Şehirler kaydedilemedi.", e);
    }
  };

  const sehirEkle = async (sehir: Sehir) => {
    // Aynı şehrin tekrar eklenmesini önle
    if (sehirler.some(s => s.ad === sehir.ad)) return;

    const yeniSehirler = [...sehirler, sehir];
    await sehirleriKaydet(yeniSehirler);
    setAktifSehir(sehir);
    setMod('sehir');
  };

  const sehirKaldir = async (sehirId: string) => {
    const yeniSehirler = sehirler.filter(s => s.id !== sehirId);
    await sehirleriKaydet(yeniSehirler);

    // Eğer silinen şehir aktifse veya son şehir silindiyse, 'konum' moduna geri dön
    if (aktifSehir?.id === sehirId || yeniSehirler.length === 0) {
      setAktifSehir(null);
      setMod('konum');
    }
  };

  const handleSetAktifSehir = (sehir: Sehir | null) => {
    setAktifSehir(sehir);
    if (sehir) {
      setMod('sehir'); // Bir şehir aktif olarak ayarlandığında, modu 'sehir' yap
    }
  };

  const value = {
    sehirler,
    aktifSehir,
    loading,
    mod,
    sehirEkle,
    sehirKaldir,
    setAktifSehir: handleSetAktifSehir,
    setMod,
  };

  return <SehirContext.Provider value={value}>{children}</SehirContext.Provider>;
};

export const useSehirler = () => {
  const context = useContext(SehirContext);
  if (context === undefined) {
    throw new Error('useSehirler must be used within a SehirProvider');
  }
  return context;
};