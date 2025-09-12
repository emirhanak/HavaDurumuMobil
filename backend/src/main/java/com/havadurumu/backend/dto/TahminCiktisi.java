package com.havadurumu.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TahminCiktisi {

     private String isoTime;           // "2025-08-18T12:00:00"
    private String saat;              // "12:00"
    private Double sicaklikTahmini;   // °C
    private Double nemTahmini;        // %

    public String getIsoTime() { return isoTime; }
    public void setIsoTime(String isoTime) { this.isoTime = isoTime; }

    public String getSaat() { return saat; }
    public void setSaat(String saat) { this.saat = saat; }

    public Double getSicaklikTahmini() { return sicaklikTahmini; }
    public void setSicaklikTahmini(Double v) { this.sicaklikTahmini = v; }

    public Double getNemTahmini() { return nemTahmini; }
    public void setNemTahmini(Double v) { this.nemTahmini = v; }

    private String ds;

    @JsonProperty("yhat_temp") // JSON'daki 'yhat_temp' alanını bu değişkene ata
    private double yhat_temp;
    
    @JsonProperty("yhat_nem") // JSON'daki 'yhat_nem' alanını bu değişkene ata
    private double yhat_nem;

    @JsonProperty("yhat_lower")
    private double yhat_lower;
    
    @JsonProperty("yhat_upper")
    private double yhat_upper;

    // --- Getters ve Setters ---
    public String getDs() { return ds; }
    public void setDs(String ds) { this.ds = ds; }
    public double getYhat_temp() { return yhat_temp; }
    public void setYhat_temp(double yhat_temp) { this.yhat_temp = yhat_temp; }
    public double getYhat_nem() { return yhat_nem; }
    public void setYhat_nem(double yhat_nem) { this.yhat_nem = yhat_nem; }
    public double getYhat_lower() { return yhat_lower; }
    public void setYhat_lower(double yhat_lower) { this.yhat_lower = yhat_lower; }
    public double getYhat_upper() { return yhat_upper; }
    public void setYhat_upper(double yhat_upper) { this.yhat_upper = yhat_upper; }
}