package com.havadurumu.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.havadurumu.backend.dto.GercekVeri;
import com.havadurumu.backend.dto.GirdiVerisi;
import com.havadurumu.backend.dto.TahminCiktisi;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;

@Service
public class YapayZekaTahminService {

    private final String PYTHON_API_URL_SAATLIK = "http://127.0.0.1:8000/tahmin";
    private final String PYTHON_API_URL_GUNLUK = "http://127.0.0.1:8000/gunluk-tahmin";
    private final String PYTHON_API_URL_KAYDET = "http://127.0.0.1:8000/veri_kaydet";
    
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public YapayZekaTahminService() {
        this.httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Python AI servisinden gelecek 3 saatlik sıcaklık tahminini alır.
     */
    public List<TahminCiktisi> getYapayZekaTahmini(List<GirdiVerisi> sonSaatlerinVerisi) {
        try {
            String jsonBody = objectMapper.writeValueAsString(sonSaatlerinVerisi);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(PYTHON_API_URL_SAATLIK))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() == 200) {
                return objectMapper.readValue(response.body(), new TypeReference<List<TahminCiktisi>>() {});
            } else {
                System.err.println("Yapay Zeka SAATLİK servisinden hatalı durum kodu alındı: " + response.statusCode());
                System.err.println("Hata İçeriği: " + response.body());
                return List.of();
            }
        } catch (Exception e) {
            System.err.println("Yapay Zeka SAATLİK tahmin servisine bağlanırken hata oluştu: " + e.getMessage());
            return List.of();
        }
    }

    /**
     * Python AI servisinden gelecek 3 günlük sıcaklık tahminini alır.
     */
    public List<TahminCiktisi> getGunlukYapayZekaTahmini(List<GirdiVerisi> sonGunlerinVerisi) {
        try {
            String jsonBody = objectMapper.writeValueAsString(sonGunlerinVerisi);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(PYTHON_API_URL_GUNLUK))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() == 200) {
                return objectMapper.readValue(response.body(), new TypeReference<List<TahminCiktisi>>() {});
            } else {
                System.err.println("Yapay Zeka GÜNLÜK servisinden hatalı durum kodu alındı: " + response.statusCode());
                System.err.println("Hata İçeriği: " + response.body());
                return List.of();
            }
        } catch (Exception e) {
            System.err.println("Yapay Zeka GÜNLÜK tahmin servisine bağlanırken hata oluştu: " + e.getMessage());
            return List.of();
        }
    }

    /**
     * Gerçek zamanlı veriyi ilerideki model eğitimleri için Python'a kaydeder.
     */
    public void veriKaydet(GercekVeri veri) {
        try {
            String jsonBody = objectMapper.writeValueAsString(veri);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(PYTHON_API_URL_KAYDET))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();
            
            // İsteği gönderiyoruz ama cevabını beklemiyoruz (ateşle ve unut)
            httpClient.sendAsync(request, HttpResponse.BodyHandlers.ofString());
            System.out.println("Gerçek zamanlı veri kaydetme isteği gönderildi.");
        } catch (Exception e) {
            System.err.println("Gerçek veri kaydedilirken hata oluştu: " + e.getMessage());
        }
    }
}