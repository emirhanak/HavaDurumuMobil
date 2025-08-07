package com.havadurumu.backend;

import com.havadurumu.backend.dto.*;
import com.havadurumu.backend.HavaDurumuService;
import com.havadurumu.backend.service.YapayZekaTahminService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;

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
        
        // 1. Tomorrow.io'dan 48 saatlik tam veriyi al
        HavaDurumuCevapDto cevapDto = havaDurumuService.getWeather(lat, lon);
        
        if (cevapDto == null || cevapDto.getSaatlikTahmin() == null || cevapDto.getSaatlikTahmin().size() < 30) {
            // Karşılaştırma için yeterli veri yoksa, gelen ham veriyi dön (veya null)
            return cevapDto;
        }

        List<SaatlikTahminDto> orjinalSaatlikListe = cevapDto.getSaatlikTahmin();

        try {
            // 2. AI Tahmini için ilk 24 saati hazırla ve Python'a gönder
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
            
            // 3. Nihai 30 Saatlik Listeyi Oluştur (24 Standart + 6 Karşılaştırmalı AI)
            if (aiSaatlikTahminler != null && !aiSaatlikTahminler.isEmpty()) {
                // Sadece ilk 24 saati alarak yeni bir liste oluştur
                List<SaatlikTahminDto> nihaiListe = new ArrayList<>(orjinalSaatlikListe.subList(0, 24));
                double toplamSapma = 0;

                for (int i = 0; i < aiSaatlikTahminler.size(); i++) {
                    int targetIndex = 24 + i;
                    
                    TahminCiktisi aiTahmin = aiSaatlikTahminler.get(i);
                    SaatlikTahminDto tomorrowTahmini = orjinalSaatlikListe.get(targetIndex);
                    
                    // Yeni bir DTO oluşturup tüm bilgileri birleştirelim
                    SaatlikTahminDto karsilastirmaDto = new SaatlikTahminDto();
                    LocalDateTime ldt = LocalDateTime.parse(aiTahmin.getDs());
                    
                    karsilastirmaDto.setSaat(ldt.format(DateTimeFormatter.ofPattern("HH:00")));
                    karsilastirmaDto.setIsoTime(aiTahmin.getDs());
                    karsilastirmaDto.setDurumKodu(9999); // AI Tahmini olduğunu belirtir
                    
                    // Karşılaştırma verilerini ekle
                    karsilastirmaDto.setSicaklik(tomorrowTahmini.getSicaklik()); // Tomorrow.io'nun tahmini
                    karsilastirmaDto.setNem(tomorrowTahmini.getNem());
                    karsilastirmaDto.setAiSicaklikTahmini(aiTahmin.getYhat_temp()); // Bizim tahminimiz
                    karsilastirmaDto.setAiNemTahmini(aiTahmin.getYhat_nem());
                    
                    // Sapmayı hesapla
                    double sapma = Math.abs(tomorrowTahmini.getSicaklik() - aiTahmin.getYhat_temp());
                    karsilastirmaDto.setSapmaOrani(sapma);
                    toplamSapma += sapma;
                    
                    nihaiListe.add(karsilastirmaDto);
                }

                // Ortalama sapmayı konsola yazdır
                double ortalamaSapma = toplamSapma / aiSaatlikTahminler.size();
                System.out.println(String.format("Yapay Zeka modelinin ortalama sapması: %.2f °C", ortalamaSapma));
                
                // Ana cevaptaki listeyi bizim oluşturduğumuz bu temiz 30 saatlik listeyle değiştir
                cevapDto.setSaatlikTahmin(nihaiListe);
            }
        } catch (Exception e) {
            System.err.println("Controller'da AI tahmini alınırken bir hata oluştu: " + e.getMessage());
        }
        
        return cevapDto;
    }
}