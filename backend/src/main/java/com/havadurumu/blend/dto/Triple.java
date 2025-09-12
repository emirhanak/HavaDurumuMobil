package com.havadurumu.blend.dto;

public class Triple {
  private Double api;
  private Double ai;
  private Double delta;
  public Triple() {}
  public Triple(Double api, Double ai, Double delta){ this.api=api; this.ai=ai; this.delta=delta; }
  public Double getApi(){ return api; }
  public void setApi(Double v){ this.api=v; }
  public Double getAi(){ return ai; }
  public void setAi(Double v){ this.ai=v; }
  public Double getDelta(){ return delta; }
  public void setDelta(Double v){ this.delta=v; }
}
