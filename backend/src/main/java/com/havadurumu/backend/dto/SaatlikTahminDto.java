package com.havadurumu.backend.dto;

public class SaatlikTahminDto {
    private String saat;
    private double sicaklik;
    private int durumKodu;
    private double nem;
    private String isoTime;

    // Karşılaştırma için AI tahmin alanları
    private Double aiSicaklikTahmini;
    private Double aiNemTahmini;

    // --- Getters ve Setters ---
    public String getSaat() { return saat; }
    public void setSaat(String saat) { this.saat = saat; }
    public double getSicaklik() { return sicaklik; }
    public void setSicaklik(double sicaklik) { this.sicaklik = sicaklik; }
    public int getDurumKodu() { return durumKodu; }
    public void setDurumKodu(int durumKodu) { this.durumKodu = durumKodu; }
    public double getNem() { return nem; }
    public void setNem(double nem) { this.nem = nem; }
    public String getIsoTime() { return isoTime; }
    public void setIsoTime(String isoTime) { this.isoTime = isoTime; }
    public Double getAiSicaklikTahmini() { return aiSicaklikTahmini; }
    public void setAiSicaklikTahmini(Double aiSicaklikTahmini) { this.aiSicaklikTahmini = aiSicaklikTahmini; }
    public Double getAiNemTahmini() { return aiNemTahmini; }
    public void setAiNemTahmini(Double aiNemTahmini) { this.aiNemTahmini = aiNemTahmini; }
}