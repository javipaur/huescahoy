import { describe, expect, it, vi, beforeEach } from "vitest";
import axios from "axios";
import { fetchSenderosGrRoutes } from "@/lib/scraper/senderosgr";

vi.mock("axios");

const mockedGet = vi.mocked(axios.get);

beforeEach(() => {
  mockedGet.mockReset();
});

function wpPost(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 123,
    title: { rendered: "Ruta del Gallo Ciego" },
    content: {
      rendered:
        "<p>Distancia: 12,5 km. Desnivel positivo 450 m. Dificultad media.</p><img src=\"https://img/1.jpg\" />",
    },
    excerpt: { rendered: "<p>Una ruta por la Sierra</p>" },
    link: "https://senderosgr.es/ruta-del-gallo-ciego",
    _embedded: {
      "wp:featuredmedia": [{ source_url: "https://img/featured.jpg" }],
    },
    ...overrides,
  };
}

describe("fetchSenderosGrRoutes", () => {
  it("mapea posts de WordPress a RouteInput", async () => {
    mockedGet.mockResolvedValue({ data: [wpPost()] } as never);

    const routes = await fetchSenderosGrRoutes();
    expect(routes).toHaveLength(1);

    const route = routes[0];
    expect(route.title).toBe("Ruta del Gallo Ciego");
    expect(route.slug).toBe("ruta-del-gallo-ciego");
    expect(route.route_type).toBe("senderismo");
    expect(route.distance_km).toBe(12.5);
    expect(route.elevation_m).toBe(450);
    expect(route.difficulty).toBe("media");
    expect(route.external_url).toBe("https://senderosgr.es/ruta-del-gallo-ciego");
    expect(route.source).toBe("senderosgr");
    expect(route.status).toBe("published");
    expect(route.stages_count).toBe(0);
  });

  it("prefiere la imagen del contenido a la destacada", async () => {
    mockedGet.mockResolvedValue({ data: [wpPost()] } as never);
    const routes = await fetchSenderosGrRoutes();
    expect(routes[0].image).toBe("https://img/1.jpg");
  });

  it("usa la imagen destacada si el contenido no tiene img", async () => {
    mockedGet.mockResolvedValue({
      data: [wpPost({ content: { rendered: "<p>Sin imágenes</p>" } })],
    } as never);
    const routes = await fetchSenderosGrRoutes();
    expect(routes[0].image).toBe("https://img/featured.jpg");
  });

  it("ignora posts sin título", async () => {
    mockedGet.mockResolvedValue({
      data: [wpPost({ title: { rendered: "" } }), wpPost()],
    } as never);
    const routes = await fetchSenderosGrRoutes();
    expect(routes).toHaveLength(1);
  });

  it("normaliza la dificultad a fácil/media/alta/extrema", async () => {
    const cases: Array<[string, string]> = [
      ["Dificultad fácil", "fácil"],
      ["nível fácil", "fácil"],
      ["Dificultad media", "media"],
      ["dificultad alta", "alta"],
      ["Itinerario difícil", "alta"],
      ["Sendero extremo", "extrema"],
    ];
    for (const [text, expected] of cases) {
      mockedGet.mockResolvedValue({
        data: [wpPost({ content: { rendered: `<p>${text}</p>` } })],
      } as never);
      const routes = await fetchSenderosGrRoutes();
      expect(routes[0].difficulty, `"${text}" → "${expected}"`).toBe(expected);
    }
  });

  it("fallback de slug con el id", async () => {
    mockedGet.mockResolvedValue({
      data: [wpPost({ title: { rendered: "@@@!*" } })],
    } as never);
    const routes = await fetchSenderosGrRoutes();
    expect(routes[0].slug).toBe("gr-123");
  });
});