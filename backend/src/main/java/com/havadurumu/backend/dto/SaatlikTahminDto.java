package com.havadurumu.backend.dto;

public class SaatlikTahminDto {
    private String saat;
    private double sicaklik;
    private int durumKodu;
    private double nem; // YENİ EKLENEN ALAN


    // Getters and Setters
    public String getSaat() { return saat; }
    public void setSaat(String saat) { this.saat = saat; }
    public double getSicaklik() { return sicaklik; }
    public void setSicaklik(double sicaklik) { this.sicaklik = sicaklik; }
    public int getDurumKodu() { return durumKodu; }
    public void setDurumKodu(int durumKodu) { this.durumKodu = durumKodu; }

     // YENİ EKLENEN METOTLAR
    public double getNem() { return nem; }
    public void setNem(double nem) { this.nem = nem; }
}