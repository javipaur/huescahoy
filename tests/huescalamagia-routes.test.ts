import { describe, expect, it, vi, beforeEach } from "vitest";
import axios from "axios";
import { fetchHuescaLaMagiaRoutes } from "@/lib/scraper/huescalamagia-routes";

vi.mock("axios");

const mockedGet = vi.mocked(axios.get);

beforeEach(() => {
  mockedGet.mockReset();
});

function magiaItem(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 200,
    title: "Ruta por la Sierra de Guara",
    summary: "Un paseo entre barrancos",
    content: "<p>Caminando por el cañón</p>",
    url: "https://web.huescalamagia.es/ruta/200",
    latitude: "42.30",
    longitude: "-0.07",
    subsections: { rutas: ["senderismo"] },
    images: [{ url: "https://img/ruta.jpg" }],
    ...overrides,
  };
}

describe("fetchHuescaLaMagiaRoutes", () => {
  it("scrapea las tres secciones de rutas", async () => {
    mockedGet
      .mockResolvedValueOnce({
        data: { items: [magiaItem({ id: 1, subsections: { rutas: ["senderismo"] } })], next_page: null },
      } as never)
      .mockResolvedValueOnce({
        data: { items: [magiaItem({ id: 2, subsections: { rutas: ["excursión"] } })], next_page: null },
      } as never)
      .mockResolvedValueOnce({
        data: { items: [magiaItem({ id: 3, subsections: { rutas: ["en familia"] } })], next_page: null },
      } as never);

    const routes = await fetchHuescaLaMagiaRoutes();
    expect(routes).toHaveLength(3);
    expect(routes[0].source).toBe("huescalamagia-rutas");
    expect(routes[1].source).toBe("huescalamagia-excursiones");
    expect(routes[2].source).toBe("huescalamagia-imprescindibles");
  });

  it("mapea la ruta y deduce el tipo desde subsections", async () => {
    mockedGet.mockResolvedValue({
      data: {
        items: [magiaItem({ subsections: { rutas: ["Camino de Santiago"] } })],
        next_page: null,
      },
    } as never);

    const routes = await fetchHuescaLaMagiaRoutes();
    const r = routes[0];
    expect(r.title).toBe("Ruta por la Sierra de Guara");
    expect(r.route_type).toBe("camino_santiago");
    expect(r.slug).toMatch(/^ruta-por-la-sierra-de-guara-/);
    expect(r.description).toBe("Caminando por el cañón");
    expect(r.summary).toBe("Un paseo entre barrancos");
    expect(r.image).toBe("https://img/ruta.jpg");
    expect(r.lat).toBe(42.3);
    expect(r.lng).toBe(-0.07);
    expect(r.external_url).toBe("https://web.huescalamagia.es/ruta/200");
    expect(r.status).toBe("published");
  });

  it("aplica el tipo por defecto cuando no hay coincidencia", async () => {
    mockedGet.mockResolvedValue({
      data: { items: [magiaItem({ subsections: { rutas: ["otras cosas"] } })], next_page: null },
    } as never);

    const routes = await fetchHuescaLaMagiaRoutes();
    expect(routes[0].route_type).toBe("cultural");
  });

  it("deduce bici, gastronómica y natural desde el título", async () => {
    const cases: Array<[string, string]> = [
      ["Ruta en BTT por el Pirineo", "bici"],
      ["Ruta gastronómica por Somontano", "gastronomica"],
      ["Ruta por la naturaleza en Guara", "naturales"],
    ];
    for (const [title, expected] of cases) {
      mockedGet.mockResolvedValue({
        data: { items: [magiaItem({ id: 1, title, subsections: {} })], next_page: null },
      } as never);
      const routes = await fetchHuescaLaMagiaRoutes();
      expect(routes[0].route_type, `"${title}" → "${expected}"`).toBe(expected);
    }
  });

  it("usa el id en el slug y source_url cuando no hay URL", async () => {
    mockedGet.mockResolvedValue({
      data: { items: [magiaItem({ url: null, subsections: {} })], next_page: null },
    } as never);

    const routes = await fetchHuescaLaMagiaRoutes();
    expect(routes[0].slug).toContain("200");
    expect(routes[0].source_url).toBe("huescalamagia:200");
  });

  it("ignora ítems sin título", async () => {
    mockedGet
      .mockResolvedValueOnce({
        data: { items: [magiaItem({ title: "" }), magiaItem({ id: 201 })], next_page: null },
      } as never)
      .mockResolvedValueOnce({ data: { items: [], next_page: null } } as never)
      .mockResolvedValueOnce({ data: { items: [], next_page: null } } as never);

    const routes = await fetchHuescaLaMagiaRoutes();
    expect(routes).toHaveLength(1);
    expect(routes[0].slug).toMatch(/201$/);
  });

  it("sigue next_page dentro de cada sección", async () => {
    mockedGet
      .mockResolvedValueOnce({ data: { items: [magiaItem({ id: 1 })], next_page: 2 } } as never)
      .mockResolvedValueOnce({ data: { items: [magiaItem({ id: 2 })], next_page: null } } as never)
      .mockResolvedValueOnce({ data: { items: [magiaItem({ id: 3 })], next_page: null } } as never)
      .mockResolvedValueOnce({ data: { items: [magiaItem({ id: 4 })], next_page: null } } as never);

    const routes = await fetchHuescaLaMagiaRoutes();
    expect(routes).toHaveLength(4);
    expect(mockedGet.mock.calls).toHaveLength(4);
  });
});