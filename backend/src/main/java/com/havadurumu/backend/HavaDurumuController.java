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
    public HavaDurumuCevapDto getWeather(
            @RequestParam("lat") String lat,
            @RequestParam("lon") String lon) {

        // 1. Tomorrow.io'dan mevcut tüm verileri çek
        HavaDurumuCevapDto cevapDto = havaDurumuService.getWeather(lat, lon);

        if (cevapDto == null) {
            return null;
        }

        // 2. Saatlik AI Tahminini al ve ekle
        if (cevapDto.getSaatlikTahmin() != null && !cevapDto.getSaatlikTahmin().isEmpty()) {
            List<GirdiVerisi> sonSaatlikVerilerAI = cevapDto.getSaatlikTahmin().stream()
                .map(saatlikDto -> {
                    // Python'a UTC formatında tam tarih gönder
                    String tamTarih = java.time.LocalDate.now(ZoneOffset.UTC).toString() + "T" + saatlikDto.getSaat() + ":00Z";
                    return new GirdiVerisi(tamTarih, saatlikDto.getNem(), saatlikDto.getDurumKodu());
                })
                .collect(Collectors.toList());
            
            List<TahminCiktisi> aiSaatlikTahminler = yapayZekaTahminService.getYapayZekaTahmini(sonSaatlikVerilerAI);
            
            if (aiSaatlikTahminler != null && !aiSaatlikTahminler.isEmpty()) {
                for (TahminCiktisi aiTahmin : aiSaatlikTahminler) {
                    SaatlikTahminDto yeniTahminDto = new SaatlikTahminDto();
                    // Python'dan gelen UTC'siz tarihi parse et
                    LocalDateTime ldt = LocalDateTime.parse(aiTahmin.getDs());
                    yeniTahminDto.setSaat(ldt.format(DateTimeFormatter.ofPattern("HH:00")));
                    yeniTahminDto.setSicaklik(aiTahmin.getYhat());
                    yeniTahminDto.setDurumKodu(9999); // AI Tahmini için özel kod
                    yeniTahminDto.setNem(0);
                    cevapDto.getSaatlikTahmin().add(yeniTahminDto);
                }
            }
        }

        // 3. Günlük AI Tahminini al ve ekle
        if (cevapDto.getGunlukTahmin() != null && !cevapDto.getGunlukTahmin().isEmpty() && !cevapDto.getSaatlikTahmin().isEmpty()) {
            List<GirdiVerisi> sonGunVerisiAI = new ArrayList<>();
            SaatlikTahminDto sonSaat = cevapDto.getSaatlikTahmin().get(0);
            String tamTarih = java.time.LocalDate.now(ZoneOffset.UTC).toString() + "T" + sonSaat.getSaat() + ":00Z";
            sonGunVerisiAI.add(new GirdiVerisi(tamTarih, sonSaat.getNem(), sonSaat.getDurumKodu()));

            List<TahminCiktisi> aiGunlukTahminler = yapayZekaTahminService.getGunlukYapayZekaTahmini(sonGunVerisiAI);
            
            if (aiGunlukTahminler != null && !aiGunlukTahminler.isEmpty()) {
                for (TahminCiktisi aiGunluk : aiGunlukTahminler) {
                    GunlukTahminDto yeniGunlukDto = new GunlukTahminDto();
                    LocalDateTime ldt = LocalDateTime.parse(aiGunluk.getDs());
                    yeniGunlukDto.setGun(ldt.getDayOfWeek().getDisplayName(TextStyle.FULL, new Locale("tr", "TR")));
                    yeniGunlukDto.setEnDusuk(aiGunluk.getYhat_lower());
                    yeniGunlukDto.setEnYuksek(aiGunluk.getYhat_upper());
                    yeniGunlukDto.setDurumKodu(9999);
                    
                    cevapDto.getGunlukTahmin().add(yeniGunlukDto);
                }
            }
        }
        
        return cevapDto;
    }
}