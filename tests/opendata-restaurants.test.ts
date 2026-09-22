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
    signatura: "R -HUESCA-01-001",
    actividad_sigla: "R",
    actividad_provincia: "HU",
    nombre_establecimiento: "Restaurante La Huesca",
    direccion_establecimiento: "Calle Zaragoza 1",
    localidad_establecimiento: "HUESCA",
    nombre_comarca: "HOYA DE HUESCA",
    telefono_establecimiento: "974111111",
    e_mail: "info@restaurantehuesca.es",
    direccion_web: "https://restaurantehuesca.es",
    categoria: "1 tenedor",
    horario: "L-V 13:00-16:00",
    estado: "A",
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
    expect(r.address).toContain("Calle Zaragoza 1");
    expect(r.phone).toBe("974111111");
    expect(r.website).toBe("https://restaurantehuesca.es");
    expect(r.source).toBe("opendata-aragon");
    expect(r.source_url).toBe("R -HUESCA-01-001");
    expect(r.status).toBe("published");
  });

  it("mapea actividad_sigla C a Bar / Cafetería", async () => {
    mockedGet.mockResolvedValueOnce(ckanResponse() as never);
    mockedGet.mockResolvedValueOnce({ data: [row({ actividad_sigla: "C" })] } as never);

    const restaurants = await fetchOpenDataRestaurants();
    expect(restaurants[0].cuisine_type).toBe("Bar / Cafetería");
  });

  it("deriva el tipo por categoría de tazas", async () => {
    mockedGet.mockResolvedValueOnce(ckanResponse() as never);
    mockedGet.mockResolvedValueOnce({ data: [row({ actividad_sigla: "X", categoria: "2 tazas" })] } as never);

    const restaurants = await fetchOpenDataRestaurants();
    expect(restaurants[0].cuisine_type).toBe("Bar / Cafetería");
  });

  it("deriva el rango de precio del nº de tenedores", async () => {
    mockedGet.mockResolvedValueOnce(ckanResponse() as never);
    mockedGet.mockResolvedValueOnce({ data: [row({ categoria: "2 tenedores" })] } as never);

    const restaurants = await fetchOpenDataRestaurants();
    expect(restaurants[0].price_range).toBe("€€");
  });

  it("mapea tazas a un precio mínimo y horario desde campo candidato", async () => {
    mockedGet.mockResolvedValueOnce(ckanResponse() as never);
    mockedGet.mockResolvedValueOnce({
      data: [row({ actividad_sigla: "C", categoria: "tazas", horario_establecimiento: "07:30-22:00" })],
    } as never);

    const restaurants = await fetchOpenDataRestaurants();
    expect(restaurants[0].price_range).toBe("€");
    expect(restaurants[0].opening_hours).toBe("07:30-22:00");
  });

  it("reconoce la comarca como marca de Huesca aunque la provincia no lo diga", async () => {
    mockedGet.mockResolvedValueOnce(ckanResponse() as never);
    mockedGet.mockResolvedValueOnce({
      data: [row({ actividad_provincia: "XX", nombre_comarca: "SOMONTANO DE BARBASTRO" })],
    } as never);

    const restaurants = await fetchOpenDataRestaurants();
    expect(restaurants).toHaveLength(1);
  });

  it("filtra filas fuera de Huesca", async () => {
    mockedGet.mockResolvedValueOnce(ckanResponse() as never);
    mockedGet.mockResolvedValueOnce({
      data: [row({ actividad_provincia: "ZA", nombre_comarca: "ZARAGOZA" })],
    } as never);

    const restaurants = await fetchOpenDataRestaurants();
    expect(restaurants).toEqual([]);
  });

  it("omite filas dadas de baja (estado B)", async () => {
    mockedGet.mockResolvedValueOnce(ckanResponse() as never);
    mockedGet.mockResolvedValueOnce({ data: [row({ estado: "B" }), row({ signatura: "R -HUESCA-01-999" })] } as never);

    const restaurants = await fetchOpenDataRestaurants();
    expect(restaurants).toHaveLength(1);
    expect(restaurants[0].source_url).toBe("R -HUESCA-01-999");
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
    mockedGet.mockResolvedValueOnce({ data: [row({ nombre_establecimiento: "" }), row({ signatura: "R -HUESCA-01-002" })] } as never);
    const restaurants = await fetchOpenDataRestaurants();
    expect(restaurants).toHaveLength(1);
  });

  it("combina dirección y localidad en la dirección", async () => {
    mockedGet.mockResolvedValueOnce(ckanResponse() as never);
    mockedGet.mockResolvedValueOnce({
      data: [{ ...row(), direccion_establecimiento: "Plaza Mayor 3", localidad_establecimiento: "JACA" }],
    } as never);

    const restaurants = await fetchOpenDataRestaurants();
    expect(restaurants[0].address).toContain("Plaza Mayor 3");
    expect(restaurants[0].address).toContain("JACA");
  });

  it("ignora valores '0' en web y teléfono", async () => {
    mockedGet.mockResolvedValueOnce(ckanResponse() as never);
    mockedGet.mockResolvedValueOnce({
      data: [row({ direccion_web: "0", telefono_establecimiento: "0", e_mail: "" })],
    } as never);

    const restaurants = await fetchOpenDataRestaurants();
    expect(restaurants[0].website).toBeNull();
    expect(restaurants[0].phone).toBeNull();
    expect(restaurants[0].email).toBeNull();
  });
});