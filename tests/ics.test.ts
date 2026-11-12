import { describe, expect, it } from "vitest";
import { buildAgendaIcs, buildEventIcs, gcalEventUrl, gcalTimestamp, icsEscape } from "@/lib/ics";
import type { EventItem } from "@/lib/types";

const base: EventItem = {
  id: 1,
  slug: "concierto-jazz",
  title: "Concierto de Jazz, en directo",
  categoryId: null,
  startDate: "2026-10-05",
  endDate: null,
  startTime: "20:30",
  endTime: "22:00",
  location: "Palacio de Congresos, Huesca",
  address: null,
  price: null,
  description: "Jazz & blues. ¡No te lo pierdas!",
  image: null,
  externalUrl: null,
  source: "test",
  sourceUrl: null,
  featured: 0,
  status: "published",
  lat: null,
  lng: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("gcalTimestamp", () => {
  it("con hora genera timestamp con hora", () => {
    expect(gcalTimestamp("2026-10-05", "20:30")).toBe("20261005T203000");
  });

  it("sin hora genera solo fecha", () => {
    expect(gcalTimestamp("2026-10-05", null)).toBe("20261005");
  });
});

describe("icsEscape", () => {
  it("escapa comas, punto y coma y saltos de línea", () => {
    expect(icsEscape("a,b;c\nd")).toBe("a\\,b\\;c\\nd");
  });

  it("escapa barras invertidas", () => {
    expect(icsEscape("c:\\nova")).toBe("c:\\\\nova");
  });
});

describe("buildEventIcs", () => {
  it("incluye el UID, fecha, resumen, descripción y lugar", () => {
    const ics = buildEventIcs(base);
    const lines = ics.split("\r\n");
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("END:VCALENDAR");
    expect(lines).toContain("UID:concierto-jazz@huescahoy");
    expect(lines).toContain("DTSTART:20261005T203000");
    expect(lines).toContain("SUMMARY:Concierto de Jazz\\, en directo");
    expect(lines).toContain("DESCRIPTION:Jazz & blues. ¡No te lo pierdas!");
    expect(lines).toContain("LOCATION:Palacio de Congresos\\, Huesca");
  });

  it("evento de todo el día no usa hora", () => {
    const allDay: EventItem = { ...base, startTime: null, endTime: null };
    const lines = buildEventIcs(allDay).split("\r\n");
    expect(lines).toContain("DTSTART;VALUE=DATE:20261005");
  });
});

describe("buildAgendaIcs", () => {
  it("agrupa varios eventos en un calendario", () => {
    const second: EventItem = { ...base, id: 2, slug: "otro-evento", title: "Otro evento" };
    const ics = buildAgendaIcs([base, second]);
    expect(ics).toContain("UID:concierto-jazz@huescahoy");
    expect(ics).toContain("UID:otro-evento@huescahoy");
    expect(ics).toContain("X-WR-CALNAME:Agenda HuescaHoy");
    expect((ics.match(/BEGIN:VEVENT/g) ?? []).length).toBe(2);
  });
});

describe("gcalEventUrl", () => {
  it("construye la URL de Google Calendar", () => {
    const url = gcalEventUrl(base);
    expect(url).toContain("calendar.google.com/calendar/render");
    expect(url).toContain("action=TEMPLATE");
    expect(url).toContain("text=Concierto+de+Jazz%2C+en+directo");
    expect(url).toContain("dates=20261005T203000/20261005T220000");
  });
});