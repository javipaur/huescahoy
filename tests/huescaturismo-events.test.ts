import { describe, expect, it, vi, beforeEach } from "vitest";
import axios from "axios";
import { fetchHuescaTurismoEvents } from "@/lib/scraper/huescaturismo-events";

vi.mock("axios");

const mockedGet = vi.mocked(axios.get);

beforeEach(() => {
  mockedGet.mockReset();
});

function wpEvent(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 10,
    date: "2027-03-05T18:00:00+01:00",
    title: { rendered: "Visita guiada a la Catedral" },
    content: {
      rendered: "<p>5 de marzo de 2027 a las 18:00 horas</p>",
    },
    excerpt: { rendered: "<p>Un paseo por la Catedral de Huesca</p>" },
    link: "https://www.huescaturismo.com/evento/visita-1",
    _embedded: {
      "wp:featuredmedia": [{ source_url: "https://img/catedral.jpg" }],
    },
    ...overrides,
  };
}

describe("fetchHuescaTurismoEvents", () => {
  it("mapea posts del API de turismo", async () => {
    mockedGet.mockResolvedValue({ data: [wpEvent()] } as never);

    const events = await fetchHuescaTurismoEvents();
    expect(events).toHaveLength(1);

    const event = events[0];
    expect(event.title).toBe("Visita guiada a la Catedral");
    expect(event.start_date).toBe("2027-03-05");
    expect(event.start_time).toBe("18:00");
    expect(event.location).toBeNull();
    expect(event.image).toBe("https://img/catedral.jpg");
    expect(event.external_url).toBe("https://www.huescaturismo.com/evento/visita-1");
    expect(event.description).not.toContain("<p>");
  });

  it("parsea fechas en texto en español sin ISO", async () => {
    mockedGet.mockResolvedValue({
      data: [wpEvent({ date: null, content: { rendered: "<p>14 de agosto de 2027 a las 12:30</p>" } })],
    } as never);

    const events = await fetchHuescaTurismoEvents();
    expect(events[0].start_date).toBe("2027-08-14");
    expect(events[0].start_time).toBe("12:30");
  });

  it("usa la fecha del post como respaldo", async () => {
    mockedGet.mockResolvedValue({
      data: [wpEvent({ content: { rendered: "<p>Sin fecha escrita</p>" } })],
    } as never);

    const events = await fetchHuescaTurismoEvents();
    expect(events[0].start_date).toBe("2027-03-05");
  });

  it("ignora eventos sin fecha extraíble", async () => {
    mockedGet.mockResolvedValue({
      data: [wpEvent({ date: null, content: { rendered: "<p>Fecha por confirmar</p>" } })],
    } as never);

    const events = await fetchHuescaTurismoEvents();
    expect(events).toEqual([]);
  });

  it("ignora posts sin título", async () => {
    mockedGet.mockResolvedValue({
      data: [wpEvent({ title: { rendered: "   " } }), wpEvent({ id: 11 })],
    } as never);

    const events = await fetchHuescaTurismoEvents();
    expect(events).toHaveLength(1);
  });

  it("combina la paginación hasta que la respuesta es corta", async () => {
    const fullPage = Array.from({ length: 100 }, (_, i) => wpEvent({ id: i + 1 }));
    mockedGet.mockResolvedValueOnce({ data: fullPage } as never);
    mockedGet.mockResolvedValueOnce({ data: [] } as never);

    const events = await fetchHuescaTurismoEvents();
    expect(events.length).toBe(100);
    expect(mockedGet.mock.calls).toHaveLength(2);
  });

  it("detiene la paginación ante un fallo de red", async () => {
    mockedGet.mockResolvedValueOnce({ data: [wpEvent()] } as never);
    mockedGet.mockRejectedValueOnce(new Error("network"));

    const events = await fetchHuescaTurismoEvents();
    expect(events).toHaveLength(1);
  });
});