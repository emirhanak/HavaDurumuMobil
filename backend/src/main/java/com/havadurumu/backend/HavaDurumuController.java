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

    private final HavaDurumuService          havaDurumuService;
    private final YapayZekaTahminService    yapayZekaTahminService;

    public HavaDurumuController(HavaDurumuService havaDurumuService,
                                YapayZekaTahminService yapayZekaTahminService) {
        this.havaDurumuService      = havaDurumuService;
        this.yapayZekaTahminService = yapayZekaTahminService;
    }

    @GetMapping("/api/weather")
    public HavaDurumuCevapDto getWeather(
            @RequestParam("lat") String lat,
            @RequestParam("lon") String lon
    ) throws Exception {
        // 1) Java-backend’ten 24h+6d al
        HavaDurumuCevapDto cevap = havaDurumuService.getWeather(lat, lon);
        if (cevap == null) return null;

        // 2) Saatlik: önce son 24 saati al
        List<SaatlikTahminDto> saatlik = cevap.getSaatlikTahmin();
        if (!saatlik.isEmpty()) {
            List<SaatlikTahminDto> last24 = saatlik.stream()
                .sorted(Comparator.comparing(SaatlikTahminDto::getIsoTime))
                .skip(Math.max(0, saatlik.size() - 24))
                .collect(Collectors.toList());

            // 3) Son 24h AI’ya yolla, +3h Prophet tahmini al
            List<GirdiVerisi> saatlikGirdi = last24.stream()
                .map(d -> new GirdiVerisi(d.getIsoTime(), d.getNem(), d.getDurumKodu()))
                .collect(Collectors.toList());
            List<TahminCiktisi> aiSaatlik = yapayZekaTahminService.getYapayZekaTahmini(saatlikGirdi);

            // 4) Gelen 3 saati orijinal lista’ya ekle
            for (TahminCiktisi t : aiSaatlik) {
                LocalDateTime ldt = LocalDateTime.parse(t.getDs());
                SaatlikTahminDto extra = new SaatlikTahminDto();
                extra.setSaat(ldt.format(DateTimeFormatter.ofPattern("HH:00")));
                extra.setIsoTime(t.getDs());
                extra.setSicaklik(t.getYhat());
                extra.setDurumKodu(9999);
                extra.setNem(0.0);
                cevap.getSaatlikTahmin().add(extra);
            }
        }

        // 5) Günlük: son eklenen saatlik veriden 1 tane al, AI’ya yolla, +3g Prophet tahmini al
        int idx = cevap.getSaatlikTahmin().size() - 1;
        SaatlikTahminDto sonSaat = cevap.getSaatlikTahmin().get(idx);
        GirdiVerisi gunlukGirdi = new GirdiVerisi(
            sonSaat.getIsoTime(),
            sonSaat.getNem(),
            sonSaat.getDurumKodu()
        );
        List<TahminCiktisi> aiGunluk =
            yapayZekaTahminService.getGunlukYapayZekaTahmini(Collections.singletonList(gunlukGirdi));

        // 6) Gelen 3 günlük tahmini cevap’a ekle
        if (aiGunluk != null) {
            for (TahminCiktisi t : aiGunluk) {
                LocalDateTime ldt = LocalDateTime.parse(t.getDs());
                GunlukTahminDto gd = new GunlukTahminDto();
                gd.setGun(ldt.getDayOfWeek()
                            .getDisplayName(TextStyle.FULL, new Locale("tr","TR")));
                gd.setEnDusuk( t.getYhatLower() );
                gd.setEnYuksek(t.getYhatUpper());
                gd.setDurumKodu(9999);
                cevap.getGunlukTahmin().add(gd);
            }
        }

        return cevap;
    }
}
