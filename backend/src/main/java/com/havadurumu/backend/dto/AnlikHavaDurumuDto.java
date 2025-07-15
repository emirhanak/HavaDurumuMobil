package com.havadurumu.backend.dto;

public class AnlikHavaDurumuDto {
    private double sicaklik;
    private String durum;
    private double enYuksek;
    private double enDusuk;

    // Getters and Setters
    public double getSicaklik() { return sicaklik; }
    public void setSicaklik(double sicaklik) { this.sicaklik = sicaklik; }
    public String getDurum() { return durum; }
    public void setDurum(String durum) { this.durum = durum; }
    public double getEnYuksek() { return enYuksek; }
    public void setEnYuksek(double enYuksek) { this.enYuksek = enYuksek; }
    public double getEnDusuk() { return enDusuk; }
    public void setEnDusuk(double enDusuk) { this.enDusuk = enDusuk; }
}