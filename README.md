# 🌤️ Mobil Hava Durumu Tahmin Uygulaması

> Gerçek zamanlı API verileri ile yapay zekâ tabanlı tahminleri harmanlayan, etkileşimli grafiklerle desteklenmiş mobil hava durumu uygulaması.  
> Powered by ⚛️ React Native, 🐍 FastAPI, ☕ Java Spring, 📊 Prophet.


---

## 🇹🇷 Türkçe Dokümantasyon

### Amaç
Bu projenin amacı, harici API'lerden alınan verileri yapay zekâ tahmin sistemi ile kıyaslayarak modelimizin gerçeğe ne kadar yakın olduğunu göstermektir. Mobil uygulama, kapsamlı saatlik ve günlük tahminler, detaylı hava durumu metrikleri ve etkileşimli grafikler aracılığıyla kullanıcıya sezgisel bir deneyim sunar.

---

### Tech Stack
- ⚛️ **React Native (Expo)** → Mobil uygulama  
- ☕ **Java Spring Boot** → Proxy backend  
- 🐍 **FastAPI** → Veri işleme & AI tahmin servisi  
- 📊 **Prophet** → Zaman serisi tahmin modeli  
- 🌐 **Tomorrow.io API** → Gerçek zamanlı hava durumu verisi  

---

### Temel Bileşenler ve İş Akışı

#### 1. Ön Uç (Mobil Uygulama)
- Anlık hava durumu görüntüleme  
- Saatlik tahmin + etkileşimli grafikler  
- Günlük tahmin kartları  
- Koyu/açık tema, duyarlı tasarım  

#### 2. Arka Uç (Proxy + AI)
- ☕ **Java Proxy:** Mobil istekleri yönlendirir  
- 🐍 **FastAPI:** API verilerini çeker + AI tahminlerini ekler  
- **Veri Harmanlama:** İlk 24 saatte API + AI kıyaslama, sonrası AI ağırlıklı  
- **Şehir Normalizasyonu & Caching**  

#### 3. Harici Kaynak
- **Tomorrow.io API** → Temel veri kaynağı  

---

### Model Doğruluğu (Simüle Edilmiş Örnekler)
- **Sıcaklık (AI vs API)**  
  - MAE: 1.8°C  
  - MSE: 4.5°C²  
  - R²: 0.92  

- **Nem (AI vs API)**  
  - MAE: 5.2%  
  - MSE: 30.1%²  
  - R²: 0.78  

*(Gerçek sonuçlar şehir ve veri kalitesine göre değişebilir.)*

---

### Performans Kıyaslaması
📊 Burada **AI vs API grafiklerini ve hata metriklerini** karşılaştırmalı olarak gösterebilirsiniz.  
*(örnek tablo placeholder’dır – sen grafik + değerleri ekleyeceksin)*  

| Değişken   | API Ortalama | AI Ortalama | MAE  | MSE  | R²   |
|------------|--------------|-------------|------|------|------|
| Sıcaklık   | 23.1°C       | 22.9°C      | 1.8  | 4.5  | 0.92 |
| Nem        | 62%          | 60%         | 5.2  | 30.1 | 0.78 |

---

### Kullanım
Detaylı kurulum ve çalıştırma adımları için [SETUP_GUIDE.md](SETUP_GUIDE.md) dosyasına bakınız.  

---

### Contributors
- 👨‍💻 **Emirhan Ak** — Geliştirici & Araştırmacı  

### License
Bu proje MIT Lisansı altında sunulmuştur. Daha fazla bilgi için [LICENSE](LICENSE) dosyasına bakınız.  

---

---

## 🇬🇧 English Documentation

### Purpose
The goal of this project is to benchmark AI-powered forecasts against external APIs, demonstrating how closely the model aligns with real-world observations. The mobile app provides intuitive hourly/daily forecasts, detailed weather metrics, and interactive visualization.  

---

### Tech Stack
- ⚛️ **React Native (Expo)** → Mobile application  
- ☕ **Java Spring Boot** → Proxy backend  
- 🐍 **FastAPI** → Data processing & AI forecast service  
- 📊 **Prophet** → Time series forecasting model  
- 🌐 **Tomorrow.io API** → External weather data source  

---

### Core Components & Workflow

#### 1. Frontend (Mobile App)
- Real-time conditions  
- Hourly forecast + interactive charts  
- Daily forecast cards  
- Dark/light theme & responsive UI  

#### 2. Backend (Proxy + AI)
- ☕ **Java Proxy:** Handles mobile requests  
- 🐍 **FastAPI:** Fetches API data + integrates AI predictions  
- **Data Blending:** AI prioritized after 24h horizon, API fallback  
- **City Normalization & Caching**  

#### 3. External Source
- **Tomorrow.io API** → Primary data provider  

---

### Model Accuracy (Sample Simulated Values)
- **Temperature (AI vs API)**  
  - MAE: 1.8°C  
  - MSE: 4.5°C²  
  - R²: 0.92  

- **Humidity (AI vs API)**  
  - MAE: 5.2%  
  - MSE: 30.1%²  
  - R²: 0.78  

---

### Performance Comparison
📊 Here you can add **side-by-side charts & error metrics** (placeholder table below).  

| Variable   | API Avg | AI Avg | MAE  | MSE  | R²   |
|------------|---------|--------|------|------|------|
| Temp       | 23.1°C  | 22.9°C | 1.8  | 4.5  | 0.92 |
| Humidity   | 62%     | 60%    | 5.2  | 30.1 | 0.78 |

---

### Usage
Please refer to [SETUP_GUIDE.md](SETUP_GUIDE.md) for installation and execution instructions.  

---

### Contributors
- 👨‍💻 **Emirhan Ak** — Developer & Researcher  

### License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.  
