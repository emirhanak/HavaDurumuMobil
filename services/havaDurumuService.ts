// Bu adres, geliştirme sırasında bilgisayarınızın ağdaki IP adresidir.
// 'localhost' kullanamayız çünkü mobil uygulama localhost'u kendisi olarak görür.
const JAVA_BACKEND_URL = 'http://192.168.1.46:8080/api'; 

export const fetchWeatherFromBackend = async (lat: number, lon: number) => {
  try {
    const url = `${JAVA_BACKEND_URL}/weather?lat=${lat}&lon=${lon}`;
    console.log("İstek atılan URL: ", url); // Hata ayıklama için
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Backend servisi hata döndü: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Backend Servis Hatası:', error);
    throw error;
  }
};