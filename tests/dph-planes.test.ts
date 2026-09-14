import { describe, expect, it, vi, beforeEach } from "vitest";
import axios from "axios";
import { fetchDphPlanes } from "@/lib/scraper/dph-planes";

vi.mock("axios");

const mockedGet = vi.mocked(axios.get);

beforeEach(() => {
  mockedGet.mockReset();
});

function rutasCsv(): string {
  return `"Nombre","Itinerario","URL"
"A pie desde Huesca al Castillo de Montearagón","Parque Miguel Servet (Huesca) - Castillo de Montearagón (Quicena) - Acueducto romano de Quicena","http://gps.huescalamagia.es/es/ruta/a-pie-desde-huesca-al-castillo-de-montearagon"
"Alta Ribagorza","Museo de Juegos Tradicionales de Campo - Conjunto Urbano Anciles","http://gps.huescalamagia.es/es/ruta/alta-ribagorza"`;
}

function actividadesXml(): string {
  return `<ActividadesTuristicas xmlns="urn:dph:opendata:gpshuescalamagia">
<ActividadTuristica>
<Tipo>Barranquismo</Tipo>
<Nombre>Barranco del r&amp;iacute;o Vero</Nombre>
<Lugar>Alqu&amp;eacute;zar</Lugar>
<Descripcion>&lt;p&gt;Descenso del r&amp;iacute;o Vero, 6 km con un desnivel de 120 metros.&lt;br /&gt;Dentro del Parque Natural de la Sierra.&lt;/p&gt;</Descripcion>
<URL>http://gps.huescalamagia.es/es/turistico/barranco-del-rio-vero</URL>
</ActividadTuristica>
<ActividadTuristica>
<Tipo>Rafting</Tipo>
<Nombre>Rafting en el rq river</Nombre>
<Lugar>Murillo de G&amp;aacute;llego</Lugar>
<Descripcion></Descripcion>
<URL>http://gps.huescalamagia.es/es/turistico/rafting</URL>
</ActividadTuristica>
</ActividadesTuristicas>`;
}

describe("fetchDphPlanes", () => {
  it("parsea rutas del CSV con slug, resumen y body", async () => {
    mockedGet.mockResolvedValueOnce({ data: rutasCsv() } as never);
    mockedGet.mockResolvedValueOnce({ data: actividadesXml() } as never);

    const planes = await fetchDphPlanes();
    const rutas = planes.filter((p) => p.source === "dph-rutas");

    expect(rutas).toHaveLength(2);
    expect(rutas[0].title).toBe("A pie desde Huesca al Castillo de Montearagón");
    expect(rutas[0].slug).toBe("a-pie-desde-huesca-al-castillo-de-montearagon-dph");
    expect(rutas[0].summary).toContain("Parque Miguel Servet");
    expect(rutas[0].source_url).toContain("gps.huescalamagia.es/es/ruta");
    expect(rutas[0].body).toContain("Más info:");
    expect(rutas[0].published).toBe(1);
  });

  it("parsea actividades y limpia HTML y entidades", async () => {
    mockedGet.mockResolvedValueOnce({ data: rutasCsv() } as never);
    mockedGet.mockResolvedValueOnce({ data: actividadesXml() } as never);

    const planes = await fetchDphPlanes();
    const act = planes.find((p) => p.source === "dph-actividades" && p.title.includes("Vero"));

    expect(act).toBeDefined();
    expect(act!.title).toBe("Barranco del río Vero");
    expect(act!.summary).toContain("Barranquismo");
    expect(act!.summary).toContain("Alquézar");
    expect(act!.body).toContain("río");
    expect(act!.body).toContain("120 metros");
    expect(act!.body).not.toContain("<");
  });

  it("usa el resumen tipo · lugar para actividades", async () => {
    mockedGet.mockResolvedValueOnce({ data: rutasCsv() } as never);
    mockedGet.mockResolvedValueOnce({ data: actividadesXml() } as never);

    const planes = await fetchDphPlanes();
    const act = planes.find((p) => p.source === "dph-actividades" && p.title.includes("Rafting"));
    expect(act!.summary).toBe("Rafting · Murillo de Gállego");
    expect(act!.body).toContain("Más info");
  });

  it("combina rutas y actividades en un solo listado", async () => {
    mockedGet.mockResolvedValueOnce({ data: rutasCsv() } as never);
    mockedGet.mockResolvedValueOnce({ data: actividadesXml() } as never);

    const planes = await fetchDphPlanes();
    expect(planes.length).toBe(4);
    expect(planes.filter((p) => p.source === "dph-rutas").length).toBe(2);
    expect(planes.filter((p) => p.source === "dph-actividades").length).toBe(2);
  });

  it("genera source_url únicos para deduplicación", async () => {
    mockedGet.mockResolvedValueOnce({ data: rutasCsv() } as never);
    mockedGet.mockResolvedValueOnce({ data: actividadesXml() } as never);

    const planes = await fetchDphPlanes();
    const urls = planes.map((p) => p.source_url).filter(Boolean);
    expect(new Set(urls).size).toBe(urls.length);
  });
});