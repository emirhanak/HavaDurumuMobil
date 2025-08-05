package com.havadurumu.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GirdiVerisi {
    @JsonProperty("ds")
    private String ds;

    @JsonProperty("nem")
    private double nem;

    @JsonProperty("hava_kodu")
    private int havaKodu;

    public GirdiVerisi() {}
    public GirdiVerisi(String ds, double nem, int havaKodu) {
        this.ds      = ds;
        this.nem     = nem;
        this.havaKodu= havaKodu;
    }
    public String getDs()             { return ds; }
    public void setDs(String ds)      { this.ds = ds; }
    public double getNem()            { return nem; }
    public void setNem(double nem)    { this.nem = nem; }
    public int getHavaKodu()          { return havaKodu; }
    public void setHavaKodu(int k)    { this.havaKodu = k; }
}
