import { describe, expect, it } from "vitest";
import { escapeXml, buildEventsRss } from "@/lib/rss";
import type { EventItem } from "@/lib/types";

function makeEvent(overrides: Partial<EventItem> = {}): EventItem {
  return {
    id: 1,
    slug: "evento",
    title: "Evento",
    categoryId: null,
    startDate: "2026-08-21",
    endDate: null,
    startTime: "20:00",
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

describe("escapeXml", () => {
  it("escapa los caracteres especiales XML", () => {
    expect(escapeXml(`A & B <c> "d" 'e'`)).toBe("A &amp; B &lt;c&gt; &quot;d&quot; &apos;e&apos;");
  });
});

describe("buildEventsRss", () => {
  it("genera un canal RSS válido con un item por evento", () => {
    const xml = buildEventsRss([
      makeEvent({ slug: "a", title: "Evento A" }),
      makeEvent({ slug: "b", title: "Evento B" }),
    ]);
    expect(xml).toContain('<?xml version="1.0"');
    expect(xml).toContain("<rss version=\"2.0\"");
    expect(xml.match(/<item>/g)?.length).toBe(2);
    expect(xml).toContain("<title>Evento A</title>");
  });

  it("escapa títulos con caracteres especiales", () => {
    const xml = buildEventsRss([makeEvent({ title: "Jazz & rock <especial>" })]);
    expect(xml).toContain("<title>Jazz &amp; rock &lt;especial&gt;</title>");
  });

  it("omite description y enclosure cuando no hay datos", () => {
    const xml = buildEventsRss([makeEvent()]);
    expect(xml.match(/<description>/g)?.length).toBe(1);
    expect(xml).not.toContain("<enclosure");
  });
});
