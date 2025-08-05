package com.havadurumu.backend;

import com.havadurumu.backend.dto.GirdiVerisi;
import com.havadurumu.backend.dto.GunlukTahminDto;
import com.havadurumu.backend.dto.HavaDurumuCevapDto;
import com.havadurumu.backend.dto.SaatlikTahminDto;
import com.havadurumu.backend.dto.TahminCiktisi;
import com.havadurumu.backend.HavaDurumuService;
import com.havadurumu.backend.service.YapayZekaTahminService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@RestController
public class HavaDurumuController {

    private final HavaDurumuService       havaDurumuService;
    private final YapayZekaTahminService yapayZekaTahminService;

    public HavaDurumuController(HavaDurumuService havaDurumuService,
                                YapayZekaTahminService yapayZekaTahminService) {
        this.havaDurumuService      = havaDurumuService;
        this.yapayZekaTahminService = yapayZekaTahminService;
    }

    @GetMapping("/api/weather")
    public HavaDurumuCevapDto getWeather(
            @RequestParam("lat") String lat,
            @RequestParam("lon") String lon
    ) {
        System.out.println("=== HAVA DURUMU İSTEĞİ BAŞLADI ===");
        
        // 1) Tomorrow.io'dan 24 saat + 6 günlük veriyi al
        HavaDurumuCevapDto cevap = havaDurumuService.getWeather(lat, lon);
        if (cevap == null) {
            throw new RuntimeException("Hava durumu servisi boş döndü");
        }

        System.out.println("Tomorrow.io'dan " + cevap.getSaatlikTahmin().size() + " saatlik veri alındı");

        // 2) Saatlik tahmin listesi
        List<SaatlikTahminDto> saatlik = cevap.getSaatlikTahmin();
        if (saatlik != null && !saatlik.isEmpty()) {
            // 3) Önce ISO time'a göre sırala ve son 24 elemanı al
            List<SaatlikTahminDto> sorted = saatlik.stream()
                    .sorted(Comparator.comparing(SaatlikTahminDto::getIsoTime))
                    .collect(Collectors.toList());
            int n = sorted.size();
            List<SaatlikTahminDto> last24 = sorted.subList(Math.max(0, n - 24), n);

            System.out.println("Son 24 saat verisi hazırlandı: " + last24.size() + " kayıt");

            // 4) AI'ya göndermek için GirdiVerisi listesi oluştur
            List<GirdiVerisi> aiInput = last24.stream()
                    .map(d -> new GirdiVerisi(d.getIsoTime(), d.getNem(), d.getDurumKodu()))
                    .collect(Collectors.toList());

            System.out.println("AI'ya gönderilecek veri:");
            for (int i = 0; i < Math.min(3, aiInput.size()); i++) {
                GirdiVerisi g = aiInput.get(i);
                System.out.println("  " + g.getDs() + " | Nem: " + g.getNem() + " | Kod: " + g.getDurumKodu());
            }
            System.out.println("  ... toplam " + aiInput.size() + " kayıt");

            // 5) Prophet ile +3 saatlik tahmini al
            List<TahminCiktisi> aiTahmin;
            try {
                System.out.println("AI servisine istek gönderiliyor...");
                aiTahmin = yapayZekaTahminService.getYapayZekaTahmini(aiInput);
                System.out.println("AI servisinden " + aiTahmin.size() + " tahmin alındı");
                
                for (TahminCiktisi t : aiTahmin) {
                    System.out.println("  AI Tahmin: " + t.getDs() + " | Sıcaklık: " + t.getYhat());
                }
                
            } catch (Exception ex) {
                System.err.println("AI saatlik tahmin çağrısında hata: " + ex.getMessage());
                ex.printStackTrace();
                aiTahmin = Collections.emptyList();
            }

            // 6) Gelen +3 saati orijinal saatlik listesine ekle
            int eklenenSayisi = 0;
            for (TahminCiktisi t : aiTahmin) {
                try {
                    LocalDateTime ldt = LocalDateTime.parse(t.getDs());
                    SaatlikTahminDto extra = new SaatlikTahminDto();
                    extra.setSaat(ldt.format(DateTimeFormatter.ofPattern("HH:00")));
                    extra.setIsoTime(t.getDs());
                    extra.setSicaklik(t.getYhat());
                    // en son bildiğimiz nem ve kodu kullan
                    extra.setNem(last24.get(last24.size() - 1).getNem());
                    extra.setDurumKodu(last24.get(last24.size() - 1).getDurumKodu());
                    cevap.getSaatlikTahmin().add(extra);
                    eklenenSayisi++;
                } catch (Exception e) {
                    System.err.println("AI tahmin eklenirken hata: " + e.getMessage());
                }
            }
            
            System.out.println(eklenenSayisi + " AI tahmini başarıyla eklendi");
            System.out.println("Final saatlik tahmin sayısı: " + cevap.getSaatlikTahmin().size());
        }

        System.out.println("=== HAVA DURUMU İSTEĞİ TAMAMLANDI ===");
        return cevap;
    }
}