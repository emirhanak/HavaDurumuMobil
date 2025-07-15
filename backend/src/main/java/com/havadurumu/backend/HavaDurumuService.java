package com.havadurumu.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.havadurumu.backend.dto.AnlikHavaDurumuDto;
import com.havadurumu.backend.dto.GunlukTahminDto;
import com.havadurumu.backend.dto.HavaDurumuCevapDto;
import com.havadurumu.backend.dto.SaatlikTahminDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class HavaDurumuService {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${tomorrow.api.key}")
    private String apiKey;

    private final String apiUrl = "https://api.tomorrow.io/v4/weather/forecast";

       
    @Cacheable("weatherCache") // <-- BU SATIR ÇOK ÖNEMLİ
    public HavaDurumuCevapDto getWeather(String lat, String lon) {
        String fullUrl = UriComponentsBuilder.fromUriString(apiUrl)
                .queryParam("location", lat + "," + lon)
                .queryParam("apikey", apiKey)
                .queryParam("timesteps", "1h,1d")
                .queryParam("units", "metric")
                .queryParam("language", "tr")
                .toUriString();

        try {
            String jsonResponse = restTemplate.getForObject(fullUrl, String.class);
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode rootNode = objectMapper.readTree(jsonResponse);

            // Gerekli veri bloklarını alıyoruz
            JsonNode hourlyTimeline = rootNode.path("timelines").path("hourly");
            JsonNode dailyTimeline = rootNode.path("timelines").path("daily");

            // ANLIK VERİ: Saatlik verinin ilk elemanından ve günlük verinin özetinden oluşturulur
            JsonNode anlikVeriNode = hourlyTimeline.get(0).path("values");
            JsonNode gunlukOzetNode = dailyTimeline.get(0).path("values");

            AnlikHavaDurumuDto anlikDto = new AnlikHavaDurumuDto();
            anlikDto.setSicaklik(anlikVeriNode.path("temperature").asDouble()); // Anlık sıcaklık saatlikten alınır
            anlikDto.setEnYuksek(gunlukOzetNode.path("temperatureMax").asDouble()); // Günlük en yüksek
            anlikDto.setEnDusuk(gunlukOzetNode.path("temperatureMin").asDouble()); // Günlük en düşük
            anlikDto.setDurum(weatherCodeToTurkish(anlikVeriNode.path("weatherCode").asInt())); // Anlık durum saatlikten alınır
            
            // SAATLİK TAHMİN LİSTESİ
            List<SaatlikTahminDto> saatlikListe = new ArrayList<>();
            for (int i = 0; i < 24; i++) {
                JsonNode saatlikNode = hourlyTimeline.get(i);
                if (saatlikNode == null) break;
                SaatlikTahminDto saatlikDto = new SaatlikTahminDto();
                OffsetDateTime odt = OffsetDateTime.parse(saatlikNode.path("time").asText());
                saatlikDto.setSaat(odt.format(DateTimeFormatter.ofPattern("HH:00")));
                saatlikDto.setSicaklik(saatlikNode.path("values").path("temperature").asDouble());
                saatlikDto.setDurumKodu(saatlikNode.path("values").path("weatherCode").asInt());
                saatlikListe.add(saatlikDto);
            }

            // GÜNLÜK TAHMİN LİSTESİ
            List<GunlukTahminDto> gunlukListe = new ArrayList<>();
            for (JsonNode gunlukNode : dailyTimeline) {
                GunlukTahminDto gunlukDto = new GunlukTahminDto();
                OffsetDateTime odt = OffsetDateTime.parse(gunlukNode.path("time").asText());
                gunlukDto.setGun(odt.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.forLanguageTag("tr")));
                gunlukDto.setEnDusuk(gunlukNode.path("values").path("temperatureMin").asDouble());
                gunlukDto.setEnYuksek(gunlukNode.path("values").path("temperatureMax").asDouble());
                gunlukDto.setDurumKodu(gunlukNode.path("values").path("weatherCodeMax").asInt());
                gunlukListe.add(gunlukDto);
            }
            
            // SON CEVABI OLUŞTURMA
            HavaDurumuCevapDto cevapDto = new HavaDurumuCevapDto();
            cevapDto.setSehirAdi(rootNode.path("location").path("name").asText("Bilinmeyen Konum"));
            cevapDto.setAnlikHavaDurumu(anlikDto);
            cevapDto.setSaatlikTahmin(saatlikListe);
            cevapDto.setGunlukTahmin(gunlukListe);

            return cevapDto;

        } catch (Exception e) {
            System.err.println("API isteği sırasında hata oluştu: " + e.getMessage());
            return null;
        }
    }
    
    private String weatherCodeToTurkish(int code) {
        return switch (code) {
            case 1000 -> "Açık"; case 1100 -> "Genellikle Açık"; case 1101 -> "Parçalı Bulutlu";
            case 1001 -> "Bulutlu"; case 2000, 2100 -> "Sisli"; case 4001 -> "Çisenti";
            case 4000, 4200 -> "Hafif Yağmurlu"; case 4201 -> "Şiddetli Yağmur"; case 5001 -> "Hafif Kar";
            case 5000, 5100 -> "Kar Yağışlı"; case 5101 -> "Yoğun Kar Yağışı"; case 6000 -> "Hafif Dolu";
            case 6001, 6200, 6201 -> "Dolu"; case 7101, 7102, 7000 -> "Sulu Kar"; case 8000 -> "Fırtınalı";
            default -> "Bilinmeyen";
        };
    }
}