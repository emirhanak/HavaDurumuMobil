# ⚙️ Setup Guide

Bu doküman, **Mobil Hava Durumu Tahmin Uygulaması**’nı yerel ortamda kurmak ve çalıştırmak için gereken adımları içerir.  
(EN version below ⬇️)

---

## 🇹🇷 Kurulum Adımları

### 1. Ön Gereksinimler
- Node.js (>= 18.x)  
- npm veya yarn  
- Python (>= 3.10) + pip  
- Java (>= 17)  
- Anaconda (önerilir, AI modelleri için)  

### 2. Depoyu Klonla
```bash
git clone https://github.com/kullaniciadi/havadurumumobil.git
cd havadurumumobil

### 3. Mobil Uygulama (React Native + Expo)
cd mobile
npm install
npm start


iOS için: iOS Simulator veya Expo Go uygulaması

Android için: Android Studio Emulator veya Expo Go

## 4. Java Proxy Backend
cd backend-java
./mvnw spring-boot:run


Varsayılan port: 8080

### 5. FastAPI AI Servisi
cd backend-fastapi
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8100 --reload


Varsayılan port: 8100

### 6. Ortam Değişkenleri

.env dosyası oluşturun:

TOMORROW_API_KEY=your_api_key_here

### 7. Test

Tarayıcıda açın:

http://localhost:8080/ping
 → pong dönerse backend aktif

http://localhost:8100/blend?...
 → API + AI verilerini döner

## 🇬🇧 Setup Steps
### 1. Prerequisites

Node.js (>= 18.x)

npm or yarn

Python (>= 3.10) + pip

Java (>= 17)

Anaconda (recommended for AI models)

### 2. Clone Repository
git clone https://github.com/username/havadurumumobil.git
cd havadurumumobil

### 3. Mobile App (React Native + Expo)
cd mobile
npm install
npm start


iOS: iOS Simulator or Expo Go

Android: Android Studio Emulator or Expo Go

### 4. Java Proxy Backend
cd backend-java
./mvnw spring-boot:run


Default port: 8080

### 5. FastAPI AI Service
cd backend-fastapi
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8100 --reload


Default port: 8100

### 6. Environment Variables

Create a .env file:

TOMORROW_API_KEY=your_api_key_here

### 7. Testing

Open in browser:

http://localhost:8080/ping
 → should return pong

http://localhost:8100/blend?...
 → should return API + AI data