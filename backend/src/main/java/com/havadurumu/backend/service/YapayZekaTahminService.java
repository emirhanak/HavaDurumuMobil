// Dosya: src/main/java/com/havadurumu/backend/service/YapayZekaTahminService.java
package com.havadurumu.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.havadurumu.backend.dto.GirdiVerisi;
import com.havadurumu.backend.dto.TahminCiktisi;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class YapayZekaTahminService {

    private final String PYTHON_API_URL_SAATLIK = "http://127.0.0.1:8000/tahmin";
    private final String PYTHON_API_URL_GUNLUK  = "http://127.0.0.1:8000/gunluk-tahmin";
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public YapayZekaTahminService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public List<TahminCiktisi> getYapayZekaTahmini(List<GirdiVerisi> sonSaatlerinVerisi) {
        try {
            System.out.println("=== YAPAY ZEKA SERVİSİ DEBUG ===");
            System.out.println("Gelen veri sayısı: " + sonSaatlerinVerisi.size());
            
            // İlk 3 kayıdı logla
            for (int i = 0; i < Math.min(3, sonSaatlerinVerisi.size()); i++) {
                GirdiVerisi g = sonSaatlerinVerisi.get(i);
                System.out.println("  Veri " + i + ": ds=" + g.getDs() + ", nem=" + g.getNem() + ", kod=" + g.getDurumKodu());
            }
            
            // HTTP Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // HTTP Body
            HttpEntity<List<GirdiVerisi>> requestEntity = new HttpEntity<>(sonSaatlerinVerisi, headers);
            
            System.out.println("RestTemplate ile istek gönderiliyor: " + PYTHON_API_URL_SAATLIK);
            
            // POST isteği gönder
            ResponseEntity<TahminCiktisi[]> response = restTemplate.exchange(
                PYTHON_API_URL_SAATLIK,
                HttpMethod.POST,
                requestEntity,
                TahminCiktisi[].class
            );
            
            System.out.println("HTTP yanıt kodu: " + response.getStatusCode());
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                TahminCiktisi[] tahminArray = response.getBody();
                System.out.println("Alınan tahmin sayısı: " + tahminArray.length);
                
                // Array'i listeye çevir
                List<TahminCiktisi> result = List.of(tahminArray);
                
                // İlk tahmini logla
                if (!result.isEmpty()) {
                    TahminCiktisi ilk = result.get(0);
                    System.out.println("İlk tahmin: " + ilk.getDs() + " | Sıcaklık: " + ilk.getYhat());
                }
                
                return result;
            } else {
                System.err.println("AI SAATLİK servisinden hatalı yanıt: " + response.getStatusCode());
                return List.of();
            }
            
        } catch (Exception e) {
            System.err.println("YAPAY ZEKA SERVİSİ HATASI: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    public List<TahminCiktisi> getGunlukYapayZekaTahmini(List<GirdiVerisi> sonGunlerinVerisi) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<List<GirdiVerisi>> requestEntity = new HttpEntity<>(sonGunlerinVerisi, headers);
        
        ResponseEntity<TahminCiktisi[]> response = restTemplate.exchange(
            PYTHON_API_URL_GUNLUK,
            HttpMethod.POST,
            requestEntity,
            TahminCiktisi[].class
        );
        
        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Günlük AI hata " + response.getStatusCode());
        }
        
        return List.of(response.getBody());
    }
}