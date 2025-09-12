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
import java.time.Duration;
import java.util.List;

@Service
public class YapayZekaTahminService {

    private final String PYTHON_API_URL_SAATLIK = "http://127.0.0.1:8000/tahmin";
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public YapayZekaTahminService() {
        this.httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public List<TahminCiktisi> getYapayZekaTahmini(List<GirdiVerisi> sonSaatlerinVerisi) throws Exception {
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
            return List.of();
        }
    }
}