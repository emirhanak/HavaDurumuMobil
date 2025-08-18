package com.havadurumu.blend.controller;

import com.havadurumu.blend.dto.BlendResponse;
import com.havadurumu.blend.service.BlendService;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin
public class BlendController {
  private final BlendService service;
  public BlendController(BlendService service){ this.service = service; }

  @GetMapping("/blend")
  public BlendResponse blend(
      @RequestParam String city,
      @RequestParam double lat,
      @RequestParam double lon,
      @RequestParam(name="plus_hours", defaultValue="6") int plusHours,
      @RequestParam(name="reg_mode", defaultValue="auto") String regMode) {
    return service.buildBlend(city, lat, lon, plusHours, regMode);
  }
}
