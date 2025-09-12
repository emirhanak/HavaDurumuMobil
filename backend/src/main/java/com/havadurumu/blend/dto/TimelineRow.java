package com.havadurumu.blend.dto;

public class TimelineRow {
  private String isoTime;
  private String saat;
  private Triple temp;
  private Triple rhum;
  private Triple pres;
  private Triple wind;
  private Triple rain;

  public TimelineRow() {}
  public TimelineRow(String isoTime, String saat, Triple temp, Triple rhum, Triple pres, Triple wind, Triple rain){
    this.isoTime=isoTime; this.saat=saat; this.temp=temp; this.rhum=rhum; this.pres=pres; this.wind=wind; this.rain=rain;
  }
  public String getIsoTime(){ return isoTime; }
  public void setIsoTime(String v){ this.isoTime=v; }
  public String getSaat(){ return saat; }
  public void setSaat(String v){ this.saat=v; }
  public Triple getTemp(){ return temp; }
  public void setTemp(Triple v){ this.temp=v; }
  public Triple getRhum(){ return rhum; }
  public void setRhum(Triple v){ this.rhum=v; }
  public Triple getPres(){ return pres; }
  public void setPres(Triple v){ this.pres=v; }
  public Triple getWind(){ return wind; }
  public void setWind(Triple v){ this.wind=v; }
  public Triple getRain(){ return rain; }
  public void setRain(Triple v){ this.rain=v; }
}
