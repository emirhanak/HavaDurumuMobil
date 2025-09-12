package com.havadurumu.blend.dto;

import java.util.List;

public class BlendResponse {
  private int window_hours;
  private List<TimelineRow> timeline;
  public BlendResponse(){}
  public BlendResponse(int windowHours, List<TimelineRow> timeline){
    this.window_hours=windowHours; this.timeline=timeline;
  }
  public int getWindow_hours(){ return window_hours; }
  public void setWindow_hours(int v){ this.window_hours=v; }
  public List<TimelineRow> getTimeline(){ return timeline; }
  public void setTimeline(List<TimelineRow> v){ this.timeline=v; }
}
