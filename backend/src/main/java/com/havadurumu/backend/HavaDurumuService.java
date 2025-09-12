// Dosya: src/main/java/com/havadurumu/backend/HavaDurumuService.java
package com.havadurumu.backend;
import java.util.stream.IntStream;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.havadurumu.backend.dto.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.*;

@Service
public class HavaDurumuService {

    private final RestTemplate restTemplate;
    private final String apiKey;
    private static final String API_URL = "https://api.tomorrow.io/v4/weather/forecast";

    public HavaDurumuService(RestTemplate restTemplate,
                             @Value("${tomorrow.api.key}") String apiKey) {
        this.restTemplate = restTemplate;
        this.apiKey       = apiKey;
    }

    public HavaDurumuCevapDto getWeather(String lat, String lon) {
        
        // ✅ DEĞİŞİKLİK: Belirli bir zaman aralığı istemeyi kaldırıyoruz.
        // Bu, API'nin bize sunabileceği maksimum saatlik veriyi (genellikle 48+ saat) göndermesini sağlar.
        String url = UriComponentsBuilder.fromHttpUrl(API_URL)
            .queryParam("location", lat + "," + lon)
            .queryParam("apikey",   apiKey)
            .queryParam("timesteps","1h,1d")
            .queryParam("units",    "metric")
            .queryParam("language", "tr")
            .toUriString();

        try {
            String body = restTemplate.getForObject(url, String.class);
            ObjectMapper om = new ObjectMapper();
            JsonNode root = om.readTree(body);

            JsonNode hourly = root.path("timelines").path("hourly");
            JsonNode daily  = root.path("timelines").path("daily");

            // — Anlık veri —
            JsonNode nowVals   = hourly.get(0).path("values");
            JsonNode todayVals = daily.get(0).path("values");
            AnlikHavaDurumuDto anlik = new AnlikHavaDurumuDto();
            anlik.setSicaklik(   nowVals.path("temperature").asDouble());
            anlik.setEnYuksek(   todayVals.path("temperatureMax").asDouble());
            anlik.setEnDusuk(    todayVals.path("temperatureMin").asDouble());
            anlik.setDurum(      weatherCodeToTurkish(nowVals.path("weatherCode").asInt()));
            anlik.setHissedilen( nowVals.path("temperatureApparent").asDouble());
            anlik.setNem(        nowVals.path("humidity").asDouble());
            anlik.setRuzgarHizi( nowVals.path("windSpeed").asDouble());
            anlik.setGorusMesafesi(nowVals.path("visibility").asDouble());
            anlik.setBasinc(     nowVals.path("pressureSurfaceLevel").asDouble());
            anlik.setDurumKodu(  nowVals.path("weatherCode").asInt());

            // — Saatlik 48h liste —
            List<SaatlikTahminDto> saatlik = new ArrayList<>();
            DateTimeFormatter hhFmt = DateTimeFormatter.ofPattern("HH:00");
            for (JsonNode n : hourly) {
                JsonNode v = n.path("values");
                OffsetDateTime odt = OffsetDateTime.parse(n.path("time").asText())
                    .withOffsetSameInstant(ZoneOffset.ofHours(3));
                SaatlikTahminDto dto = new SaatlikTahminDto();
                dto.setSaat(     odt.format(hhFmt));
                dto.setIsoTime(  odt.toLocalDateTime().toString());
                dto.setSicaklik( v.path("temperature").asDouble());
                dto.setDurumKodu(v.path("weatherCode").asInt());
                dto.setNem(      v.path("humidity").asDouble());
                saatlik.add(dto);
            }
            // ✅ DEĞİŞİKLİK: Artık listeyi 24 saat ile sınırlamıyoruz.
            // if (saatlik.size() > 24) saatlik = saatlik.subList(0,24);
          // --- DEBUG + backfill (ilk 24 saat) ---
int limit = Math.min(24, saatlik.size());

long before = IntStream.range(0, limit)
        .filter(i -> saatlik.get(i).getAiSicaklikTahmini() == null)
        .count();

backfillAiForFirst24Hours(saatlik);

long after = IntStream.range(0, limit)
        .filter(i -> saatlik.get(i).getAiSicaklikTahmini() == null)
        .count();

System.out.println("AI backfill (0-24): doldurulan=" + (before - after) +
        ", önceNull=" + before + ", sonraNull=" + after);

for (int i = 0; i < Math.min(5, limit); i++) {
    SaatlikTahminDto h = saatlik.get(i);
    System.out.println("[" + i + "] " + h.getSaat() +
            "  api=" + h.getSicaklik() +
            "  ai=" + h.getAiSicaklikTahmini());
}
// --- /DEBUG ---

            // — Günlük 1d liste —
            List<GunlukTahminDto> gunluk = new ArrayList<>();
            for (JsonNode d : daily) {
                OffsetDateTime odt = OffsetDateTime.parse(d.path("time").asText())
                    .withOffsetSameInstant(ZoneOffset.ofHours(3));
                GunlukTahminDto gd = new GunlukTahminDto();
                gd.setGun(       odt.getDayOfWeek().getDisplayName(TextStyle.FULL, new Locale("tr","TR")));
                gd.setEnDusuk(   d.path("values").path("temperatureMin").asDouble());
                gd.setEnYuksek(  d.path("values").path("temperatureMax").asDouble());
                gd.setDurumKodu( d.path("values").path("weatherCodeMax").asInt());
                gunluk.add(gd);
            }

            HavaDurumuCevapDto cevap = new HavaDurumuCevapDto();
            cevap.setAnlikHavaDurumu(anlik);
            cevap.setSaatlikTahmin(saatlik);
            cevap.setGunlukTahmin(gunluk);
            return cevap;

        } catch (Exception ex) {
            System.err.println("API isteğinde hata: " + ex.getMessage());
            return null;
        }
    }
    // HavaDurumuService.java  (getWeather(...) ALTINA EKLE)
public List<SaatlikTahminDto> getSaatlik24(double lat, double lon) {
    HavaDurumuCevapDto c = getWeather(String.valueOf(lat), String.valueOf(lon));
    if (c == null || c.getSaatlikTahmin() == null) return List.of();
    List<SaatlikTahminDto> s = c.getSaatlikTahmin();
    return s.size() > 24 ? s.subList(0, 24) : s;
}

    private String weatherCodeToTurkish(int code) {
        return switch (code) {
            case 1000 -> "Açık";
            case 1100 -> "Genellikle Açık";
            case 1101,1104 -> "Parçalı Bulutlu";
            case 1001,1102,1103 -> "Çok Bulutlu";
            case 2000,2100 -> "Sisli";
            case 4000,4200 -> "Hafif Yağmurlu";
            case 4201 -> "Şiddetli Yağmur";
            case 5000,5100 -> "Kar";
            case 6000,6200,6201 -> "Dolu";
            case 8000 -> "Gök Gürültülü Fırtına";
            default -> "Bilinmeyen";
        };
    }
    // İlk 24 saatte AI boşsa, AI = API. 24+ saatlik kısma asla dokunma.
private void backfillAiForFirst24Hours(List<SaatlikTahminDto> saatlikTahmin) {
    if (saatlikTahmin == null || saatlikTahmin.isEmpty()) return;

    int limit = Math.min(24, saatlikTahmin.size());
    for (int i = 0; i < limit; i++) {
        SaatlikTahminDto h = saatlikTahmin.get(i);

        // AI boşsa, API sıcaklığıyla doldur (sicaklik double olduğu için null kontrolü gerekmez)
        if (h.getAiSicaklikTahmini() == null) {
            h.setAiSicaklikTahmini(h.getSicaklik());
            // h.setDogrulukYuzdesi(100.0); // istersen
        }
    }
}
}

