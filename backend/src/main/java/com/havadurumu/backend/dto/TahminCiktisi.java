package com.havadurumu.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TahminCiktisi {
    @JsonProperty("ds")
    private String ds;

    @JsonProperty("yhat")
    private double yhat;

    @JsonProperty("yhat_lower")
    private double yhatLower;

    @JsonProperty("yhat_upper")
    private double yhatUpper;

    @JsonProperty("nem")
    private double nem;

    @JsonProperty("hava_kodu")
    private int havaKodu;

    public TahminCiktisi() {}

    public String getDs()               { return ds; }
    public void setDs(String ds)        { this.ds = ds; }

    public double getYhat()             { return yhat; }
    public void setYhat(double yhat)    { this.yhat = yhat; }

    public double getYhatLower()        { return yhatLower; }
    public void setYhatLower(double v)  { this.yhatLower = v; }

    public double getYhatUpper()        { return yhatUpper; }
    public void setYhatUpper(double v)  { this.yhatUpper = v; }

    public double getNem()              { return nem; }
    public void setNem(double nem)      { this.nem = nem; }

    public int getHavaKodu()            { return havaKodu; }
    public void setHavaKodu(int k)      { this.havaKodu = k; }
}
