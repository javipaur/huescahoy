import { describe, expect, it, vi, beforeEach } from "vitest";
import axios from "axios";
import { fetchCaminosNaturalesRoutes } from "@/lib/scraper/caminosnaturales";

vi.mock("axios");

const mockedGet = vi.mocked(axios.get);

function listingHtml(paths: string[]): string {
  const links = paths
    .map(
      (p) =>
        `<a href="${p}">Camino</a><a href="/es/red-de-caminos-naturales/camino-detalle/otro">Otro</a>`
    )
    .join("");
  return `<html><body>${links}</body></html>`;
}

function detailHtml(overrides: Record<string, string> = {}): string {
  return `
    <html><body>
      <h1>Camino de la Hoya de Huesca</h1>
      <p>Camino natural con ${overrides.distance ?? "8,5"} km entre campos. Pasa por la Sierra de Guara.
         <a href="/es/red-de-caminos-naturales/camino-detalle/sector-noreste/hoya-de-huesca/etapa-1">Etapa 1</a></p>
      <img src="/img/camino.jpg" />
    </body></html>
  `;
}

beforeEach(() => {
  mockedGet.mockReset();
});

describe("fetchCaminosNaturalesRoutes", () => {
  it("scrapea la lista y cada página de detalle", async () => {
    mockedGet
      .mockResolvedValueOnce({
        data: listingHtml([
          "/es/red-de-caminos-naturales/camino-detalle/sector-noreste/hoya-de-huesca",
        ]),
      } as never)
      .mockResolvedValueOnce({ data: detailHtml() } as never);

    const routes = await fetchCaminosNaturalesRoutes();
    expect(routes).toHaveLength(1);

    const route = routes[0];
    expect(route.title).toBe("Camino de la Hoya de Huesca");
    expect(route.route_type).toBe("camino_natural");
    expect(route.distance_km).toBe(8.5);
    expect(route.stages_count).toBe(1);
    expect(route.external_url).toContain("hoya-de-huesca");
    expect(route.source).toBe("caminosnaturales");
    expect(route.status).toBe("published");
    expect(route.slug).toMatch(/^camino-de-la-hoya-de-huesca-/);
  });

  it("usa la URL de respaldo cuando no hay enlaces relevantes", async () => {
    mockedGet
      .mockResolvedValueOnce({ data: "<html><body>Sin enlaces</body></html>" } as never)
      .mockResolvedValueOnce({ data: detailHtml() } as never);

    const routes = await fetchCaminosNaturalesRoutes();
    expect(routes).toHaveLength(1);
    expect(routes[0].external_url).toContain("hoya-de-huesca");
  });

  it("ignora páginas de detalle con errores", async () => {
    mockedGet
      .mockResolvedValueOnce({
        data: listingHtml([
          "/es/red-de-caminos-naturales/camino-detalle/sector-noreste/hoya-de-huesca",
          "/es/red-de-caminos-naturales/camino-detalle/sector-noreste/jacetania",
        ]),
      } as never)
      .mockRejectedValueOnce(new Error("timeout"))
      .mockResolvedValueOnce({ data: detailHtml() } as never);

    const routes = await fetchCaminosNaturalesRoutes();
    expect(routes).toHaveLength(1);
  });

  it("solo conserva rutas relevantes para Huesca", async () => {
    mockedGet
      .mockResolvedValueOnce({
        data: listingHtml(["/es/red-de-caminos-naturales/camino-detalle/valencia"]),
      } as never)
      .mockResolvedValueOnce({ data: detailHtml() } as never);

    const routes = await fetchCaminosNaturalesRoutes();
    expect(routes).toHaveLength(1);
    expect(routes[0].external_url).toContain("hoya-de-huesca");
    expect(mockedGet.mock.calls).toHaveLength(2);
  });
});