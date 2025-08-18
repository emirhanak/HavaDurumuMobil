package com.havadurumu.backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
public class HavaDurumuController {

  @Autowired
  private RestTemplate restTemplate;

  @Value("${fastapi.base}")
  private String fastApiBase;

  // Basit sağlık kontrolü
  @GetMapping("/ping")
  public String ping() {
    return "pong";
  }

  // Mobilin kullanacağı proxy
  @CrossOrigin(origins = "*")
  @GetMapping("/mobile/blend")
  public ResponseEntity<String> mobileBlend(
      @RequestParam("lat") double lat,
      @RequestParam("lon") double lon,
      @RequestParam(value = "city", defaultValue = "Konum") String city,
      @RequestParam(value = "plus_hours", defaultValue = "6") int plusHours,
      @RequestParam(value = "reg_mode", defaultValue = "auto") String regMode
  ) {
    try {
      String url = UriComponentsBuilder
          .fromHttpUrl(fastApiBase + "/blend")
          .queryParam("city", city)
          .queryParam("lat", lat)
          .queryParam("lon", lon)
          .queryParam("plus_hours", plusHours)
          .queryParam("reg_mode", regMode)
          .toUriString();

      System.out.println("Proxying to FastAPI: " + url);

      String body = restTemplate.getForObject(url, String.class);

      return ResponseEntity.ok()
          .header("Content-Type", "application/json; charset=utf-8")
          .body(body);

    } catch (Exception ex) {
      ex.printStackTrace();
      return ResponseEntity.status(502)
          .header("Content-Type", "application/json; charset=utf-8")
          .body("{\"error\":\"blend proxy failed\"}");
    }
  }
}
