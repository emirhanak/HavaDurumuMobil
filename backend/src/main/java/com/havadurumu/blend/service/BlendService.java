package com.havadurumu.blend.service;


import com.havadurumu.backend.HavaDurumuService;
import com.havadurumu.backend.dto.SaatlikTahminDto;
import com.havadurumu.backend.service.YapayZekaTahminService;
import com.havadurumu.backend.dto.GirdiVerisi;
import com.havadurumu.backend.dto.TahminCiktisi;

import com.havadurumu.blend.dto.BlendResponse;
import com.havadurumu.blend.dto.TimelineRow;
import com.havadurumu.blend.dto.Triple;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BlendService {

  private final HavaDurumuService hava;
  private final YapayZekaTahminService yzt;

  public BlendService(HavaDurumuService hava, YapayZekaTahminService yzt) {
    this.hava = hava; this.yzt = yzt;
  }

  public BlendResponse buildBlend(String city, double lat, double lon, int plusHours, String regMode) {
    List<SaatlikTahminDto> api24 = hava.getSaatlik24(lat, lon);

    List<GirdiVerisi> inputs = api24.stream().map(h -> {
      GirdiVerisi g = new GirdiVerisi();
      g.setSaat(h.getIsoTime());
      g.setSicaklik(h.getSicaklik());
      g.setNem(h.getNem());
      return g;
    }).collect(Collectors.toList());

    List<TahminCiktisi> preds = List.of();
    try { preds = yzt.getYapayZekaTahmini(inputs); }
    catch(Exception ex){ System.err.println("AI servis hatası: " + ex.getMessage()); }

    var rows = new ArrayList<TimelineRow>();
    for (int i = 0; i < 30; i++) {
      SaatlikTahminDto api = (i < api24.size()) ? api24.get(i) : null;
      TahminCiktisi ai    = (i >= 24 && (i - 24) < preds.size()) ? preds.get(i - 24) : null;

      String iso  = api != null ? api.getIsoTime() : (ai != null ? ai.getIsoTime() : "");
      String saat = api != null ? api.getSaat()    : (ai != null ? ai.getSaat()    : "");

      Double apiTemp = api != null ? api.getSicaklik() : null;
      Double aiTemp  = (i < 24) ? apiTemp : (ai != null ? ai.getSicaklikTahmini() : null);

      Double apiRhum = api != null ? api.getNem() : null;
      Double aiRhum  = (i < 24) ? apiRhum : (ai != null ? ai.getNemTahmini() : null);

      rows.add(new TimelineRow(
        iso, saat,
        new Triple(apiTemp, aiTemp, diff(aiTemp, apiTemp)),
        new Triple(apiRhum, aiRhum, diff(aiRhum, apiRhum)),
        new Triple(null, null, null),
        new Triple(null, null, null),
        new Triple(null, null, null)
      ));
    }
    return new BlendResponse(30, rows);
  }

  private Double diff(Double ai, Double api) {
    return (ai != null && api != null) ? (ai - api) : null;
  }
}
