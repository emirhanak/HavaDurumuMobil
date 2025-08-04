package com.havadurumu.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.havadurumu.backend.dto.AnlikHavaDurumuDto;
import com.havadurumu.backend.dto.GunlukTahminDto;
import com.havadurumu.backend.dto.HavaDurumuCevapDto;
import com.havadurumu.backend.dto.SaatlikTahminDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.time.ZoneOffset;

@Service
public class HavaDurumuService {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${tomorrow.api.key}")
    private String apiKey;

    private final String apiUrl = "https://api.tomorrow.io/v4/weather/forecast";

    // Önbelleği (cache) test süresince kapalı tutuyoruz. Proje bitince açabilirsin.
    // @Cacheable("weatherCache")
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

            JsonNode hourlyTimeline = rootNode.path("timelines").path("hourly");
            JsonNode dailyTimeline = rootNode.path("timelines").path("daily");

            // --- GÜNCELLENMİŞ ZAMAN YÖNETİMİ ---
            // Türkiye saat dilimini al
            ZoneOffset turkeyOffset = ZoneOffset.of("+03:00");
            // Şu anki zamanı Türkiye saatine göre al
            OffsetDateTime now = OffsetDateTime.now(turkeyOffset);
            // Saati 00:00 formatına yuvarla (örn: 10:12 -> 10:00)
            now = now.withMinute(0).withSecond(0).withNano(0);

            int startIndex = -1;

            // 1. Önce, şu anki saate en yakın tahmini bulalım
            for (int i = 0; i < hourlyTimeline.size(); i++) {
                JsonNode node = hourlyTimeline.get(i);
                OffsetDateTime tahminZamani = OffsetDateTime.parse(node.path("time").asText());

                // Eğer tahminin saati, şu anki saate eşit veya daha büyükse
                if (!tahminZamani.isBefore(now)) {
                    startIndex = i;
                    break;
                }
            }

            // Eğer uygun bir başlangıç noktası bulunamadıysa, en sonki tahmini kullan
            if (startIndex == -1) {
                startIndex = Math.max(0, hourlyTimeline.size() - 24);
            }

            // Eğer hala bulunamadıysa, listenin başını al (hata durumu için).
            if (startIndex == -1) {
                startIndex = 0;
            }

            // Artık "anlık veri" için ayrı bir mantığa gerek yok,
            // doğru başlangıç noktasını bulduğumuz için oradan başlayabiliriz.
            JsonNode anlikVeriNode = hourlyTimeline.get(startIndex).path("values");
            JsonNode gunlukOzetNode = dailyTimeline.get(0).path("values");

            AnlikHavaDurumuDto anlikDto = new AnlikHavaDurumuDto();
            anlikDto.setSicaklik(anlikVeriNode.path("temperature").asDouble());
            anlikDto.setEnYuksek(gunlukOzetNode.path("temperatureMax").asDouble());
            anlikDto.setEnDusuk(gunlukOzetNode.path("temperatureMin").asDouble());
            anlikDto.setDurum(weatherCodeToTurkish(anlikVeriNode.path("weatherCode").asInt()));
            anlikDto.setHissedilen(anlikVeriNode.path("temperatureApparent").asDouble());
            anlikDto.setNem(anlikVeriNode.path("humidity").asDouble());
            anlikDto.setRuzgarHizi(anlikVeriNode.path("windSpeed").asDouble());
            anlikDto.setGorusMesafesi(anlikVeriNode.path("visibility").asDouble());
            anlikDto.setBasinc(anlikVeriNode.path("pressureSurfaceLevel").asDouble());
            anlikDto.setDurumKodu(anlikVeriNode.path("weatherCode").asInt());

            List<SaatlikTahminDto> saatlikListe = new ArrayList<>();
            // Döngü artık doğru 'startIndex'den başlıyor.
            for (int i = startIndex; i < startIndex + 24 && i < hourlyTimeline.size(); i++) {
                JsonNode saatlikNode = hourlyTimeline.get(i);
                if (saatlikNode == null) break;

                JsonNode valuesNode = saatlikNode.path("values");
                SaatlikTahminDto saatlikDto = new SaatlikTahminDto();
                OffsetDateTime odt = OffsetDateTime.parse(saatlikNode.path("time").asText());
                
saatlikDto.setSaat(odt.withOffsetSameInstant(ZoneOffset.ofHours(3)).format(DateTimeFormatter.ofPattern("HH:00")));
                saatlikDto.setSicaklik(valuesNode.path("temperature").asDouble());
                saatlikDto.setDurumKodu(valuesNode.path("weatherCode").asInt());
                saatlikDto.setNem(valuesNode.path("humidity").asDouble());
                
                saatlikListe.add(saatlikDto);
            }

            List<GunlukTahminDto> gunlukListe = new ArrayList<>();
            for (JsonNode gunlukNode : dailyTimeline) {
                GunlukTahminDto gunlukDto = new GunlukTahminDto();
                OffsetDateTime odt = OffsetDateTime.parse(gunlukNode.path("time").asText());
gunlukDto.setGun(odt.withOffsetSameInstant(ZoneOffset.ofHours(3)).getDayOfWeek().getDisplayName(TextStyle.FULL, new Locale("tr", "TR")));
                gunlukDto.setEnDusuk(gunlukNode.path("values").path("temperatureMin").asDouble());
                gunlukDto.setEnYuksek(gunlukNode.path("values").path("temperatureMax").asDouble());
                gunlukDto.setDurumKodu(gunlukNode.path("values").path("weatherCodeMax").asInt());
                gunlukListe.add(gunlukDto);
            }
            
            HavaDurumuCevapDto cevapDto = new HavaDurumuCevapDto();
            cevapDto.setAnlikHavaDurumu(anlikDto);
            cevapDto.setSaatlikTahmin(saatlikListe);
            cevapDto.setGunlukTahmin(gunlukListe);

            return cevapDto;

        } catch (Exception e) {
            System.err.println("API isteği sırasında hata oluştu: " + e.getMessage());
            e.printStackTrace(); // Hatanın detayını görmek için
            return null;
        }
    }
    
    private String weatherCodeToTurkish(int code) {
        return switch (code) {
            case 1000 -> "Açık";
            case 1100 -> "Genellikle Açık";
            case 1101, 1104 -> "Parçalı Bulutlu";
            case 1001, 1102, 1103 -> "Çok Bulutlu";
            case 2000, 2100 -> "Sisli";
            case 4001 -> "Çisenti";
            case 4000, 4200 -> "Hafif Yağmurlu";
            case 4201 -> "Şiddetli Yağmur";
            case 5001 -> "Hafif Kar Yağışlı";
            case 5000, 5100 -> "Kar Yağışlı";
            case 5101 -> "Yoğun Kar Yağışı";
            case 6000 -> "Hafif Dolu";
            case 6001, 6200, 6201 -> "Dolu";
            case 7101, 7102, 7000 -> "Sulu Kar";
            case 8000 -> "Gök Gürültülü Fırtına";
            default -> "Bilinmeyen Durum";
        };
    }
}