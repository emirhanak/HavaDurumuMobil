package com.havadurumu.backend;

import com.havadurumu.backend.dto.*;
import com.havadurumu.backend.HavaDurumuService;
import com.havadurumu.backend.service.YapayZekaTahminService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class HavaDurumuController {

    private final HavaDurumuService havaDurumuService;
    private final YapayZekaTahminService yapayZekaTahminService;

    public HavaDurumuController(HavaDurumuService havaDurumuService, YapayZekaTahminService yapayZekaTahminService) {
        this.havaDurumuService = havaDurumuService;
        this.yapayZekaTahminService = yapayZekaTahminService;
    }

    @GetMapping("/api/weather")
    public HavaDurumuCevapDto getWeather(@RequestParam("lat") String lat, @RequestParam("lon") String lon) {
        
        HavaDurumuCevapDto cevapDto = havaDurumuService.getWeather(lat, lon);
        
        if (cevapDto == null || cevapDto.getSaatlikTahmin() == null || cevapDto.getSaatlikTahmin().size() < 30) {
            return cevapDto;
        }

        List<SaatlikTahminDto> orjinalSaatlikListe = cevapDto.getSaatlikTahmin();

        try {
            List<GirdiVerisi> sonSaatlikVerilerAI = orjinalSaatlikListe.stream()
                .limit(24)
                .map(saatlikDto -> new GirdiVerisi(
                    saatlikDto.getIsoTime() + "Z",
                    saatlikDto.getSicaklik(),
                    saatlikDto.getNem(),
                    saatlikDto.getDurumKodu()
                ))
                .collect(Collectors.toList());
            
            List<TahminCiktisi> aiSaatlikTahminler = yapayZekaTahminService.getYapayZekaTahmini(sonSaatlikVerilerAI);
            
            if (aiSaatlikTahminler != null && !aiSaatlikTahminler.isEmpty()) {
                // Sadece ilk 24 saati alarak yeni bir liste oluştur
                List<SaatlikTahminDto> nihaiListe = new ArrayList<>(orjinalSaatlikListe.subList(0, 24));
                double toplamDogruluk = 0;

                for (int i = 0; i < aiSaatlikTahminler.size(); i++) {
                    int targetIndex = 24 + i;
                    
                    TahminCiktisi aiTahmin = aiSaatlikTahminler.get(i);
                    SaatlikTahminDto tomorrowTahmini = orjinalSaatlikListe.get(targetIndex);
                    
                    // Yeni bir DTO oluşturup tüm bilgileri birleştirelim
                    SaatlikTahminDto karsilastirmaDto = tomorrowTahmini; // Mevcut DTO'yu güncelleyelim
                    
                    // Bizim tahminlerimizi ekle
                    karsilastirmaDto.setAiSicaklikTahmini(aiTahmin.getYhat_temp());
                    // Nem tahmini artık yok
                    
                    // ✅ YENİ: Yüzdelik Doğruluk Hesaplama
                    double tomorrowSicaklik = tomorrowTahmini.getSicaklik();
                    double aiSicaklik = aiTahmin.getYhat_temp();
                    double dogrulukYuzdesi = 100.0; // Varsayılan

                    // Sıfıra bölme hatasını önle
                    if (tomorrowSicaklik != 0) {
                        double sapma = Math.abs(tomorrowSicaklik - aiSicaklik);
                        dogrulukYuzdesi = (1 - (sapma / Math.abs(tomorrowSicaklik))) * 100;
                    }
                    karsilastirmaDto.setDogrulukYuzdesi(dogrulukYuzdesi < 0 ? 0 : dogrulukYuzdesi); // Sonuç negatifse 0 yap
                    toplamDogruluk += karsilastirmaDto.getDogrulukYuzdesi();
                    
                    nihaiListe.add(karsilastirmaDto);
                }

                // Ortalama doğruluğu konsola yazdır
                double ortalamaDogruluk = toplamDogruluk / aiSaatlikTahminler.size();
                System.out.println(String.format("Yapay Zeka modelinin ortalama doğruluk oranı: %%%.2f", ortalamaDogruluk));
                
                // Ana cevaptaki listeyi bizim oluşturduğumuz bu temiz 30 saatlik listeyle değiştir
                cevapDto.setSaatlikTahmin(nihaiListe);
            }
        } catch (Exception e) {
            System.err.println("Controller'da AI tahmini alınırken bir hata oluştu: " + e.getMessage());
        }
        
        return cevapDto;
    }
}