package com.havadurumu.backend;

import com.havadurumu.backend.dto.GirdiVerisi;
import com.havadurumu.backend.dto.HavaDurumuCevapDto;
import com.havadurumu.backend.dto.SaatlikTahminDto;
import com.havadurumu.backend.dto.TahminCiktisi;
import com.havadurumu.backend.service.YapayZekaTahminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class HavaDurumuController {

    @Autowired
    private HavaDurumuService havaDurumuService;
    
    @Autowired
    private YapayZekaTahminService yapayZekaTahminService;

    @GetMapping("/api/weather")
    public HavaDurumuCevapDto getWeather(
            @RequestParam("lat") String lat,
            @RequestParam("lon") String lon) {
        
        System.out.println("\n--- YENİ İSTEK GELDİ ---");

        // 1. Tomorrow.io'dan tüm hava durumu verilerini al
        HavaDurumuCevapDto cevapDto = havaDurumuService.getWeather(lat, lon);

        // --- CASUS 1: İlk veriyi kontrol edelim ---
        if (cevapDto == null || cevapDto.getSaatlikTahmin() == null || cevapDto.getSaatlikTahmin().isEmpty()) {
            System.out.println("HATA: HavaDurumuService'ten saatlik tahmin verisi alınamadı veya liste boş!");
            return cevapDto; 
        }
        System.out.println("ADIM 1 BAŞARILI: HavaDurumuService'ten " + cevapDto.getSaatlikTahmin().size() + " adet saatlik tahmin alındı.");


        // 2. AI Tahmini için Gerekli Veriyi Hazırla
        List<GirdiVerisi> sonVerilerAI = cevapDto.getSaatlikTahmin().stream()
            .map(saatlikDto -> {
                String tamTarih = OffsetDateTime.now().toLocalDate().toString() + "T" + saatlikDto.getSaat() + ":00Z";
                double nem = saatlikDto.getNem();
                return new GirdiVerisi(tamTarih, nem, saatlikDto.getDurumKodu());
            })
            .collect(Collectors.toList());
        
        // --- CASUS 2: Dönüştürülen veriyi kontrol edelim ---
        System.out.println("ADIM 2 BAŞARILI: Veri, Python'a gönderilecek formata dönüştürüldü. Liste boyutu: " + sonVerilerAI.size());


        // 3. Yapay Zeka Servisinden 3 saatlik tahmini al
        System.out.println("ADIM 3: Yapay zeka servisine tahmin isteği gönderiliyor...");
        List<TahminCiktisi> aiTahminleri = yapayZekaTahminService.getYapayZekaTahmini(sonVerilerAI);
        // YENİ EKLENEN LOGLAMA KODU
if (aiTahminleri != null && !aiTahminleri.isEmpty()) {
    System.out.println("\n--- BAŞARILI: YAPAY ZEKA TAHMİN SONUÇLARI ---");
    for (TahminCiktisi tahmin : aiTahminleri) {
        System.out.println("Saat: " + tahmin.getDs() + ", Tahmin Edilen Sıcaklık: " + tahmin.getYhat());
    }
    System.out.println("--------------------------------------------");
}
        System.out.println("Yapay zeka servisinden cevap alındı. Tahmin sayısı: " + (aiTahminleri != null ? aiTahminleri.size() : 0));


        // 4. AI Tahminlerini mevcut yanıta ekle
        if (aiTahminleri != null && !aiTahminleri.isEmpty()) {
            for (TahminCiktisi aiTahmin : aiTahminleri) {
                SaatlikTahminDto yapayZekaTahminDto = new SaatlikTahminDto();
                OffsetDateTime odt = OffsetDateTime.parse(aiTahmin.getDs());
                yapayZekaTahminDto.setSaat(odt.format(DateTimeFormatter.ofPattern("HH:00")));
                yapayZekaTahminDto.setSicaklik(aiTahmin.getYhat());
                yapayZekaTahminDto.setDurumKodu(9999);
                yapayZekaTahminDto.setNem(0); 
                cevapDto.getSaatlikTahmin().add(yapayZekaTahminDto);
            }
            System.out.println("ADIM 4 BAŞARILI: AI tahminleri ana yanıta eklendi.");
        }

        // 5. Nihai sonucu geri dön
        return cevapDto;
    }
}