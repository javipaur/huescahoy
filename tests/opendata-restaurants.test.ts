import { describe, expect, it, vi, beforeEach } from "vitest";
import axios from "axios";
import { fetchOpenDataRestaurants } from "@/lib/scraper/opendata-restaurants";

vi.mock("axios");

const mockedGet = vi.mocked(axios.get);

beforeEach(() => {
  mockedGet.mockReset();
});

function ckanResponse() {
  return {
    data: {
      result: {
        resources: [
          { id: "a", format: "JSON", url: "https://opendata.aragon.es/data/restaurantes.json" },
          { id: "b", format: "CSV", url: "https://opendata.aragon.es/data/restaurantes.csv" },
        ],
      },
    },
  };
}

function row(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    nombre: "Restaurante La Huesca",
    municipio: "huesca",
    comarca: "hoya de huesca",
    direccion: "Calle Zaragoza 1, 22001 Huesca",
    telefono: "974111111",
    categoria: "restaurante",
    web: "https://restaurantehuesca.es",
    ...overrides,
  };
}

describe("fetchOpenDataRestaurants", () => {
  it("obtiene la URL de datos y mapea filas de Huesca", async () => {
    mockedGet.mockResolvedValueOnce(ckanResponse() as never);
    mockedGet.mockResolvedValueOnce({ data: [row()] } as never);

    const restaurants = await fetchOpenDataRestaurants();
    expect(restaurants).toHaveLength(1);

    const r = restaurants[0];
    expect(r.name).toBe("Restaurante La Huesca");
    expect(r.slug).toMatch(/^restaurante-la-huesca-/);
    expect(r.cuisine_type).toBe("Restaurante");
    expect(r.address).toBe("Calle Zaragoza 1, 22001 Huesca");
    expect(r.phone).toBe("974111111");
    expect(r.website).toBe("https://restaurantehuesca.es");
    expect(r.source).toBe("opendata-aragon");
    expect(r.status).toBe("published");
  });

  it("mapea tipo caf a Bar / Cafetería", async () => {
    mockedGet.mockResolvedValueOnce(ckanResponse() as never);
    mockedGet.mockResolvedValueOnce({ data: [row({ categoria: "cafetería" })] } as never);

    const restaurants = await fetchOpenDataRestaurants();
    expect(restaurants[0].cuisine_type).toBe("Bar / Cafetería");
  });

  it("reconoce la comarca como marca de Huesca aunque el municipio no lo diga", async () => {
    mockedGet.mockResolvedValueOnce(ckanResponse() as never);
    mockedGet.mockResolvedValueOnce({ data: [row({ municipio: "otro", comarca: "somontano de barbastro" })] } as never);

    const restaurants = await fetchOpenDataRestaurants();
    expect(restaurants).toHaveLength(1);
  });

  it("filtra filas fuera de Huesca", async () => {
    mockedGet.mockResolvedValueOnce(ckanResponse() as never);
    mockedGet.mockResolvedValueOnce({
      data: [row({ municipio: "zaragoza", comarca: "zaragoza" })],
    } as never);

    const restaurants = await fetchOpenDataRestaurants();
    expect(restaurants).toEqual([]);
  });

  it("soporta respuestas anidadas en data o results", async () => {
    mockedGet.mockResolvedValueOnce(ckanResponse() as never);
    mockedGet.mockResolvedValueOnce({ data: { data: [row()] } } as never);
    const a = await fetchOpenDataRestaurants();
    expect(a).toHaveLength(1);

    mockedGet.mockReset();
    mockedGet.mockResolvedValueOnce(ckanResponse() as never);
    mockedGet.mockResolvedValueOnce({ data: { results: [row()] } } as never);
    const b = await fetchOpenDataRestaurants();
    expect(b).toHaveLength(1);
  });

  it("devuelve vacío sin URL de datos y omite filas sin nombre", async () => {
    mockedGet.mockResolvedValueOnce({ data: { result: { resources: [] } } } as never);
    expect(await fetchOpenDataRestaurants()).toEqual([]);

    mockedGet.mockReset();
    mockedGet.mockResolvedValueOnce(ckanResponse() as never);
    mockedGet.mockResolvedValueOnce({ data: [row({ nombre: "" }), row()] } as never);
    const restaurants = await fetchOpenDataRestaurants();
    expect(restaurants).toHaveLength(1);
  });

  it("combina nombre/name/nombre_comercial y dirección/direccion", async () => {
    mockedGet.mockResolvedValueOnce(ckanResponse() as never);
    mockedGet.mockResolvedValueOnce({
      data: [{ name: "Bar El Rinconcito", ubicacion: "Calle Mayor 5", municipio: "huesca" }],
    } as never);

    const restaurants = await fetchOpenDataRestaurants();
    expect(restaurants[0].name).toBe("Bar El Rinconcito");
    expect(restaurants[0].address).toBe("Calle Mayor 5");
  });
});