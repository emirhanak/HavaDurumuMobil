package com.havadurumu.backend.service;

import com.havadurumu.backend.dto.GirdiVerisi;
import com.havadurumu.backend.dto.TahminCiktisi;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;

@Service
public class YapayZekaTahminService {

    private final RestTemplate restTemplate;
    private final String PYTHON_API_URL = "http://127.0.0.1:8000/tahmin";

    // Spring, AppConfig'te oluşturduğumuz RestTemplate'i otomatik olarak buraya enjekte edecek.
    public YapayZekaTahminService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<TahminCiktisi> getYapayZekaTahmini(List<GirdiVerisi> sonSaatlerinVerisi) {
        try {
            // Python API'sine POST isteği yap ve cevabı TahminCiktisi dizisi olarak al
            TahminCiktisi[] response = restTemplate.postForObject(
                PYTHON_API_URL, 
                sonSaatlerinVerisi, 
                TahminCiktisi[].class
            );
            
            // Dizi null değilse List'e çevir, null ise boş liste dön
            return response != null ? List.of(response) : List.of();
        } catch (Exception e) {
            System.err.println("Yapay Zeka tahmin servisine bağlanırken hata oluştu: " + e.getMessage());
            // Hata durumunda mobil uygulamanın bozulmasını engellemek için boş liste dönüyoruz.
            return List.of();
        }
    }
}