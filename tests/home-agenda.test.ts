import { describe, expect, it } from "vitest";
import {
  agendaEventsFor,
  dayLabel,
  dayTabs,
  FINDE,
  findeLabel,
  shiftDate,
  weekendRange,
} from "@/lib/home-agenda";
import type { Category, EventItem } from "@/lib/types";

function makeEvent(overrides: Partial<EventItem> = {}): EventItem {
  return {
    id: 1,
    slug: "evento",
    title: "Evento",
    categoryId: null,
    startDate: "2026-08-19",
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

function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: 1,
    slug: "musica",
    name: "Música",
    icon: "music",
    color: "#f59e0b",
    sort_order: 1,
    ...overrides,
  };
}

describe("shiftDate", () => {
  it("suma días cruzando de mes", () => {
    expect(shiftDate("2026-08-30", 3)).toBe("2026-09-02");
  });

  it("resta días cruzando de año", () => {
    expect(shiftDate("2026-01-02", -2)).toBe("2025-12-31");
  });
});

describe("weekendRange", () => {
  it("desde miércoles apunta al próximo sábado y domingo", () => {
    expect(weekendRange("2026-08-19")).toEqual({ from: "2026-08-22", to: "2026-08-23" });
  });

  it("desde sábado abarca sábado y domingo", () => {
    expect(weekendRange("2026-08-22")).toEqual({ from: "2026-08-22", to: "2026-08-23" });
  });

  it("desde domingo apunta al siguiente fin de semana", () => {
    expect(weekendRange("2026-08-23")).toEqual({ from: "2026-08-29", to: "2026-08-30" });
  });
});

describe("dayLabel", () => {
  const today = "2026-08-19";

  it("hoy etiqueta 'Hoy'", () => {
    expect(dayLabel(today, today)).toBe("Hoy");
  });

  it("mañana etiqueta 'Mañana'", () => {
    expect(dayLabel("2026-08-20", today)).toBe("Mañana");
  });

  it("un día del mismo mes usa día corto", () => {
    expect(dayLabel("2026-08-22", today)).toBe("sáb 22");
  });

  it("un día de otro mes añade el mes", () => {
    expect(dayLabel("2026-09-02", today)).toBe("mié 2 sep");
  });
});

describe("dayTabs", () => {
  const today = "2026-08-19";
  const event = (startDate: string) => makeEvent({ startDate });

  it("siempre ofrece Hoy y Mañana", () => {
    const tabs = dayTabs([], today);
    expect(tabs).toHaveLength(2);
    expect(tabs[0]).toEqual({ value: today, label: "Hoy" });
    expect(tabs[1]).toEqual({ value: "2026-08-20", label: "Mañana" });
  });

  it("añade los próximos días que tienen eventos, únicos y ordenados", () => {
    const tabs = dayTabs(
      [event("2026-08-25"), event("2026-08-22"), event("2026-08-22"), event("2026-08-25")],
      today
    );
    const values = tabs.map((tab) => tab.value);
    expect(values).toEqual(["2026-08-19", "2026-08-20", "2026-08-22", "2026-08-25"]);
  });

  it("ignora días pasados", () => {
    const tabs = dayTabs([event("2026-08-01")], today);
    expect(tabs.map((tab) => tab.value)).toHaveLength(2);
  });

  it("no supera los 7 chips", () => {
    const events = [22, 23, 24, 25, 26, 27, 28].map(
      (day) => event(`2026-08-${day}`)
    );
    const tabs = dayTabs(events, today);
    expect(tabs.length).toBeLessThanOrEqual(7);
  });
});

describe("agendaEventsFor", () => {
  const today = "2026-08-19";
  const categories = [makeCategory()];

  it("devuelve solo los eventos del día elegido", () => {
    const events = [makeEvent({ startDate: "2026-08-19" }), makeEvent({ startDate: "2026-08-22" })];
    const result = agendaEventsFor(events, "2026-08-19", "", categories, today);
    expect(result.map((event) => event.startDate)).toEqual(["2026-08-19"]);
  });

  it("agrupa un evento multiday en curso bajo hoy", () => {
    const events = [makeEvent({ startDate: "2026-08-10", endDate: "2026-08-25" })];
    const result = agendaEventsFor(events, today, "", categories, today);
    expect(result).toHaveLength(1);
  });

  it("filtra por categoría usando el slug", () => {
    const musica = makeEvent({ title: "Concierto", categoryId: 1 });
    const teatro = makeEvent({ title: "Obra", categoryId: 2, slug: "obra" });
    const result = agendaEventsFor([musica, teatro], today, "musica", categories, today);
    expect(result.map((event) => event.title)).toEqual(["Concierto"]);
  });

  it("con categoría vacía devuelve todo", () => {
    const events = [
      makeEvent({ categoryId: 1 }),
      makeEvent({ categoryId: 2, slug: "obra" }),
    ];
    const result = agendaEventsFor(events, today, "", categories, today);
    expect(result).toHaveLength(2);
  });

  it("ordena por hora dentro del día", () => {
    const events = [
      makeEvent({ title: "Tarde", startTime: "19:30" }),
      makeEvent({ title: "Mediodía", startTime: "12:00", slug: "mediodia" }),
      makeEvent({ title: "Sin hora", startTime: null, slug: "sin-hora" }),
    ];
    const result = agendaEventsFor(events, today, "", categories, today);
    expect(result.map((event) => event.title)).toEqual(["Mediodía", "Tarde", "Sin hora"]);
  });

  it("el fin de semana incluye eventos reales del sábado y domingo", () => {
    const friday = makeEvent({ startDate: "2026-08-21", slug: "viernes" });
    const saturday = makeEvent({ startDate: "2026-08-22", slug: "sabado" });
    const sunday = makeEvent({ startDate: "2026-08-23", slug: "domingo" });
    const monday = makeEvent({ startDate: "2026-08-24", slug: "lunes" });
    const result = agendaEventsFor(
      [friday, saturday, sunday, monday],
      FINDE,
      "",
      categories,
      today
    );
    expect(result.map((event) => event.slug)).toEqual(["sabado", "domingo"]);
  });

  it("el fin de semana incluye un evento que comenzó antes y termina dentro", () => {
    const spanning = makeEvent({ startDate: "2026-08-20", endDate: "2026-08-23", slug: "puente" });
    const result = agendaEventsFor([spanning], FINDE, "", categories, today);
    expect(result.map((event) => event.slug)).toEqual(["puente"]);
  });
});

describe("findeLabel", () => {
  it("describe el próximo fin de semana", () => {
    expect(findeLabel("2026-08-19")).toBe("sáb 22 ago – dom 23 ago");
  });
});