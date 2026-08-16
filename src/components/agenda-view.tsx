"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { AgendaSwitcher } from "@/components/agenda-switcher";
import { EventCard } from "@/components/event-card";
import type { MapPoint } from "@/components/map-view";
import { formatDayLong } from "@/lib/format";
import type { Category, EventItem } from "@/lib/types";
import { zoneFor } from "@/lib/zones";

const DATE_OPTIONS = [
  { value: "", label: "Todas las fechas" },
  { value: "hoy", label: "Hoy" },
  { value: "7d", label: "Próximos 7 días" },
  { value: "finde", label: "Este fin de semana" },
  { value: "mes", label: "Este mes" },
];

const ZONE_OPTIONS = [
  { value: "", label: "Toda la provincia" },
  { value: "ciudad", label: "Huesca" },
  { value: "provincia", label: "Provincia" },
];

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateStr(date);
}

function rangeFrom(desde: string): { from?: string; to?: string } {
  const today = toDateStr(new Date());
  if (desde === "hoy") return { from: today, to: today };
  if (desde === "7d") return { from: today, to: addDays(7) };
  if (desde === "mes") {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { from: today, to: toDateStr(lastDay) };
  }
  if (desde === "finde") {
    const day = new Date().getDay();
    if (day === 6) return { from: today, to: addDays(1) };
    const daysToSat = ((6 - day) + 7) % 7;
    return { from: addDays(daysToSat), to: addDays(daysToSat + 1) };
  }
  return { from: today };
}

export function AgendaView({
  events,
  categories,
  initialCategory,
  initialDesde,
  initialQ,
  initialZona,
}: {
  events: EventItem[];
  categories: Category[];
  initialCategory: string;
  initialDesde: string;
  initialQ: string;
  initialZona: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(initialQ);
  const [categoria, setCategoria] = useState(initialCategory);
  const [desde, setDesde] = useState(initialDesde);
  const [zona, setZona] = useState(initialZona);

  const categoryById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories]
  );

  const filtered = useMemo(() => {
    const { from, to } = rangeFrom(desde);
    const catId = categories.find((category) => category.slug === categoria)?.id;
    const term = q.trim().toLowerCase();
    return events.filter((event) => {
      const zone = zoneFor(event);
      if (zona === "ciudad" && zone !== "ciudad") return false;
      if (zona === "provincia" && zone !== "provincia") return false;
      if (!zona && zone === "fuera") return false;
      if (catId && event.categoryId !== catId) return false;
      if (from) {
        const startOk = event.endDate ? event.endDate >= from : event.startDate >= from;
        if (!startOk) return false;
      }
      if (to && event.startDate > to) return false;
      if (term) {
        const haystack =
          `${event.title} ${event.description ?? ""} ${event.location ?? ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [events, categories, categoria, desde, q, zona]);

  const points: MapPoint[] = filtered
    .filter((event) => event.lat != null && event.lng != null)
    .map((event) => ({
      id: event.id,
      title: event.title,
      slug: event.slug,
      lat: event.lat!,
      lng: event.lng!,
    }));

  const grouped = useMemo(() => {
    const groups: { date: string; events: EventItem[] }[] = [];
    for (const event of filtered) {
      const last = groups[groups.length - 1];
      if (last && last.date === event.startDate) {
        last.events.push(event);
      } else {
        groups.push({ date: event.startDate, events: [event] });
      }
    }
    return groups;
  }, [filtered]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const next = new URLSearchParams();
      if (categoria) next.set("categoria", categoria);
      if (desde) next.set("desde", desde);
      if (q.trim()) next.set("q", q.trim());
      if (zona) next.set("zona", zona);
      const qs = next.toString();
      const current = window.location.search.replace(/^\?/, "");
      if (qs === current) return;
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    }, 300);
    return () => clearTimeout(timeout);
  }, [categoria, desde, q, zona, pathname, router]);

  function clearFilters() {
    setCategoria("");
    setDesde("");
    setQ("");
    setZona("");
  }

  const hasFilters = Boolean(categoria || desde || q.trim() || zona);

  return (
    <div>
      <div className="rounded-2xl border border-sand bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-choco-muted" />
              <input
                type="search"
                value={q}
                onChange={(event) => setQ(event.target.value)}
                placeholder="Buscar conciertos, teatro, exposiciones…"
                className="w-full rounded-full border border-sand bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>
            <select
              value={desde}
              onChange={(event) => setDesde(event.target.value)}
              className="rounded-full border border-sand bg-white px-4 py-2.5 text-sm font-medium outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            >
              {DATE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-choco-muted">
              Zona
            </span>
            {ZONE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setZona(option.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  zona === option.value
                    ? "bg-brand text-white shadow-sm shadow-brand/30"
                    : "border border-sand bg-white text-choco-muted hover:bg-sand"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoria("")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                !categoria
                  ? "bg-choco text-cream"
                  : "border border-sand bg-white text-choco-muted hover:bg-sand"
              }`}
            >
              Todo
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setCategoria(categoria === category.slug ? "" : category.slug)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  categoria === category.slug
                    ? "bg-choco text-cream"
                    : "border border-sand bg-white text-choco-muted hover:bg-sand"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-sand bg-sand/40 p-12 text-center">
          <p className="font-display text-xl font-semibold text-choco">
            Todavía no hay eventos publicados
          </p>
          <p className="mt-2 text-choco-muted">¡Vuelve en un momento!</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-sand bg-sand/40 p-12 text-center">
          <p className="font-display text-xl font-semibold text-choco">
            No hay eventos que coincidan
          </p>
          <p className="mt-2 text-choco-muted">
            Prueba con otros filtros o revisa la agenda completa.
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 font-semibold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark"
            >
              Quitar filtros
            </button>
          )}
        </div>
      ) : (
        <AgendaSwitcher count={filtered.length} points={points}>
          {grouped.map((group) => (
            <div key={group.date}>
              <div className="sticky top-16 z-30 -mx-1 mb-3 flex items-center gap-2 rounded-full border border-sand bg-cream/90 px-4 py-1.5 shadow-sm backdrop-blur sm:mx-0">
                <span className="h-2 w-2 shrink-0 rounded-full bg-brand" />
                <span className="font-display text-sm font-bold tracking-tight text-choco sm:text-base">
                  {formatDayLong(group.date)}
                </span>
                <span className="ml-auto rounded-full bg-choco/5 px-2.5 py-0.5 text-xs font-semibold text-choco-muted">
                  {group.events.length}{" "}
                  {group.events.length === 1 ? "evento" : "eventos"}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {group.events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    category={
                      event.categoryId
                        ? categoryById.get(event.categoryId) ?? null
                        : null
                    }
                    variant="row"
                  />
                ))}
              </div>
            </div>
          ))}
        </AgendaSwitcher>
      )}
    </div>
  );
}
