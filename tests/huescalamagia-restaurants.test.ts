import { describe, expect, it, vi, beforeEach } from "vitest";
import axios from "axios";
import { fetchHuescaLaMagiaRestaurants } from "@/lib/scraper/huescalamagia-restaurants";

vi.mock("axios");

const mockedGet = vi.mocked(axios.get);

beforeEach(() => {
  mockedGet.mockReset();
});

function magiaItem(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 100,
    title: "Restaurante La Cueva",
    summary: "<p>Cocina aragonesa</p>",
    address: "Calle Coso 12",
    phoneNumber: "974222222",
    email: "info@lacueva.es",
    website: "https://lacueva.es",
    url: "https://web.huescalamagia.es/sitio/100",
    latitude: "42.14",
    longitude: "-0.40",
    images: [{ url: "https://img/principal.jpg" }],
    xLargeThumbnail: "https://img/xlarge.jpg",
    ...overrides,
  };
}

describe("fetchHuescaLaMagiaRestaurants", () => {
  it("scrapea restaurantes y bares con su cuisine_type", async () => {
    mockedGet
      .mockResolvedValueOnce({
        data: { items: [magiaItem({ id: 1 })], next_page: null },
      } as never)
      .mockResolvedValueOnce({
        data: { items: [magiaItem({ id: 2, title: "Bar La Tertulia" })], next_page: null },
      } as never);

    const restaurants = await fetchHuescaLaMagiaRestaurants();
    expect(restaurants).toHaveLength(2);

    const restaurant = restaurants.find((r) => r.name === "Restaurante La Cueva")!;
    expect(restaurant.cuisine_type).toBe("Restaurante");
    expect(restaurant.source).toBe("huescalamagia-restaurantes");

    const bar = restaurants.find((r) => r.name === "Bar La Tertulia")!;
    expect(bar.cuisine_type).toBe("Bar / Cafetería");
    expect(bar.source).toBe("huescalamagia-bares");
  });

  it("mapea datos de contacto y coordenadas", async () => {
    mockedGet.mockResolvedValue({
      data: { items: [magiaItem()], next_page: null },
    } as never);

    const restaurants = await fetchHuescaLaMagiaRestaurants();
    const r = restaurants[0];
    expect(r.name).toBe("Restaurante La Cueva");
    expect(r.slug).toMatch(/^restaurante-la-cueva-/);
    expect(r.address).toBe("Calle Coso 12");
    expect(r.phone).toBe("974222222");
    expect(r.email).toBe("info@lacueva.es");
    expect(r.website).toBe("https://lacueva.es");
    expect(r.lat).toBe(42.14);
    expect(r.lng).toBe(-0.4);
    expect(r.image).toBe("https://img/principal.jpg");
    expect(r.source_url).toBe("https://web.huescalamagia.es/sitio/100");
    expect(r.status).toBe("published");
  });

  it("prioriza la imagen de images sobre thumbnails", async () => {
    mockedGet.mockResolvedValue({
      data: {
        items: [
          magiaItem({ images: [{ url: "https://img/principal.jpg" }] }),
          magiaItem({ id: 99, images: [], xLargeThumbnail: "https://img/xlarge.jpg" }),
        ],
        next_page: null,
      },
    } as never);

    const restaurants = await fetchHuescaLaMagiaRestaurants();
    expect(restaurants[0].image).toBe("https://img/principal.jpg");
    expect(restaurants[1].image).toBe("https://img/xlarge.jpg");
  });

  it("usa el id para el slug cuando la URL no existe", async () => {
    mockedGet.mockResolvedValue({
      data: { items: [magiaItem({ url: null })], next_page: null },
    } as never);

    const restaurants = await fetchHuescaLaMagiaRestaurants();
    expect(restaurants[0].slug).toContain("100");
    expect(restaurants[0].source_url).toBe("huescalamagia:100");
  });

  it("ignora ítems sin nombre", async () => {
    mockedGet
      .mockResolvedValueOnce({
        data: { items: [magiaItem({ title: "" }), magiaItem({ id: 5 })], next_page: null },
      } as never)
      .mockResolvedValueOnce({ data: { items: [], next_page: null } } as never);

    const restaurants = await fetchHuescaLaMagiaRestaurants();
    expect(restaurants).toHaveLength(1);
    expect(restaurants[0].name).toBe("Restaurante La Cueva");
  });

  it("alterna entre secciones siguiendo next_page", async () => {
    mockedGet
      .mockResolvedValueOnce({
        data: { items: [magiaItem({ id: 1 })], next_page: 2 },
      } as never)
      .mockResolvedValueOnce({
        data: { items: [magiaItem({ id: 2 })], next_page: null },
      } as never)
      .mockResolvedValueOnce({
        data: { items: [magiaItem({ id: 3 })], next_page: null },
      } as never);

    const restaurants = await fetchHuescaLaMagiaRestaurants();
    expect(restaurants).toHaveLength(3);
    expect(mockedGet.mock.calls).toHaveLength(3);
  });

  it("detiene la sección ante un fallo de red", async () => {
    mockedGet
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce({
        data: { items: [magiaItem({ id: 7 })], next_page: null },
      } as never);

    const restaurants = await fetchHuescaLaMagiaRestaurants();
    expect(restaurants).toHaveLength(1);
  });
});