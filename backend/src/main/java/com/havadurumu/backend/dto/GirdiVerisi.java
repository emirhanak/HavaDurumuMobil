package com.havadurumu.backend.dto;

public class GirdiVerisi {
    private String ds;
        private String saat;       // ISO-8601 ya da "HH:mm"

    private double sicaklik;
    private double nem;
    private int hava_kodu;

     public String getSaat() { return saat; }
    public void setSaat(String saat) { this.saat = saat; }

    public void setSicaklik(Double sicaklik) { this.sicaklik = sicaklik; }

    public void setNem(Double nem) { this.nem = nem; }

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