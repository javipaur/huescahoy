import { describe, expect, it } from "vitest";
import { parseHuescaLaMagiaEvents } from "@/lib/scraper/huescalamagia-events";

function todayStr(): string {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(
    t.getDate()
  ).padStart(2, "0")}`;
}

describe("parseHuescaLaMagiaEvents", () => {
  it("mapea cada ítem a un ScrapeEvent", () => {
    const events = parseHuescaLaMagiaEvents({
      stat: "ok",
      items: [
        {
          id: 1,
          title: "  Concierto   en Huesca ",
          date: `${todayStr()}T21:30:00+02:00`,
          sortDate: `${todayStr()} 21:30`,
          allDay: 0,
          address: "  Teatro   Olimpia  ",
          summary: "<p>Un concierto</p>",
          xLargeThumbnail: "https://img/xlarge.jpg",
          url: "https://web.huescalamagia.es/agenda/i/1/x",
          latitude: "42.139",
          longitude: "-0.408",
        },
      ],
    });

    expect(events).toHaveLength(1);
    const event = events[0];
    expect(event.title).toBe("Concierto en Huesca");
    expect(event.start_date).toBe(todayStr());
    expect(event.start_time).toBe("21:30");
    expect(event.end_date).toBeNull();
    expect(event.end_time).toBeNull();
    expect(event.location).toBe("Teatro Olimpia");
    expect(event.description).toBe("Un concierto");
    expect(event.image).toBe("https://img/xlarge.jpg");
    expect(event.external_url).toBe("https://web.huescalamagia.es/agenda/i/1/x");
    expect(event.source_url).toBe("https://web.huescalamagia.es/agenda/i/1/x");
    expect(event.latitude).toBe(42.139);
    expect(event.longitude).toBe(-0.408);
  });

  it("da prioridad a sortDate sobre date y limpia el título", () => {
    const events = parseHuescaLaMagiaEvents({
      items: [
        {
          id: 2,
          title: "Ruta por Guara",
          date: "2099-01-01T10:00:00+01:00",
          sortDate: "2099-06-15 10:00",
        },
      ],
    });
    expect(events[0].start_date).toBe("2099-06-15");
  });

  it("trata eventos de todo el día sin hora", () => {
    const events = parseHuescaLaMagiaEvents({
      items: [
        {
          id: 3,
          title: "Fiesta",
          date: `2099-07-20T00:00:00+02:00`,
          allDay: 1,
        },
      ],
    });
    expect(events[0].start_time).toBeNull();
    expect(events[0].start_date).toBe("2099-07-20");
  });

  it("usa el id como source_url cuando no hay url", () => {
    const events = parseHuescaLaMagiaEvents({
      items: [{ id: 77, title: "Sin URL", date: "2099-08-01T12:00:00+02:00" }],
    });
    expect(events[0].source_url).toBe("huescalamagia-agenda:77");
  });

  it("omite ítems sin título o sin fecha", () => {
    const events = parseHuescaLaMagiaEvents({
      items: [
        { id: 1, date: "2099-01-01T10:00:00+01:00" },
        { id: 2, title: "Sin fecha" },
        { id: 3, title: "", date: "2099-01-02T10:00:00+01:00" },
      ],
    });
    expect(events).toEqual([]);
  });

  it("deja de lado eventos con coordenadas inválidas o cero", () => {
    const events = parseHuescaLaMagiaEvents({
      items: [
        {
          id: 4,
          title: "Con coords raras",
          date: "2099-02-01T10:00:00+01:00",
          latitude: "0",
          longitude: "abc",
        },
      ],
    });
    expect(events[0].latitude).toBeNull();
    expect(events[0].longitude).toBeNull();
  });

  it("devuelve un array vacío con respuesta inválida", () => {
    expect(parseHuescaLaMagiaEvents({})).toEqual([]);
    expect(
      parseHuescaLaMagiaEvents({ items: null } as unknown as {
        items: never[];
      })
    ).toEqual([]);
  });
});