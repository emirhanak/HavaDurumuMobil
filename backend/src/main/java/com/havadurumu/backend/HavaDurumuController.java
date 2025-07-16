package com.havadurumu.backend;

import com.havadurumu.backend.dto.HavaDurumuCevapDto; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HavaDurumuController {

    @Autowired
    private HavaDurumuService havaDurumuService;

    @GetMapping("/api/weather")
    // Metodun geri dönüş tipini 'Object' yerine daha spesifik olan 'HavaDurumuCevapDto' yapıyoruz
    public HavaDurumuCevapDto getWeather(
            @RequestParam("lat") String lat,
            @RequestParam("lon") String lon) {
        
        return havaDurumuService.getWeather(lat, lon);
    }
}