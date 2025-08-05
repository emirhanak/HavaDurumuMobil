// Dosya: src/main/java/com/havadurumu/backend/service/YapayZekaTahminService.java
package com.havadurumu.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.havadurumu.backend.dto.GirdiVerisi;
import com.havadurumu.backend.dto.TahminCiktisi;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

@Service
public class YapayZekaTahminService {

    private final String PYTHON_API_URL_SAATLIK = "http://127.0.0.1:8000/tahmin";
    private final String PYTHON_API_URL_GUNLUK  = "http://127.0.0.1:8000/gunluk-tahmin";
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public YapayZekaTahminService() {
        this.httpClient   = HttpClient.newBuilder().build();
        this.objectMapper = new ObjectMapper();
    }

    public List<TahminCiktisi> getYapayZekaTahmini(List<GirdiVerisi> sonSaatlerinVerisi) throws Exception {
        String json = objectMapper.writeValueAsString(sonSaatlerinVerisi);
        HttpRequest req = HttpRequest.newBuilder()
            .uri(URI.create(PYTHON_API_URL_SAATLIK))
            .header("Content-Type","application/json")
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();
        HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() != 200) throw new RuntimeException("S saatlik AI hata "+resp.statusCode());
        return objectMapper.readValue(resp.body(), new TypeReference<>(){});
    }

    public List<TahminCiktisi> getGunlukYapayZekaTahmini(List<GirdiVerisi> sonGunlerinVerisi) throws Exception {
        String json = objectMapper.writeValueAsString(sonGunlerinVerisi);
        HttpRequest req = HttpRequest.newBuilder()
            .uri(URI.create(PYTHON_API_URL_GUNLUK))
            .header("Content-Type","application/json")
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();
        HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() != 200) throw new RuntimeException("G günlük AI hata "+resp.statusCode());
        return objectMapper.readValue(resp.body(), new TypeReference<>(){});
    }
}
