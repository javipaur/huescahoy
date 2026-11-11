import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Category, EventItem } from "@/lib/types";

const mocks = vi.hoisted(() => ({
  getEvents: vi.fn(),
  getCategoriesAdmin: vi.fn(),
  todayStr: vi.fn(() => "2026-11-11"),
}));

vi.mock("@/lib/db", () => ({
  getEvents: mocks.getEvents,
  getCategoriesAdmin: mocks.getCategoriesAdmin,
  todayStr: mocks.todayStr,
}));

import { GET } from "@/app/api/promo/route";

function evento(overrides: Partial<EventItem> = {}): EventItem {
  return {
    id: 1,
    slug: "concierto-jazz",
    title: "Concierto de jazz en el Casino",
    categoryId: 1,
    startDate: "2026-11-11",
    endDate: null,
    startTime: "20:30",
    endTime: null,
    location: "Casino de Huesca",
    address: null,
    price: "12 €",
    description: null,
    image: "/fotos/jazz.jpg",
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

function peticion(query: string): Request {
  return new Request(`https://huescahoy.javierpalacio.es/api/promo${query}`);
}

beforeEach(() => {
  mocks.getEvents.mockReset();
  mocks.getCategoriesAdmin.mockReset();
  mocks.todayStr.mockReset();
  mocks.todayStr.mockReturnValue("2026-11-11");
  mocks.getCategoriesAdmin.mockResolvedValue(categorias);
});

describe("GET /api/promo", () => {
  it("devuelve la forma cerrada del paquete", async () => {
    mocks.getEvents.mockResolvedValue([evento()]);
    const res = await GET(peticion("?fecha=2026-11-11"));
    const cuerpo = await res.json();

    expect(Object.keys(cuerpo).sort()).toEqual(
      ["enlace", "imagenes", "pie", "portada", "texto", "titulos"].sort()
    );
    expect(cuerpo.imagenes).toHaveLength(cuerpo.titulos.length);
  });

  it("pide a la base de datos la ventana del día, inclusive", async () => {
    mocks.getEvents.mockResolvedValue([]);
    await GET(peticion("?fecha=2026-11-14"));
    expect(mocks.getEvents).toHaveBeenCalledWith({
      from: "2026-11-14",
      to: "2026-11-15",
      limit: 200,
    });
  });

  it("sirve todos los planes en ventana que tengan foto", async () => {
    mocks.getEvents.mockResolvedValue([
      evento({ slug: "a", title: "Concierto de jazz en el Casino", image: "/a.jpg" }),
      evento({ slug: "b", title: "Obra de teatro en el Centro Cultural", image: "/b.jpg" }),
      evento({ slug: "c", title: "Exposición de fotografía antigua", image: "/c.jpg" }),
      evento({ slug: "d", title: "Taller de cerámica para familias", image: "/d.jpg" }),
      evento({ slug: "sin-foto", title: "Charla sin cartel", image: null }),
    ]);
    const res = await GET(peticion("?fecha=2026-11-11"));
    const cuerpo = await res.json();
    expect(cuerpo.imagenes).toHaveLength(4);
  });

  it("sin fecha usa el día de hoy", async () => {
    mocks.getEvents.mockResolvedValue([]);
    await GET(peticion(""));
    expect(mocks.getEvents).toHaveBeenCalledWith({
      from: "2026-11-11",
      to: "2026-11-11",
      limit: 200,
    });
  });

  it("el enlace lleva la utm de la fecha", async () => {
    mocks.getEvents.mockResolvedValue([evento()]);
    const res = await GET(peticion("?fecha=2026-11-11"));
    const cuerpo = await res.json();
    expect(cuerpo.enlace).toContain("utm_content=huescahoy-2026-11-11");
  });

  it("con una fecha rota no revienta: cae a hoy", async () => {
    mocks.getEvents.mockResolvedValue([]);
    const res = await GET(peticion("?fecha=no-es-fecha"));
    expect(res.status).toBe(200);
    expect(mocks.getEvents).toHaveBeenCalledWith({
      from: "2026-11-11",
      to: "2026-11-11",
      limit: 200,
    });
  });
});
