import { describe, expect, it, vi, beforeEach } from "vitest";
import axios from "axios";
import { fetchDiputacionEvents } from "@/lib/scraper/diputacion-events";

vi.mock("axios");

const mockedGet = vi.mocked(axios.get);

function agendaHtml(): string {
  return `
    <html><body>
      <main>
        <h1>Agenda de la Diputación</h1>
        <h2>Concierto de la banda municipal</h2>
        <article>
          <h3>Exposición de pintura en el Palacio de Congresos</h3>
        </article>
        <a class="title" href="/exposicion-esculturas">Visita guiada a la escultura</a>
        <p>3 de abril a las 19:30 en el salón de actos de la Diputación.
           La exposición abre en la sala de exposiciones del centro cultural.</p>
        <p>7 de junio a las 12:00 en el museo de Huesca.</p>
      </main>
    </body></html>
  `;
}

function futureMonth(offset: number): number {
  const now = new Date();
  let m = now.getMonth() + 1 + offset;
  if (m > 12) m -= 12;
  return m;
}

describe("fetchDiputacionEvents", () => {
  it("extrae eventos del HTML de la agenda", async () => {
    mockedGet.mockResolvedValue({ data: agendaHtml() } as never);

    const events = await fetchDiputacionEvents();
    expect(events.length).toBeGreaterThan(0);

    const concert = events.find((e) => e.title === "Concierto de la banda municipal");
    expect(concert).toBeDefined();
    expect(concert!.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(concert!.location).toBeTruthy();
    expect(events.some((e) => e.source_url?.includes("dphuesca.es"))).toBe(true);
  });

  it("asigna fechas futuras en español", async () => {
    const months = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
    ];
    const futureDate = `${futureMonth(1)} de ${months[futureMonth(1) - 1]} a las 20:00`;
    const html = `
      <html><body><main>
        <h2>Obra de teatro</h2>
        <p>${futureDate} en el teatro Olimpia</p>
      </main></body></html>
    `;
    mockedGet.mockResolvedValue({ data: html } as never);

    const events = await fetchDiputacionEvents();
    expect(events).toHaveLength(1);
    expect(events[0].start_time).toBe("20:00");
    expect(/^\d{4}-\d{2}-\d{2}$/.test(events[0].start_date)).toBe(true);
  });

  it("devuelve vacío si el HTML no tiene contenido", async () => {
    mockedGet.mockResolvedValue({ data: "<html><body></body></html>" } as never);
    const events = await fetchDiputacionEvents();
    expect(events).toEqual([]);
  });

  it("deduplica por título y limita a 12 eventos", async () => {
    const many = Array.from(
      { length: 25 },
      (_, i) => `<h2>Evento repetido ${i % 3}</h2>`
    ).join("");
    mockedGet.mockResolvedValue({
      data: `<html><body><main>${many}<p>10 de marzo de 2099 a las 10:00</p></main></body></html>`,
    } as never);

    const events = await fetchDiputacionEvents();
    expect(new Set(events.map((e) => e.title)).size).toBe(events.length);
    expect(events.length).toBeLessThanOrEqual(12);
  });

  it("pone la fecha en el año siguiente si el mes ya pasó", async () => {
    const now = new Date();
    const html = `
      <html><body><main>
        <h2>Entrega de premios</h2>
        <p>10 de enero a las 19:00 en el palacio de congresos</p>
      </main></body></html>
    `;
    mockedGet.mockResolvedValue({ data: html } as never);

    const events = await fetchDiputacionEvents();
    expect(events).toHaveLength(1);

    const startYear = Number(events[0].start_date.slice(0, 4));
    const expectedYear = now.getMonth() >= 1
      ? now.getFullYear() + 1
      : now.getFullYear();
    expect(startYear).toBe(expectedYear);
  });
});