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
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
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

        if (cevapDto == null || cevapDto.getSaatlikTahmin() == null || cevapDto.getSaatlikTahmin().isEmpty()) {
            return cevapDto;
        }

        // --- YAPAY ZEKA ENTEGRASYONU ---
        // ✅ DÜZELTME: Servis çağrısını, Java'nın zorunlu kıldığı try-catch bloğu içine alıyoruz.
        try {
            List<GirdiVerisi> sonSaatlikVerilerAI = cevapDto.getSaatlikTahmin().stream()
                .limit(24) // AI modeline her zaman tutarlı sayıda (24) veri gönder
                .map(saatlikDto -> new GirdiVerisi(
                    saatlikDto.getIsoTime() + "Z",
                    saatlikDto.getSicaklik(),
                    saatlikDto.getNem(),
                    saatlikDto.getDurumKodu()
                ))
                .collect(Collectors.toList());
            
            List<TahminCiktisi> aiSaatlikTahminler = yapayZekaTahminService.getYapayZekaTahmini(sonSaatlikVerilerAI);
            
            if (aiSaatlikTahminler != null && !aiSaatlikTahminler.isEmpty()) {
                for (TahminCiktisi aiTahmin : aiSaatlikTahminler) {
                    SaatlikTahminDto yeniTahminDto = new SaatlikTahminDto();
                    // Python'dan gelen tarih formatı artık ISO standardında olduğu için direkt parse edebiliriz.
                    LocalDateTime ldt = LocalDateTime.parse(aiTahmin.getDs()); 
                    yeniTahminDto.setSaat(ldt.format(DateTimeFormatter.ofPattern("HH:00")));
                    yeniTahminDto.setSicaklik(aiTahmin.getYhat_temp());
                    yeniTahminDto.setNem(aiTahmin.getYhat_nem());
                    yeniTahminDto.setDurumKodu(9999); // AI Tahmini için özel kod
                    yeniTahminDto.setIsoTime(aiTahmin.getDs());
                    
                    // AI tahminini ana listeye ekliyoruz
                    cevapDto.getSaatlikTahmin().add(yeniTahminDto);
                }
            }
        } catch (Exception e) {
            // Eğer Python servisine bağlanırken bir hata olursa, programın çökmesini engelle
            // ve konsola bir hata mesajı yaz.
            System.err.println("Controller'da AI tahmini alınırken bir hata oluştu: " + e.getMessage());
        }
        
        // Günlük AI tahmini artık istemediğimiz için o bölüm tamamen kaldırıldı.
        return cevapDto;
    }
}