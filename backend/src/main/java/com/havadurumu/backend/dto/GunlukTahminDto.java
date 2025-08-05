package com.havadurumu.backend.dto;

public class GunlukTahminDto {
    private String gun;
    private double enDusuk;
    private double enYuksek;
    private int durumKodu;

    public GunlukTahminDto() {
    }

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
        return "GunlukTahminDto{" +
                "gun='" + gun + '\'' +
                ", enDusuk=" + enDusuk +
                ", enYuksek=" + enYuksek +
                ", durumKodu=" + durumKodu +
                '}';
    }
}
