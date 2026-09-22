import { describe, expect, it, vi, beforeEach } from "vitest";
import axios from "axios";
import {
  fetchRutaDelVinoAgenda,
  fetchRutaDelVinoRestaurants,
  fetchRutaDelVinoRoutes,
} from "@/lib/scraper/rutadelvino";

vi.mock("axios");

const mockedGet = vi.mocked(axios.get);

beforeEach(() => {
  mockedGet.mockReset();
});

function wpList(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 10,
    date: "2026-07-15T12:00:00",
    slug: "alma-bocaarte",
    link: "https://rutadelvinosomontano.com/establecimientos/alma-bocaarte/",
    title: { rendered: "Alma Boca&Arte" },
    ...overrides,
  };
}

const DETAIL_HTML = (body = "") => `
<html>
<head>
  <meta property="og:image" content="https://img/ruta-vino.jpg" />
</head>
<body>
  <nav>Menú</nav>
  <p>${body}</p>
  <footer>Ruta del Vino Somontano Asociación para la Promoción Turística del Somontano ...</footer>
</body>
</html>`;

describe("fetchRutaDelVinoRestaurants", () => {
  it("lista establecimientos y extrae municipio, teléfono y descripción del detalle", async () => {
    mockedGet
      .mockResolvedValueOnce({
        data: [wpList({ id: 1, slug: "alma-bocaarte", "municipio-establecimiento": [32] })],
        headers: {},
      } as never)
      .mockResolvedValueOnce({ data: [{ id: 32, name: "Barbastro" }], headers: {} } as never)
      .mockResolvedValueOnce({
        data: `<html><body><meta property="og:image" content="https://img/alma.jpg">Alma Boca&amp;Arte Barbastro 974051279 info@alma.es ALMA Boca+Arte crea un concepto donde COMPARTIR es la clave. Ruta del Vino Somontano Asociación para la Promoción Turística del Somontano ...</body></html>`,
      } as never);

    const restaurants = await fetchRutaDelVinoRestaurants();
    expect(restaurants).toHaveLength(1);
    const r = restaurants[0];
    expect(r.name).toBe("Alma Boca&Arte");
    expect(r.address).toBe("Barbastro");
    expect(r.phone).toBe("974051279");
    expect(r.email).toBe("info@alma.es");
    expect(r.description).toContain("ALMA Boca+Arte");
    expect(r.image).toBe("https://img/alma.jpg");
    expect(r.source).toBe("rutadelvino-restaurants");
    expect(r.source_url).toBe("https://rutadelvinosomontano.com/establecimientos/alma-bocaarte/");
    expect(r.slug).toBe("alma-boca-arte");
  });

  it("deja campos vacíos cuando el detalle no responde", async () => {
    mockedGet
      .mockResolvedValueOnce({
        data: [wpList({ id: 1, "municipio-establecimiento": [] })],
        headers: {},
      } as never)
      .mockResolvedValueOnce({ data: [], headers: {} } as never)
      .mockRejectedValueOnce(new Error("timeout"));

    const restaurants = await fetchRutaDelVinoRestaurants();
    expect(restaurants).toHaveLength(1);
    expect(restaurants[0].description).toBeNull();
    expect(restaurants[0].address).toBeNull();
  });
});

describe("fetchRutaDelVinoRoutes", () => {
  it("mapea experiencias como rutas gastronómicas", async () => {
    mockedGet
      .mockResolvedValueOnce({
        data: [
          wpList({
            id: 2,
            slug: "visita-maridaje-bodega-alodia",
            link: "https://rutadelvinosomontano.com/experiencias/visita-maridaje-bodega-alodia/",
            title: { rendered: "Visita y maridaje en Bodegas Alodia" },
          }),
        ],
        headers: {},
      } as never)
      .mockResolvedValueOnce({
        data: DETAIL_HTML("Visita guiada de 15 km. Dificultad media. Maridaje con vinos DOP Somontano. Más información: www.alodia.es"),
      } as never);

    const routes = await fetchRutaDelVinoRoutes();
    expect(routes).toHaveLength(1);
    expect(routes[0].route_type).toBe("gastronomica");
    expect(routes[0].distance_km).toBe(15);
    expect(routes[0].difficulty).toBe("media");
    expect(routes[0].external_url).toContain("visita-maridaje-bodega-alodia");
    expect(routes[0].slug).toBe("visita-y-maridaje-en-bodegas-alodia");
  });
});

describe("fetchRutaDelVinoAgenda", () => {
  it("extrae fecha, hora y precio del detalle", async () => {
    mockedGet
      .mockResolvedValueOnce({
        data: [
          wpList({
            id: 3,
            slug: "cata-mipanas",
            link: "https://rutadelvinosomontano.com/agenda/cata-mipanas/",
            title: { rendered: "Cata especial Mipanas" },
          }),
        ],
        headers: {},
      } as never)
      .mockResolvedValueOnce({
        data: DETAIL_HTML("01/08/2026 12:00 Cata especial 30 € 974051279 Cata de las 4 referencias."),
      } as never);

    const events = await fetchRutaDelVinoAgenda();
    expect(events).toHaveLength(1);
    expect(events[0].start_date).toBe("2026-08-01");
    expect(events[0].start_time).toBe("12:00");
    expect(events[0].price).toMatch(/30/);
    expect(events[0].description).toContain("Cata de las 4 referencias");
    expect(events[0].category).toBe("cultura");
  });

  it("omite eventos sin fecha en el detalle", async () => {
    mockedGet
      .mockResolvedValueOnce({
        data: [wpList({ id: 3, title: { rendered: "Evento sin fecha" } })],
        headers: {},
      } as never)
      .mockResolvedValueOnce({
        data: DETAIL_HTML("Un texto sin fecha concreta."),
      } as never);

    const events = await fetchRutaDelVinoAgenda();
    expect(events).toHaveLength(0);
  });
});