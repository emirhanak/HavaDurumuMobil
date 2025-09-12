package com.havadurumu.blend.client;

import com.havadurumu.blend.dto.TimelineRow; // kullanmayacağız ama paket hizası için dursun
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.ZonedDateTime;
import java.time.ZoneOffset;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

/**
 * Prophet/Python servisine bağlanır. Yoksa basit dummy üretir.
 */
@Component
public class ProphetClient {
  private final RestTemplate http;
  private final String baseUrl;

  public ProphetClient(RestTemplate http, @Value("${prophet.base-url:http://localhost:5001}") String baseUrl) {
    this.http = http;
    this.baseUrl = baseUrl;
  }

  public static class AiPoint {
    public String iso;
    public String label;
    public Double temp, rhum, pres, wind, rain;
  }

  public List<AiPoint> predict30h(double lat, double lon, String regMode) {
    try {
      String url = String.format("%s/predict?lat=%f&lon=%f&hours=30&reg_mode=%s", baseUrl, lat, lon, regMode);
      var arr = http.getForObject(url, AiPoint[].class);
      if (arr != null) return List.of(arr);
    } catch (Exception ignore) { /* prophet yoksa dummy üret */ }

    // DUMMY: prophet yoksa devreye girsin
    var out = new ArrayList<AiPoint>();
    var now = ZonedDateTime.now(ZoneOffset.UTC).withMinute(0).withSecond(0).withNano(0);
    for (int i = 0; i < 30; i++) {
      var t = now.plusHours(i);
      var p = new AiPoint();
      p.iso = t.toString();
      p.label = t.withZoneSameInstant(ZoneId.systemDefault()).toLocalTime().toString().substring(0,5);
      p.temp = 26.0 + i * 0.15;
      p.rhum = 58.0;
      p.pres = 1010.0;
      p.wind = 11.0;
      p.rain = 0.1;
      out.add(p);
    }
    return out;
  }
}
