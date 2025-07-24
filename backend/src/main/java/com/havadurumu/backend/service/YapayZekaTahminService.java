package com.havadurumu.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper; // YENİ IMPORT
import com.havadurumu.backend.dto.GirdiVerisi;
import com.havadurumu.backend.dto.TahminCiktisi;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;

@Service
public class YapayZekaTahminService {

    private final RestTemplate restTemplate;
    private final String PYTHON_API_URL = "http://127.0.0.1:8000/tahmin";

    public YapayZekaTahminService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<TahminCiktisi> getYapayZekaTahmini(List<GirdiVerisi> sonSaatlerinVerisi) {
        try {
            // --- 1. ADIM: Listeyi Manuel Olarak JSON Metnine Çevir ---
            ObjectMapper objectMapper = new ObjectMapper();
            String jsonBody = objectMapper.writeValueAsString(sonSaatlerinVerisi);

            // --- 2. ADIM: Gönderilecek JSON'u Kontrol İçin Ekrana Yazdır ---
            // Bu satır bize isteğin gövdesinin boş olup olmadığını KESİN olarak gösterecek.
            System.out.println("Python'a gönderilen JSON GÖVDESİ: " + jsonBody);

            // --- 3. ADIM: HTTP Başlıklarını Oluştur ---
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // --- 4. ADIM: HTTP İsteğini (Request) Oluştur ---
            // Bu sefer HttpEntity'nin içine Java listesi yerine hazır JSON metnini koyuyoruz.
            HttpEntity<String> request = new HttpEntity<>(jsonBody, headers);

            // --- 5. ADIM: İsteği Gönder ---
            TahminCiktisi[] response = restTemplate.postForObject(
                PYTHON_API_URL, 
                request,
                TahminCiktisi[].class
            );
            
            return response != null ? List.of(response) : List.of();
        } catch (Exception e) {
            System.err.println("Yapay Zeka tahmin servisine bağlanırken hata oluştu: " + e.getMessage());
            return List.of();
        }
    }
}