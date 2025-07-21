package com.havadurumu.backend.dto;

public class AnlikHavaDurumuDto {
    private double sicaklik;
    private String durum;
    private double enYuksek;
    private double enDusuk;
    private double hissedilen;
    private double nem;
    private double ruzgarHizi;
    private double gorusMesafesi;
    private double basinc;
    private int durumKodu; // EKLENDİ

    // Tüm alanlar için Getters ve Setters
    public double getSicaklik() { return sicaklik; }
    public void setSicaklik(double sicaklik) { this.sicaklik = sicaklik; }
    public String getDurum() { return durum; }
    public void setDurum(String durum) { this.durum = durum; }
    public double getEnYuksek() { return enYuksek; }
    public void setEnYuksek(double enYuksek) { this.enYuksek = enYuksek; }
    public double getEnDusuk() { return enDusuk; }
    public void setEnDusuk(double enDusuk) { this.enDusuk = enDusuk; }
    public double getHissedilen() { return hissedilen; }
    public void setHissedilen(double hissedilen) { this.hissedilen = hissedilen; }
    public double getNem() { return nem; }
    public void setNem(double nem) { this.nem = nem; }
    public double getRuzgarHizi() { return ruzgarHizi; }
    public void setRuzgarHizi(double ruzgarHizi) { this.ruzgarHizi = ruzgarHizi; }
    public double getGorusMesafesi() { return gorusMesafesi; }
    public void setGorusMesafesi(double gorusMesafesi) { this.gorusMesafesi = gorusMesafesi; }
    public double getBasinc() { return basinc; }
    public void setBasinc(double basinc) { this.basinc = basinc; }
    public int getDurumKodu() { return durumKodu; }
    public void setDurumKodu(int durumKodu) { this.durumKodu = durumKodu; }
}