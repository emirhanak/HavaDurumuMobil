package com.havadurumu.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GirdiVerisi {
    @JsonProperty("ds")
    private String ds;

    @JsonProperty("nem")
    private double nem;

    // Python GirdiVerisi modeli `hava_kodu` bekliyor:
    @JsonProperty("hava_kodu")
    private int durumKodu;

    public GirdiVerisi() { }

    public GirdiVerisi(String ds, double nem, int durumKodu) {
        this.ds = ds;
        this.nem = nem;
        this.durumKodu = durumKodu;
    }

    public String getDs() { return ds; }
    public void setDs(String ds) { this.ds = ds; }

    public double getNem() { return nem; }
    public void setNem(double nem) { this.nem = nem; }

    // JSON’da `hava_kodu` olarak çıkacak:
    public int getDurumKodu() { return durumKodu; }
    public void setDurumKodu(int durumKodu) { this.durumKodu = durumKodu; }
}
