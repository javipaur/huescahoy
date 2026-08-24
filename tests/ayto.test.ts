import { describe, expect, it } from "vitest";
import { parseAytoHuesca } from "@/lib/scraper/ayto";

const html = `<!DOCTYPE html>
<html><body>
<div class="template template-abstract-cards-portada">
  <div class="row">
    <div class="col-12 col-sm-6 col-lg-6">
      <div class="card h-auto" style="border-bottom: 4px solid #ededed;">
        <a class="card-image aspect-ratio-bg-cover d-block" title="III Carrera Sertoriana"
           style="background-image: url('/o/adaptive-media/image/4641729/3/0baee7cb.jpg')"
           href="/w/iii-carrera-sertoriana?redirect=%2Fla-ciudad%2Fagenda">
          <img class="sr-only" alt="Imagen III Carrera Sertoriana"
               src="/c/document_library/get_file?uuid=38e2919a-ccba-38a2-90ee-4f9956695b69&groupId=20126">
        </a>
        <div class="card-body position-relative">
          <a class="card-title d-block font-weight-bold font-size-12"
             href="/w/iii-carrera-sertoriana?redirect=%2Fla-ciudad%2Fagenda">III Carrera Sertoriana</a>
          <div class="card-text text-dark d-block font-size-08"><span class="fas fa-calendar-alt"></span><span>20/09/2026</span></div>
          <div class="card-text text-dark d-block font-size-08"><span class="fas fa-map-marker-alt"></span><span>Acuartelamiento Sancho Ramírez</span></div>
          <div class="card-text text-dark d-block font-size-08"><span class="fas fa-clock"></span><span>9:00</span></div>
        </div>
      </div>
    </div>
    <div class="col-12 col-sm-6 col-lg-6">
      <div class="card h-auto">
        <div class="card-body position-relative">
          <a class="card-title d-block font-weight-bold" href="/w/sin-fecha">Evento sin fecha</a>
          <div class="card-text text-dark d-block font-size-08"><span class="fas fa-calendar-alt"></span><span></span></div>
        </div>
      </div>
    </div>
  </div>
</div>
</body></html>`;

describe("parseAytoHuesca", () => {
  it("extrae título, fecha ISO, lugar, hora, imagen y enlace", () => {
    const events = parseAytoHuesca(html, "https://www.huesca.es/la-ciudad/agenda");
    expect(events).toHaveLength(1);

    const event = events[0];
    expect(event.title).toBe("III Carrera Sertoriana");
    expect(event.start_date).toBe("2026-09-20");
    expect(event.location).toBe("Acuartelamiento Sancho Ramírez");
    expect(event.start_time).toBe("09:00");
    expect(event.image).toBe(
      "https://www.huesca.es/o/adaptive-media/image/4641729/3/0baee7cb.jpg"
    );
    expect(event.source_url).toBe("https://www.huesca.es/w/iii-carrera-sertoriana");
    expect(event.external_url).toBe(event.source_url);
  });

  it("omite tarjetas sin fecha válida", () => {
    const empty = parseAytoHuesca("<html><body><p>nada</p></body></html>", "https://www.huesca.es");
    expect(empty).toEqual([]);
  });
});
