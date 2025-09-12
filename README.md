# YAPAY ZEKA DESTEKLİ REACT NATIVE MOBİL HAVA DURUMU UYGULAMASI

Bu proje, harici API'lerden (Tomorrow.io) alınan anlık ve 48 saatlik verileri, 10 yıllık Kocaeli verisiyle eğitilmiş özel **Prophet** yapay zeka modelleriyle karşılaştıran ve zenginleştiren tam teşekküllü bir mobil hava durumu uygulamasıdır.

Uygulama; anlık hava durumu, 24 saatlik hava durumu sağlayıcılarının tahmini ve buna ek olarak **+6 saatlik yapay zeka destekli sıcaklık, nem, basınç, rüzgar hızı, yağış tahmini** sunar. Ayrıca, modelimizin doğruluğunu anlık olarak test etmek için, yapay zeka tahminleri ile harici API tahminleri arasındaki başarı oranını yüzdesel olarak gösterir.

## Yapay Zeka Tahmini ile API Tahminlerinin Farkını gösteren Grafiklerin Görünümü

Hava durumu sağlayıcısı verisi ile üretilmiş olan yapay zekalı değer çıktısının yüzdelik ve delta olarak farkı aşağıda netçe görülmektedir. Bu değer zaman zaman %98'e varan doğruluğa ulaşabilmektedir.

<p align="center">
  <img src="https://github.com/emirhanak/HavaDurumuMobil/blob/ek3u/readmepic/mobilsicaklikgrafik.jpg" alt="Grafik" width="300"/>
</p>

# Geliştirme Aşamaları

MeteoStat ile geçmiş 10 yılın verisi CSV'lere yazılarak bu CSV'lerin prophet ile model eğitimi sağlanmıştır. Her coğrafi bölgenin hava şartları farklı olduğundan farklı bölgeler için farklı modeller eğitilmiştir. Bu çalışma tüm Türkiye'yi kapsaması açısından 81 model üzerine inşa edilmiştir. Geliştirme aşamaları akış olarak aşağıda verilmiştir.
<p align="center">
  <img src="https://github.com/emirhanak/HavaDurumuMobil/blob/ek3u/readmepic/hava_tahmin_sistemi_akis.png" alt="Akış" width="700"/>
</p>
 Örnek olarak Kocaeli ili için olan regresörlü tahmin çıktısı, MAE, MSE, R^2 Değerlerin çıktısı aşağıda verilmiştir.
<p align="center">
  <img src="https://github.com/emirhanak/HavaDurumuMobil/blob/ek3u/readmepic/09_regressor_overlap_mae_r2.png" alt="Kocaeli Grafik" width="500"/>
</p>

## Uygulamadaki Diğer Ekranların Görünümü
<p align="center">
  <img src="https://github.com/emirhanak/HavaDurumuMobil/blob/ek3u/readmepic/mobilanaekran.jpg" alt="Uygulama Arayüzü" width="230"/>
  <img src="https://github.com/emirhanak/HavaDurumuMobil/blob/ek3u/readmepic/mobilharita.jpg" alt="Harita" width="230"/>
  <img src="https://github.com/emirhanak/HavaDurumuMobil/blob/ek3u/readmepic/mobilsehirler.jpg" alt="Şehirler" width="230"/>
  <img src="https://github.com/emirhanak/HavaDurumuMobil/blob/ek3u/readmepic/mobilayarlar.jpg" alt="Ayarlar" width="230"/>
</p>



## Kurulum

Projeyi kendi bilgisayarınızda kurmak ve çalıştırmak için aşağıdaki adımları izleyin.

#### Ön Gereksinimler

  * [Git](https://git-scm.com/)
  * [Anaconda (Python 3.9+)](https://www.anaconda.com/products/distribution)
  * [Java JDK 17+](https://www.oracle.com/java/technologies/downloads/)
  * [Node.js (LTS)](https://nodejs.org/)
  * Mobil cihazınızda **Expo Go** uygulaması

#### 1. Projeyi Bilgisayarınıza Kopyalayın

```bash
git clone https://github.com/emirhanak/HavaDurumuMobil.git
cd HavaDurumuMobil
```

#### 2. API Anahtarınızı Tanımlayın

Java backend'inin çalışması için bir **Tomorrow.io API** anahtarına ihtiyacı vardır.

  * `backend/src/main/resources/` klasörüne gidin.
  * `application.properties` dosyasını açın.
  * `tomorrow.api.key=` satırının karşısına kendi Tomorrow.io API anahtarınızı yapıştırın.
  * 
  * `services/` klasörüne gidin.
  * `havaDurumuService.ts` dosyasını açın.
  * `const TOMORROW_API_KEY =` satırının karşısına kendi Tomorrow.io API anahtarınızı yapıştırın.



#### 3. Projeyi Başlatın

Uygulamayı çalıştırmak için **3 ayrı terminal** açmanız gerekmektedir.

1.  **Python AI Servisini Başlatın:**

    ```bash
    # 1. Terminal (Anaconda Prompt)
    # Gerekli kütüphaneleri kurun (sadece ilk seferde):
    conda env create -f environment.yml

    # Sanal ortamı aktive edin:
    conda activate havatahmini

    # API'yi başlatın:
    cd ai-service 
    uvicorn main:app --reload
    ```

2.  **Java Backend'i Başlatın:**

    ```bash
    # 2. Terminal
    cd backend
    .\mvnw.cmd spring-boot:run
    ```

3.  **React Native Frontend'i Başlatın:**

    ```bash
    # 3. Terminal
    # Gerekli kütüphaneleri kurun (sadece ilk seferde):
    npm install

    # Uygulamayı başlatın:
    npx expo start
    ```

    Açılan QR kodu telefonunuzdaki **Expo Go** uygulaması ile okutun.

## Mimari

Bu proje, görevleri net bir şekilde ayıran modern bir mikroservis mimarisi üzerine kurulmuştur. Sistem 3 katmandan oluşur:

  * **UI (Frontend):** Kullanıcının etkileşimde bulunduğu arayüz katmanıdır. **React Native** ve **Expo** ile geliştirilmiştir. Görevi, Java Backend'den gelen zenginleştirilmiş veriyi alıp kullanıcıya sunmaktır.
  * **Backend:** **Java** ve **Spring Boot** ile geliştirilmiştir. Mobil uygulamadan gelen tüm istekleri karşılayan ana merkezdir. Harici API'den veriyi çeker, Python AI servisinden yapay zeka tahminini alır, bu iki veriyi birleştirir, karşılaştırma yapar ve son olarak mobil uygulamaya nihai sonucu gönderir.
  * **AI Service:** **Python**, **FastAPI** ve **Prophet** ile geliştirilmiştir. Sadece yapay zeka modellerini barındıran ve tahmin yapan uzman bir servistir. Java'dan gelen 24 saatlik veriyi alır, 10 yıllık veriyle eğitilmiş modelleri kullanarak gelecek 6 saat için sıcaklık ve nem tahmini üretir ve sonucu Java'ya geri döner.

Bağımlılıklar her zaman aşağı yönlüdür: `UI` katmanı sadece `Backend`'e, `Backend` katmanı ise `AI Service`'e bağımlıdır.

*(Not: Bu linki kendi mimari diyagramınızın linki ile değiştirebilirsiniz.)*

## Kullanılan Teknolojiler:

  * **Java:** Mobilin backend'i ve FastAPI bağlantıları için.
  * **React Native & Expo:** Çapraz platform mobil uygulama geliştirme için.
  * **Python & FastAPI:** Yapay zeka modellerini sunmak için.
  * **Prophet:** Zaman serisi tahminleri için.
  * **Spring Boot:** Güçlü ve hızlı Java arka uç altyapısı için.
  * **TypeScript:** Daha güvenli ve ölçeklenebilir frontend kodu için.
  * **react-native-chart-kit:** Etkileşimli grafikler için.

-----

<br>

# AI-POWERED REACT NATIVE MOBILE WEATHER APPLICATION

This project is a full-featured mobile weather application that compares and enriches real-time and 48-hour data from external providers (Tomorrow.io) with custom **Prophet** AI models trained on 10 years of historical data from Kocaeli.

The app provides real-time conditions, **24-hour provider forecasts**, and an additional **+6 hours of AI-powered predictions for temperature, humidity, pressure, wind speed, and precipitation**. It also displays, in real time, the percentage accuracy by comparing the AI forecasts with the external API forecasts.

## Visualization of the Difference Between AI Forecasts and API Forecasts

Below you can clearly see the percentage and delta differences between the provider data and the AI-generated values. In practice, the model can occasionally reach **up to 98% accuracy**.

<p align="center">
  <img src="https://github.com/emirhanak/HavaDurumuMobil/blob/ek3u/readmepic/mobilsicaklikgrafik.jpg" alt="Chart" width="300"/>
</p>

# Development Stages

Using MeteoStat, we exported the last 10 years of data to CSV files and trained Prophet models on these CSVs. Since weather dynamics vary across regions, distinct models were trained for different areas. To cover the entirety of Türkiye, the system was built on **81 separate models**—one per province. The development workflow is illustrated below.
<p align="center">
  <img src="https://github.com/emirhanak/HavaDurumuMobil/blob/ek3u/readmepic/hava_tahmin_sistemi_akis.png" alt="System Flow" width="500"/>
</p>
 As an example, the regressor-enabled forecast output for Kocaeli—along with MAE, MSE, and R^2 metrics—is shown below.
<p align="center">
  <img src="https://github.com/emirhanak/HavaDurumuMobil/blob/ek3u/readmepic/09_regressor_overlap_mae_r2.png" alt="Kocaeli Metrics" width="500"/>
</p>

## Other Screens in the App
<p align="center">
  <img src="https://github.com/emirhanak/HavaDurumuMobil/blob/ek3u/readmepic/mobilanaekran.jpg" alt="Main Screen" width="230"/>
  <img src="https://github.com/emirhanak/HavaDurumuMobil/blob/ek3u/readmepic/mobilharita.jpg" alt="Map" width="230"/>
  <img src="https://github.com/emirhanak/HavaDurumuMobil/blob/ek3u/readmepic/mobilsehirler.jpg" alt="Cities" width="230"/>
  <img src="https://github.com/emirhanak/HavaDurumuMobil/blob/ek3u/readmepic/mobilayarlar.jpg" alt="Settings" width="230"/>
</p>

## Setup

Follow the steps below to set up and run the project on your machine.

#### Prerequisites

  * [Git](https://git-scm.com/)
  * [Anaconda (Python 3.9+)](https://www.anaconda.com/products/distribution)
  * [Java JDK 17+](https://www.oracle.com/java/technologies/downloads/)
  * [Node.js (LTS)](https://nodejs.org/)
  * **Expo Go** on your mobile device

#### 1. Clone the Project

```bash
git clone https://github.com/emirhanak/HavaDurumuMobil.git
cd HavaDurumuMobil
```

#### 2. Set Your API Key

The Java backend requires a **Tomorrow.io API** key.

  * Go to `backend/src/main/resources/`.
  * Open `application.properties`.
  * Paste your key after `tomorrow.api.key=`.
  * 
  * Go to the `services/` folder.
  * Open `havaDurumuService.ts`.
  * Paste your key after `const TOMORROW_API_KEY =`.

#### 3. Run the Project

You need **3 separate terminals** to run the app.

1.  **Start the Python AI Service:**

    ```bash
    # Terminal 1 (Anaconda Prompt)
    # Install dependencies (first run only):
    conda env create -f environment.yml

    # Activate the environment:
    conda activate havatahmini

    # Start the API:
    cd ai-service 
    uvicorn main:app --reload
    ```

2.  **Start the Java Backend:**

    ```bash
    # Terminal 2
    cd backend
    .\mvnw.cmd spring-boot:run
    ```

3.  **Start the React Native Frontend:**

    ```bash
    # Terminal 3
    # Install dependencies (first run only):
    npm install

    # Start the app:
    npx expo start
    ```

    Scan the QR code with **Expo Go** on your phone.

## Architecture

This project follows a modern microservice architecture with clear separation of concerns. The system has three layers:

  * **UI (Frontend):** Built with **React Native** and **Expo**. It fetches enriched data from the Java backend and presents it to the user.
  * **Backend:** Built with **Java** and **Spring Boot**. It handles all requests from the mobile app, fetches data from the external API, requests AI forecasts from the Python service, merges the two, performs comparisons, and returns the final result to the mobile client.
  * **AI Service:** Built with **Python**, **FastAPI**, and **Prophet**. A specialized service that hosts and runs the AI models. It receives 24-hour data from Java, uses models trained on 10 years of history to forecast the next 6 hours (temperature & humidity and other metrics), and returns the result to Java.

Dependencies always flow downward: the `UI` depends only on the `Backend`, and the `Backend` depends on the `AI Service`.

*(Note: You can replace this with a link to your own architecture diagram.)*

## Tech Stack

  * **Java:** For the mobile backend and FastAPI integrations.
  * **React Native & Expo:** Cross-platform mobile development.
  * **Python & FastAPI:** Serving AI models.
  * **Prophet:** Time-series forecasting.
  * **Spring Boot:** Robust and fast Java backend.
  * **TypeScript:** Safer, more scalable frontend code.
  * **react-native-chart-kit:** Interactive charts.


-----

## License

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
You may obtain a copy of the License at: https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

