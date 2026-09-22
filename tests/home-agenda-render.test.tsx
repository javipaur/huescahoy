import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { HomeAgenda } from "@/components/home-agenda";
import type { Category, EventItem } from "@/lib/types";

function makeEvent(overrides: Partial<EventItem> = {}): EventItem {
  return {
    id: 1,
    slug: "concierto",
    title: "Concierto de jazz en el Casino",
    categoryId: 1,
    startDate: "2026-08-19",
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
    createdAt: "2026-08-01 10:00:00",
    updatedAt: "2026-08-01 10:00:00",
    ...overrides,
  };
}

const categories: Category[] = [
  { id: 1, slug: "musica", name: "Música", icon: "music", color: "#f59e0b", sort_order: 1 },
];

describe("HomeAgenda render", () => {
  it("renderiza el evento de hoy, los chips de día y el de fin de semana", () => {
    const html = renderToString(
      <HomeAgenda
        events={[makeEvent()]}
        categories={categories}
        initialDay="2026-08-19"
      />
    );
    expect(html).toContain("Concierto de jazz en el Casino");
    expect(html).toContain(">Hoy<");
    expect(html).toContain("Mañana");
    expect(html).toContain("sáb 22 ago – dom 23 ago");
    expect(html).toContain("mié, 19 de agosto");
    expect(html).toContain("Música");
    expect(html).toContain("Ver toda la agenda");
  });

  it("muestra el estado vacío para un día sin eventos", () => {
    const html = renderToString(
      <HomeAgenda events={[]} categories={categories} initialDay="2026-08-19" />
    );
    expect(html).toContain("Nada agendado para este día");
  });

  it("respeta el filtro de categoría inicial", () => {
    const html = renderToString(
      <HomeAgenda
        events={[makeEvent()]}
        categories={categories}
        initialDay="2026-08-19"
        initialCategory="musica"
      />
    );
    expect(html).toContain("Concierto de jazz en el Casino");
  });
});