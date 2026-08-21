import { describe, expect, it } from "vitest";
import {
  buildBreadcrumbJsonLd,
  buildEventJsonLd,
  isEventPast,
} from "@/lib/event-jsonld";
import type { Category, EventItem } from "@/lib/types";

function makeEvent(overrides: Partial<EventItem> = {}): EventItem {
  return {
    id: 1,
    slug: "concierto-de-prueba",
    title: "Concierto de prueba",
    categoryId: null,
    startDate: "2026-08-21",
    endDate: null,
    startTime: "20:00",
    endTime: "22:00",
    location: "Plaza de Navarra",
    address: "Plaza de Navarra, s/n",
    price: "10 €",
    description: "Una descripción del evento",
    image: "https://example.com/foto.jpg",
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

const category: Category = {
  id: 1,
  slug: "conciertos",
  name: "Conciertos",
  icon: "music",
  color: "#e8452c",
  sort_order: 1,
};

describe("buildEventJsonLd", () => {
  it("incluye location con Place y PostalAddress cuando el evento tiene lugar", () => {
    const jsonLd = buildEventJsonLd(makeEvent(), category);
    const location = jsonLd.location as Record<string, unknown>;
    expect(location["@type"]).toBe("Place");
    expect(location.name).toBe("Plaza de Navarra");
    const address = location.address as Record<string, unknown>;
    expect(address["@type"]).toBe("PostalAddress");
    expect(address.addressLocality).toBe("Huesca");
    expect(address.addressCountry).toBe("ES");
  });

  it("usa un lugar de respaldo cuando el evento no tiene location (error GSC)", () => {
    const jsonLd = buildEventJsonLd(makeEvent({ location: null, address: null }), null);
    const location = jsonLd.location as Record<string, unknown>;
    expect(location).toBeDefined();
    expect(location.name).toBe("Huesca");
    const address = location.address as Record<string, unknown>;
    expect(address.streetAddress).toBeUndefined();
    expect(address.addressLocality).toBe("Huesca");
  });

  it("no incluye offers cuando no hay precio parseable", () => {
    const jsonLd = buildEventJsonLd(makeEvent({ price: "Gratis" }), null);
    expect(jsonLd.offers).toBeUndefined();
  });

  it("incluye offers con precio cuando el precio es parseable", () => {
    const jsonLd = buildEventJsonLd(makeEvent({ price: "12,50 €" }), null);
    const offers = jsonLd.offers as Record<string, unknown>;
    expect(offers.price).toBe(12.5);
    expect(offers.priceCurrency).toBe("EUR");
  });

  it("usa imagen de respaldo cuando el evento no tiene imagen", () => {
    const jsonLd = buildEventJsonLd(makeEvent({ image: null }), null);
    expect(jsonLd.image).toEqual(["https://huescahoy.javierpalacio.es/opengraph-image"]);
  });

  it("serializa a JSON sin campos undefined", () => {
    const jsonLd = buildEventJsonLd(
      makeEvent({ description: null, eventCategory: undefined } as Partial<EventItem>),
      null
    );
    const serialized = JSON.stringify(jsonLd);
    expect(serialized).not.toContain("undefined");
    expect(serialized).toContain('"@type":"Event"');
  });
});

describe("isEventPast", () => {
  it("marca como pasado un evento que terminó ayer", () => {
    const event = makeEvent({ startDate: "2026-08-19", endDate: "2026-08-20" });
    expect(isEventPast(event, "2026-08-21")).toBe(true);
  });

  it("no marca como pasado un evento que termina hoy", () => {
    const event = makeEvent({ startDate: "2026-08-19", endDate: "2026-08-21" });
    expect(isEventPast(event, "2026-08-21")).toBe(false);
  });

  it("usa startDate cuando no hay endDate", () => {
    const event = makeEvent({ startDate: "2026-08-20", endDate: null });
    expect(isEventPast(event, "2026-08-21")).toBe(true);
  });
});

describe("buildBreadcrumbJsonLd", () => {
  it("genera posiciones consecutivas y URL absoluta en los niveles con path", () => {
    const jsonLd = buildBreadcrumbJsonLd([
      { name: "Inicio", path: "/" },
      { name: "Agenda", path: "/agenda" },
      { name: "Concierto" },
    ]);
    const items = jsonLd.itemListElement as {
      position: number;
      name: string;
      item?: string;
    }[];
    expect(items.map((i) => i.position)).toEqual([1, 2, 3]);
    expect(items[0].item).toBe("https://huescahoy.javierpalacio.es/");
    expect(items[2].item).toBeUndefined();
  });
});
