package com.havadurumu.backend.dto;

public class SaatlikTahminDto {
    private String saat;        // "HH:00"
    private double sicaklik;
    private int durumKodu;
    private double nem;
    private String isoTime;     // İstanbul yerel tarih-saat, örn "2025-08-04T23:00:00"

    public String getSaat() {
        return saat;
    }

    public void setSaat(String saat) {
        this.saat = saat;
    }

    public double getSicaklik() {
        return sicaklik;
    }

    public void setSicaklik(double sicaklik) {
        this.sicaklik = sicaklik;
    }

    public int getDurumKodu() {
        return durumKodu;
    }

    public void setDurumKodu(int durumKodu) {
        this.durumKodu = durumKodu;
    }

    public double getNem() {
        return nem;
    }

    public void setNem(double nem) {
        this.nem = nem;
    }

    public String getIsoTime() {
        return isoTime;
    }

    public void setIsoTime(String isoTime) {
        this.isoTime = isoTime;
    }
}
