import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Category, EventItem } from "@/lib/types";

const mocks = vi.hoisted(() => ({
  getEvents: vi.fn(),
  getCategoriesAdmin: vi.fn(),
  getEventBySlug: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  getEvents: mocks.getEvents,
  getCategoriesAdmin: mocks.getCategoriesAdmin,
  getEventBySlug: mocks.getEventBySlug,
}));

import { GET as portada } from "@/app/api/promo/[fecha]/portada/route";
import { GET as evento } from "@/app/api/promo/[fecha]/evento/[slug]/route";
import { GET as historia } from "@/app/api/promo/[fecha]/historia/route";
import { GET as presentacion } from "@/app/api/promo/presentacion/route";

function eventoDe(overrides: Partial<EventItem> = {}): EventItem {
  return {
    id: 1,
    slug: "concierto-jazz",
    title: "Concierto de jazz en el Casino",
    categoryId: 1,
    startDate: "2026-11-14",
    endDate: null,
    startTime: "20:30",
    endTime: null,
    location: "Casino de Huesca",
    address: null,
    price: "12 €",
    description: null,
    image: null,
    externalUrl: null,
    source: "manual",
    sourceUrl: null,
    featured: 0,
    status: "published",
    lat: null,
    lng: null,
    createdAt: "2026-11-01 10:00:00",
    updatedAt: "2026-11-01 10:00:00",
    ...overrides,
  };
}

const categorias: Category[] = [
  { id: 1, slug: "musica", name: "Música", icon: "music", color: "#f59e0b", sort_order: 1 },
];

/** Ancho y alto reales de un PNG, leídos de su cabecera IHDR. */
function dimensionesPng(buffer: Buffer): { width: number; height: number } {
  // 8 bytes de firma + 4 de longitud + 4 de "IHDR" = 16; luego ancho y alto big-endian.
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

beforeEach(() => {
  mocks.getEvents.mockReset();
  mocks.getCategoriesAdmin.mockReset();
  mocks.getEventBySlug.mockReset();
  mocks.getEvents.mockResolvedValue([eventoDe()]);
  mocks.getCategoriesAdmin.mockResolvedValue(categorias);
  mocks.getEventBySlug.mockResolvedValue(eventoDe());
});

describe("portada", () => {
  it("pinta un PNG de 1080×1350 sin tumbarse", async () => {
    const res = await portada(new Request("https://huescahoy.javierpalacio.es/api/promo/2026-11-14/portada"), {
      params: Promise.resolve({ fecha: "2026-11-14" }),
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/png");
    const buffer = Buffer.from(await res.arrayBuffer());
    expect(dimensionesPng(buffer)).toEqual({ width: 1080, height: 1350 });
  });

  it("con ?format=jpeg devuelve JPEG, que es lo que exige Meta", async () => {
    const res = await portada(
      new Request("https://huescahoy.javierpalacio.es/api/promo/2026-11-14/portada?format=jpeg"),
      { params: Promise.resolve({ fecha: "2026-11-14" }) }
    );
    expect(res.headers.get("content-type")).toContain("image/jpeg");
  });

  it("con una fecha rota pinta el estado vacío en vez de reventar", async () => {
    mocks.getEvents.mockResolvedValue([]);
    const res = await portada(new Request("https://huescahoy.javierpalacio.es/api/promo/no-fecha/portada"), {
      params: Promise.resolve({ fecha: "no-fecha" }),
    });
    expect(res.status).toBe(200);
  });
});

describe("evento", () => {
  it("pinta la diapositiva del evento", async () => {
    const res = await evento(
      new Request("https://huescahoy.javierpalacio.es/api/promo/2026-11-14/evento/concierto-jazz"),
      { params: Promise.resolve({ fecha: "2026-11-14", slug: "concierto-jazz" }) }
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/png");
  });

  it("un slug que no existe es un 404, no una tarjeta vacía", async () => {
    mocks.getEventBySlug.mockResolvedValue(null);
    const res = await evento(
      new Request("https://huescahoy.javierpalacio.es/api/promo/2026-11-14/evento/inventado"),
      { params: Promise.resolve({ fecha: "2026-11-14", slug: "inventado" }) }
    );
    expect(res.status).toBe(404);
  });
});

describe("historia", () => {
  it("pinta un PNG vertical de 1080×1920", async () => {
    const res = await historia(new Request("https://huescahoy.javierpalacio.es/api/promo/2026-11-14/historia"), {
      params: Promise.resolve({ fecha: "2026-11-14" }),
    });
    expect(res.status).toBe(200);
    const buffer = Buffer.from(await res.arrayBuffer());
    expect(dimensionesPng(buffer)).toEqual({ width: 1080, height: 1920 });
  });

  it("un sábado cubre el finde entero, igual que el carrusel", async () => {
    // 2026-11-14 es sábado: la ventana del carrusel es sáb+dom, y la historia no puede
    // quedarse con el sábado solo o los dos «N planes» se contradicen.
    await historia(new Request("https://huescahoy.javierpalacio.es/api/promo/2026-11-14/historia"), {
      params: Promise.resolve({ fecha: "2026-11-14" }),
    });
    expect(mocks.getEvents).toHaveBeenCalledWith({
      from: "2026-11-14",
      to: "2026-11-15",
      limit: 200,
    });
  });

  it("con una fecha rota pinta el estado vacío en vez de reventar", async () => {
    mocks.getEvents.mockResolvedValue([]);
    const res = await historia(new Request("https://huescahoy.javierpalacio.es/api/promo/no-fecha/historia"), {
      params: Promise.resolve({ fecha: "no-fecha" }),
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/png");
  });

  it("con ?format=jpeg devuelve JPEG, que es lo que exige Meta", async () => {
    const res = await historia(
      new Request("https://huescahoy.javierpalacio.es/api/promo/2026-11-14/historia?format=jpeg"),
      { params: Promise.resolve({ fecha: "2026-11-14" }) }
    );
    expect(res.headers.get("content-type")).toContain("image/jpeg");
  });
});

describe("presentacion", () => {
  it("pinta el PNG del post de presentación sin tocar la base de datos", async () => {
    const res = await presentacion(new Request("https://huescahoy.javierpalacio.es/api/promo/presentacion"));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/png");
  });

  it("con ?format=jpeg devuelve JPEG, que es lo que exige Meta", async () => {
    const res = await presentacion(
      new Request("https://huescahoy.javierpalacio.es/api/promo/presentacion?format=jpeg")
    );
    expect(res.headers.get("content-type")).toContain("image/jpeg");
  });
});
