package com.havadurumu.backend.dto;

public class GirdiVerisi {
    private String ds;
    private double sicaklik;
    private double nem;
    private int hava_kodu;

    public GirdiVerisi() {}

    public GirdiVerisi(String ds, double sicaklik, double nem, int hava_kodu) {
        this.ds = ds;
        this.sicaklik = sicaklik;
        this.nem = nem;
        this.hava_kodu = hava_kodu;
    }

    // Getters ve Setters...
    public String getDs() { return ds; }
    public void setDs(String ds) { this.ds = ds; }
    public double getSicaklik() { return sicaklik; }
    public void setSicaklik(double sicaklik) { this.sicaklik = sicaklik; }
    public double getNem() { return nem; }
    public void setNem(double nem) { this.nem = nem; }
    public int getHava_kodu() { return hava_kodu; }
    public void setHava_kodu(int hava_kodu) { this.hava_kodu = hava_kodu; }
}