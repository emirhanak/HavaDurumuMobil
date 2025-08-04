package com.havadurumu.backend.dto;

public class TahminCiktisi {
    private String ds;
    private double yhat;
    private double yhat_lower; // YENİ
    private double yhat_upper; // YENİ

    // Yeni alanlar için Getters ve Setters
    public String getDs() { return ds; }
    public void setDs(String ds) { this.ds = ds; }
    public double getYhat() { return yhat; }
    public void setYhat(double yhat) { this.yhat = yhat; }
    public double getYhat_lower() { return yhat_lower; }
    public void setYhat_lower(double yhat_lower) { this.yhat_lower = yhat_lower; }
    public double getYhat_upper() { return yhat_upper; }
    public void setYhat_upper(double yhat_upper) { this.yhat_upper = yhat_upper; }
}