import { describe, expect, it } from "vitest";
import { zoneFor } from "@/lib/zones";
import type { EventItem } from "@/lib/types";

function makeEvent(overrides: Partial<EventItem> = {}): EventItem {
  return {
    id: 1,
    slug: "evento",
    title: "Evento",
    categoryId: null,
    startDate: "2026-08-21",
    endDate: null,
    startTime: null,
    endTime: null,
    location: null,
    address: null,
    price: null,
    description: null,
    image: null,
    externalUrl: null,
    source: "manual",
    sourceUrl: null,
    featured: 0,
    status: "published",
    lat: null,
    lng: null,
    createdAt: "2026-08-01 10:00:00",
    updatedAt: "2026-08-01 10:00:00",
    ...overrides,
  };
}

describe("zoneFor", () => {
  it("clasifica como ciudad un evento en el centro de Huesca", () => {
    const event = makeEvent({ lat: 42.1396, lng: -0.4089 });
    expect(zoneFor(event)).toBe("ciudad");
  });

  it("clasifica como provincia un evento lejano con coordenadas", () => {
    const event = makeEvent({ lat: 42.3667, lng: 0.12 });
    expect(zoneFor(event)).toBe("provincia");
  });

  it("clasifica por marcador de pueblo sin coordenadas", () => {
    const event = makeEvent({ location: "Teatro Barbastro" });
    expect(zoneFor(event)).toBe("provincia");
  });

  it("clasica como fuera lo que pertenece a otra provincia", () => {
    const event = makeEvent({ location: "Auditorio de Zaragoza" });
    expect(zoneFor(event)).toBe("fuera");
  });

  it("devuelve null sin pistas", () => {
    expect(zoneFor(makeEvent())).toBeNull();
  });
});
