package com.havadurumu.backend.dto;

import java.util.List; // List import'unu ekleyin

public class HavaDurumuCevapDto {
    private String sehirAdi;
    private AnlikHavaDurumuDto anlikHavaDurumu;
    private List<SaatlikTahminDto> saatlikTahmin; // YENİ
    private List<GunlukTahminDto> gunlukTahmin;   // YENİ

    // Yeni alanlar için Getters and Setters ekleyin...
    public String getSehirAdi() { return sehirAdi; }
    public void setSehirAdi(String sehirAdi) { this.sehirAdi = sehirAdi; }
    public AnlikHavaDurumuDto getAnlikHavaDurumu() { return anlikHavaDurumu; }
    public void setAnlikHavaDurumu(AnlikHavaDurumuDto anlikHavaDurumu) { this.anlikHavaDurumu = anlikHavaDurumu; }
    public List<SaatlikTahminDto> getSaatlikTahmin() { return saatlikTahmin; }
    public void setSaatlikTahmin(List<SaatlikTahminDto> saatlikTahmin) { this.saatlikTahmin = saatlikTahmin; }
    public List<GunlukTahminDto> getGunlukTahmin() { return gunlukTahmin; }
    public void setGunlukTahmin(List<GunlukTahminDto> gunlukTahmin) { this.gunlukTahmin = gunlukTahmin; }
}