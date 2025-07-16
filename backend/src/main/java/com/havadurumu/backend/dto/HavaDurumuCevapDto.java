package com.havadurumu.backend.dto;

import java.util.List;

public class HavaDurumuCevapDto {
    // 'sehirAdi' alanını ve onun getter/setter'ını tamamen siliyoruz
    private AnlikHavaDurumuDto anlikHavaDurumu;
    private List<SaatlikTahminDto> saatlikTahmin;
    private List<GunlukTahminDto> gunlukTahmin;

    // Getters and Setters
    public AnlikHavaDurumuDto getAnlikHavaDurumu() { return anlikHavaDurumu; }
    public void setAnlikHavaDurumu(AnlikHavaDurumuDto anlikHavaDurumu) { this.anlikHavaDurumu = anlikHavaDurumu; }

    public List<SaatlikTahminDto> getSaatlikTahmin() { return saatlikTahmin; }
    public void setSaatlikTahmin(List<SaatlikTahminDto> saatlikTahmin) { this.saatlikTahmin = saatlikTahmin; }

    public List<GunlukTahminDto> getGunlukTahmin() { return gunlukTahmin; }
    public void setGunlukTahmin(List<GunlukTahminDto> gunlukTahmin) { this.gunlukTahmin = gunlukTahmin; }
}