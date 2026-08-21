import { describe, expect, it } from "vitest";
import { displayDate, rangeFrom, toDateStr } from "@/lib/agenda-dates";
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

describe("toDateStr", () => {
  it("formatea con ceros a la izquierda", () => {
    expect(toDateStr(new Date(2026, 2, 5))).toBe("2026-03-05");
  });
});

describe("rangeFrom", () => {
  it("hoy devuelve from y to iguales a hoy", () => {
    const { from, to } = rangeFrom("hoy");
    const today = toDateStr(new Date());
    expect(from).toBe(today);
    expect(to).toBe(today);
  });

  it("7d devuelve un rango de una semana desde hoy", () => {
    const { from, to } = rangeFrom("7d");
    const today = toDateStr(new Date());
    expect(from).toBe(today);
    expect(to).not.toBe(from);
  });

  it("sin filtro devuelve solo from (todo el futuro)", () => {
    const { from, to } = rangeFrom("");
    expect(from).toBe(toDateStr(new Date()));
    expect(to).toBeUndefined();
  });

  it("finde devuelve sábado y domingo", () => {
    const { from, to } = rangeFrom("finde");
    if (!from || !to) throw new Error("finde debe devolver rango");
    expect(new Date(from).getDay()).toBe(6);
    expect(new Date(to).getDay()).toBe(0);
  });
});

describe("displayDate", () => {
  it("agrupa bajo hoy un evento multiday en curso", () => {
    const event = makeEvent({ startDate: "2026-08-19", endDate: "2026-08-25" });
    expect(displayDate(event, "2026-08-21")).toBe("2026-08-21");
  });

  it("mantiene la fecha de un evento futuro", () => {
    const event = makeEvent({ startDate: "2026-08-25", endDate: "2026-08-26" });
    expect(displayDate(event, "2026-08-21")).toBe("2026-08-25");
  });

  it("mantiene la fecha de un evento de un solo día aunque sea pasado", () => {
    const event = makeEvent({ startDate: "2026-08-19", endDate: null });
    expect(displayDate(event, "2026-08-21")).toBe("2026-08-19");
  });
});
