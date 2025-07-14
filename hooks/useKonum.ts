import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export function useKonum() {
  const [konum, setKonum] = useState<Location.LocationObject | null>(null);
  const [hataMesaji, setHataMesaji] = useState<string | null>(null);
  const [izinVerildi, setIzinVerildi] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setHataMesaji('Konum izni reddedildi. Ayarlardan izin vermeniz gerekiyor.');
        setIzinVerildi(false);
        return;
      }
      setIzinVerildi(true);
      try {
        let location = await Location.getCurrentPositionAsync({});
        setKonum(location);
      } catch (error) {
        setHataMesaji('Konum alınamadı. GPS veya internet bağlantınızı kontrol edin.');
      }
    })();
  }, []); // Bu sadece component ilk yüklendiğinde çalışır

  return { konum, hataMesaji, izinVerildi };
}