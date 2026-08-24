import { describe, expect, it } from "vitest";
import { parseMagia } from "@/lib/scraper/magia";

function todayStr(): string {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(
    t.getDate()
  ).padStart(2, "0")}`;
}

const apiResponse = JSON.stringify({
  stat: "ok",
  next_page: "",
  items: [
    {
      type: "event",
      id: 97524056,
      title: "EMOCIÓNATE A LA LUZ DE LAS VELAS en Los Monegros (Huesca)",
      date: `${todayStr()}T12:00:00+02:00`,
      endDate: "2099-11-27T12:00:00+01:00",
      allDay: 1,
      address: "Monegros HU AR",
      latitude: "41.8395961",
      longitude: "-0.3748354",
      summary: '¡"Emociónate" regresa con cinco espectáculos',
      content: '<div class="texte"><p>Contenido <b>completo</b></p></div>',
      thumbnail: "https://cmsphoto.ww-cdn.com/resizeapi/hash/314/196/",
      xLargeThumbnail: "https://cmsphoto.ww-cdn.com/resizeapi/hash/1200/-1/",
      originalThumbnail: "https://cmsphoto.ww-cdn.com/superstatic/1015514/art/grande/97524056-1.jpg",
      url: "https://web.huescalamagia.es/agenda/i/97524056/evento-n-8582",
    },
    {
      type: "event",
      id: 97122081,
      title: "Evento ya finalizado",
      date: "2026-06-01T12:00:00+02:00",
      endDate: "2026-06-30T12:00:00+02:00",
      allDay: 1,
      address: "Huesca HU AR",
      url: "https://web.huescalamagia.es/agenda/i/97122081/x",
    },
    {
      type: "event",
      id: 97430173,
      title: "Evento con hora concreta",
      date: "2099-09-10T21:30:00+02:00",
      endDate: null,
      allDay: 0,
      address: "Plaza de Navarra Huesca",
      summary: "",
      content: "<p>Entrada gratuita hasta completar aforo</p>",
      thumbnail: "https://cmsphoto.ww-cdn.com/resizeapi/hash2/314/196/",
      url: "https://web.huescalamagia.es/agenda/i/97430173/y",
    },
  ],
});

describe("parseMagia", () => {
  it("extrae los eventos del API de Huesca La Magia", () => {
    const events = parseMagia(apiResponse);
    expect(events).toHaveLength(2);
    const first = events[0];
    expect(first.title).toBe("EMOCIÓNATE A LA LUZ DE LAS VELAS en Los Monegros (Huesca)");
    expect(first.start_date).toBe(todayStr());
    expect(first.end_date).toBe("2099-11-27");
    expect(first.location).toBe("Monegros");
    expect(first.image).toBe("https://cmsphoto.ww-cdn.com/resizeapi/hash/1200/-1/");
    expect(first.latitude).toBe(41.8395961);
    expect(first.longitude).toBe(-0.3748354);
    expect(first.external_url).toBe(
      "https://web.huescalamagia.es/agenda/i/97524056/evento-n-8582"
    );
  });

  it("omite eventos finalizados y limpia la descripción HTML", () => {
    const events = parseMagia(apiResponse);
    expect(events.some((e) => e.title === "Evento ya finalizado")).toBe(false);

    const withTime = events.find((e) => e.title === "Evento con hora concreta");
    expect(withTime?.start_time).toBe("21:30");
    expect(withTime?.description).toBe("Entrada gratuita hasta completar aforo");
    expect(withTime?.location).toBe("Plaza de Navarra Huesca");
    expect(withTime?.latitude).toBeNull();
    expect(withTime?.longitude).toBeNull();
  });

  it("devuelve vacío con una respuesta inválida", () => {
    expect(parseMagia("<html>no es json</html>")).toEqual([]);
    expect(parseMagia(JSON.stringify({ items: null }))).toEqual([]);
  });
});
