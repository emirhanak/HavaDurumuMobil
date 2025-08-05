// Dosya: src/main/java/com/havadurumu/backend/dto/ProphetGunlukTahminDto.java
package com.havadurumu.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ProphetGunlukTahminDto {
    
    @JsonProperty("gun")
    private String gun;
    
    @JsonProperty("enDusuk")
    private double enDusuk;
    
    @JsonProperty("enYuksek")
    private double enYuksek;
    
    @JsonProperty("durumKodu")
    private int durumKodu;

    // Default constructor
    public ProphetGunlukTahminDto() {
    }

    // Constructor with parameters
    public ProphetGunlukTahminDto(String gun, double enDusuk, double enYuksek, int durumKodu) {
        this.gun = gun;
        this.enDusuk = enDusuk;
        this.enYuksek = enYuksek;
        this.durumKodu = durumKodu;
    }

    // Getters and Setters
    public String getGun() {
        return gun;
    }

    public void setGun(String gun) {
        this.gun = gun;
    }

    public double getEnDusuk() {
        return enDusuk;
    }

    public void setEnDusuk(double enDusuk) {
        this.enDusuk = enDusuk;
    }

    public double getEnYuksek() {
        return enYuksek;
    }

    public void setEnYuksek(double enYuksek) {
        this.enYuksek = enYuksek;
    }

    public int getDurumKodu() {
        return durumKodu;
    }

    public void setDurumKodu(int durumKodu) {
        this.durumKodu = durumKodu;
    }

    @Override
    public String toString() {
        return "ProphetGunlukTahminDto{" +
                "gun='" + gun + '\'' +
                ", enDusuk=" + enDusuk +
                ", enYuksek=" + enYuksek +
                ", durumKodu=" + durumKodu +
                '}';
    }
}