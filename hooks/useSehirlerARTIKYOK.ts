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

const VARSAYILAN_SEHIR: Sehir = {
  id: 'default_golcuk',
  ad: 'Gölcük',
  enlem: 40.7186,
  boylam: 29.8261,
  sicaklik: 15 // Başlangıç için rastgele bir sıcaklık
};

export function useSehirler() {
  const [sehirler, sehirleriAyarla] = useState<Sehir[]>([]);
  const [aktifSehir, aktifSehriAyarla] = useState<Sehir | null>(null);
  const [loading, yukleniyor] = useState(true);

  useEffect(() => {
    const sehirleriYukle = async () => {
      try {
        const kayitliSehirlerString = await AsyncStorage.getItem(SEHIRLER_KEY);
        let yuklenenSehirler: Sehir[] = [];
        if (kayitliSehirlerString) {
          yuklenenSehirler = JSON.parse(kayitliSehirlerString);
        }

        if (yuklenenSehirler.length === 0) {
          // Eğer hiç kayıtlı şehir yoksa, varsayılan olarak Gölcük'ü ekle ve aktif yap
          sehirleriAyarla([VARSAYILAN_SEHIR]);
          aktifSehriAyarla(VARSAYILAN_SEHIR);
        } else {
          sehirleriAyarla(yuklenenSehirler);
          // Kayıtlı şehir varsa, ilkini aktif yap
          aktifSehriAyarla(yuklenenSehirler[0]);
        }
      } catch (error) {
        console.error('Sehirler yüklenirken hata oluştu:', error);
      } finally {
        yukleniyor(false);
      }
    };
    sehirleriYukle();
  }, []);

  const sehirleriKaydet = async (yeniSehirler: Sehir[]) => {
    try {
      // Varsayılan şehri depolamaya kaydetmeyelim, her zaman programatik olarak eklensin
      const kaydedilecekSehirler = yeniSehirler.filter(s => s.id !== 'default_golcuk');
      await AsyncStorage.setItem(SEHIRLER_KEY, JSON.stringify(kaydedilecekSehirler));
      sehirleriAyarla(yeniSehirler);
    } catch (error) {
      console.error('Sehirler kaydedilirken hata oluştu:', error);
    }
  };

  const sehirEkle = async (sehir: Sehir) => {
    // Eğer listede sadece varsayılan şehir varsa, onu kaldırıp yenisini ekle
    const mevcutSehirler = sehirler[0]?.id === 'default_golcuk' ? [] : sehirler;
    const yeniSehirler = [...mevcutSehirler, sehir];
    await sehirleriKaydet(yeniSehirler);
    aktifSehriAyarla(sehir);
  };

  const sehirKaldir = async (sehirId: string) => {
    const yeniSehirler = sehirler.filter(sehir => sehir.id !== sehirId);

    if (yeniSehirler.length === 0) {
      // Eğer son şehir de silindiyse, varsayılan Gölcük'ü geri getir ve aktif yap
      await sehirleriKaydet([]); // Depoyu temizle
      sehirleriAyarla([VARSAYILAN_SEHIR]);
      aktifSehriAyarla(VARSAYILAN_SEHIR);
    } else {
      await sehirleriKaydet(yeniSehirler);
      // Eğer silinen şehir aktifse, listenin ilkini yeni aktif yap
      if (aktifSehir && aktifSehir.id === sehirId) {
        aktifSehriAyarla(yeniSehirler[0]);
      }
    }
  };
  
  // sehirSicaklikGuncelle fonksiyonu aynı kalabilir

  return { sehirler, loading, aktifSehir, aktifSehriAyarla, sehirEkle, sehirKaldir };
}