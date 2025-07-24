package com.havadurumu.backend;

import com.havadurumu.backend.dto.GirdiVerisi;
import com.havadurumu.backend.dto.HavaDurumuCevapDto;
import com.havadurumu.backend.dto.SaatlikTahminDto;
import com.havadurumu.backend.dto.TahminCiktisi;
import com.havadurumu.backend.service.YapayZekaTahminService; // Yeni servisi import ediyoruz
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class HavaDurumuController {

    // Mevcut HavaDurumuService'in kalıyor. @Autowired stilini koruyoruz.
    @Autowired
    private HavaDurumuService havaDurumuService;
    
    // YENİ EKLENEN: YapayZekaTahminService'i buraya enjekte ediyoruz.
    @Autowired
    private YapayZekaTahminService yapayZekaTahminService;


    // Mobil uygulamadan gelen isteği karşılayan mevcut metodun.
    // Endpoint adresini ("/api/weather") senin kullandığın şekilde güncelledim.
    @GetMapping("/api/weather")
    public HavaDurumuCevapDto getWeather(
            @RequestParam("lat") String lat,
            @RequestParam("lon") String lon) {
        
        // --- 1. Adım: Tomorrow.io'dan mevcut tüm verileri çek ---
        // Bu senin mevcut kodun, hava durumu bilgilerini alıyor.
        HavaDurumuCevapDto cevapDto = havaDurumuService.getWeather(lat, lon);

        // Eğer ilk API'den cevap gelmezse, işlemi sonlandır.
        if (cevapDto == null || cevapDto.getSaatlikTahmin() == null) {
            return null;
        }

        // --- 2. Adım: AI Tahmini için Gerekli Veriyi Hazırla ---
        // Tomorrow.io'dan gelen saatlik tahmin listesini, Python API'sinin anlayacağı
        // GirdiVerisi formatına dönüştürüyoruz.
        List<GirdiVerisi> sonVerilerAI = cevapDto.getSaatlikTahmin().stream()
            .map(saatlikDto -> {
                // Saat bilgisini Python'ın anlayacağı tam tarih formatına çeviriyoruz.
                // Örn: "15:00" -> "2025-07-24T15:00:00Z"
                String tamTarih = OffsetDateTime.now().toLocalDate().toString() + "T" + saatlikDto.getSaat() + ":00Z";
                
                // TODO: Bu en önemli kısım! HavaDurumuService'in, Tomorrow.io'dan
                // saatlik "nem" verisini de alıp SaatlikTahminDto içine koyacak şekilde
                // güncellenmesi gerekiyor. Şimdilik varsayılan bir değer ekliyorum.
                double nem = saatlikDto.getNem(); // Bu metodu SaatlikTahminDto'ya eklemelisin.
                
                return new GirdiVerisi(tamTarih, nem, saatlikDto.getDurumKodu());
            })
            .collect(Collectors.toList());

        // --- 3. Adım: Yapay Zeka Servisinden 3 saatlik tahmini al ---
        // Hazırladığımız veriyi Python API'sine gönderiyoruz.
        if (!sonVerilerAI.isEmpty()) {
            List<TahminCiktisi> aiTahminleri = yapayZekaTahminService.getYapayZekaTahmini(sonVerilerAI);
    
            // --- 4. Adım: AI Tahminlerini mevcut yanıta ekle ---
            // AI'dan gelen 3 saatlik tahmini, mobil uygulamanın anlayacağı SaatlikTahminDto formatına çeviriyoruz.
            for (TahminCiktisi aiTahmin : aiTahminleri) {
                SaatlikTahminDto yapayZekaTahminDto = new SaatlikTahminDto();
                
                // Gelen tam tarih formatını "HH:00" formatına çevir
                OffsetDateTime odt = OffsetDateTime.parse(aiTahmin.getDs());
                yapayZekaTahminDto.setSaat(odt.format(DateTimeFormatter.ofPattern("HH:00")));
                
                // Tahmin edilen sıcaklığı ata
                yapayZekaTahminDto.setSicaklik(aiTahmin.getYhat());
                
                // Mobil uygulamada ayırt edilebilmesi için özel bir durum kodu ata
                yapayZekaTahminDto.setDurumKodu(9999); 
                
                // TODO: AI tahmini için nem değeri de atanabilir. Şimdilik 0 bırakıyorum.
                yapayZekaTahminDto.setNem(0);

                // Bu yeni tahmini, mevcut saatlik tahmin listesinin sonuna ekliyoruz.
                cevapDto.getSaatlikTahmin().add(yapayZekaTahminDto);
            }
        }

        // --- 5. Adım: Sonucu mobil uygulamaya gönder ---
        // Hem Tomorrow.io verilerini hem de sonuna eklenmiş AI tahminlerini içeren
        // güncellenmiş cevap objesini geri dönüyoruz.
        return cevapDto;
    }
}