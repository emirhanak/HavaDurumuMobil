package com.havadurumu.backend.dto;

public class GercekVeri {
    private String tarih;
    private double gerceklesen_sicaklik;
    private double nem;
    private int hava_kodu;

    // Constructor, Getters ve Setters
    public GercekVeri(String tarih, double gerceklesen_sicaklik, double nem, int hava_kodu) {
        this.tarih = tarih;
        this.gerceklesen_sicaklik = gerceklesen_sicaklik;
        this.nem = nem;
        this.hava_kodu = hava_kodu;
    }

    public String getTarih() { return tarih; }
    public void setTarih(String tarih) { this.tarih = tarih; }
    public double getGerceklesen_sicaklik() { return gerceklesen_sicaklik; }
    public void setGerceklesen_sicaklik(double gerceklesen_sicaklik) { this.gerceklesen_sicaklik = gerceklesen_sicaklik; }
    public double getNem() { return nem; }
    public void setNem(double nem) { this.nem = nem; }
    public int getHava_kodu() { return hava_kodu; }
    public void setHava_kodu(int hava_kodu) { this.hava_kodu = hava_kodu; }
}