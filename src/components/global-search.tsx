"use client";

import { useState, useMemo } from "react";
import { Search, CalendarDays, Route, UtensilsCrossed, BookOpen, X } from "lucide-react";
import { RestaurantCard } from "@/components/restaurant-card";
import { RouteCard } from "@/components/route-card";
import { EventCard } from "@/components/event-card";
import type { EventItem, RestaurantItem, RouteItem, Category } from "@/lib/types";

type Tab = "todos" | "eventos" | "rutas" | "restaurantes" | "planes";

const TABS: Array<{ id: Tab; label: string; icon: typeof Search }> = [
  { id: "todos", label: "Todos", icon: Search },
  { id: "eventos", label: "Eventos", icon: CalendarDays },
  { id: "rutas", label: "Rutas", icon: Route },
  { id: "restaurantes", label: "Restaurantes", icon: UtensilsCrossed },
  { id: "planes", label: "Planes", icon: BookOpen },
];

export function GlobalSearch({
  events,
  routes,
  restaurants,
  plans,
  categories,
}: {
  events: EventItem[];
  routes: RouteItem[];
  restaurants: RestaurantItem[];
  plans: Array<{ slug: string; title: string; summary: string | null; image: string | null }>;
  categories: Category[];
}) {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<Tab>("todos");
  const term = q.trim().toLowerCase();

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const filteredEvents = useMemo(() => {
    if (tab !== "todos" && tab !== "eventos") return [];
    if (!term) return events.slice(0, 12);
    return events.filter(
      (e) =>
        `${e.title} ${e.description ?? ""} ${e.location ?? ""}`.toLowerCase().includes(term)
    );
  }, [events, tab, term]);

  const filteredRoutes = useMemo(() => {
    if (tab !== "todos" && tab !== "rutas") return [];
    if (!term) return routes.slice(0, 12);
    return routes.filter(
      (r) =>
        `${r.title} ${r.description ?? ""} ${r.summary ?? ""}`.toLowerCase().includes(term)
    );
  }, [routes, tab, term]);

  const filteredRestaurants = useMemo(() => {
    if (tab !== "todos" && tab !== "restaurantes") return [];
    if (!term) return restaurants.slice(0, 12);
    return restaurants.filter(
      (r) =>
        `${r.name} ${r.description ?? ""} ${r.address ?? ""} ${r.cuisineType ?? ""}`.toLowerCase().includes(term)
    );
  }, [restaurants, tab, term]);

  const filteredPlans = useMemo(() => {
    if (tab !== "todos" && tab !== "planes") return [];
    if (!term) return plans.slice(0, 12);
    return plans.filter(
      (p) => `${p.title} ${p.summary ?? ""}`.toLowerCase().includes(term)
    );
  }, [plans, tab, term]);

  const totalResults = filteredEvents.length + filteredRoutes.length + filteredRestaurants.length + filteredPlans.length;

  return (
    <div>
      <div className="mb-6 rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 p-4 shadow-sm sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-choco-muted" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar eventos, rutas, restaurantes, planes…"
            className="w-full rounded-full border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-choco-muted hover:text-choco dark:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
                  tab === t.id
                    ? "bg-choco dark:bg-ink text-white shadow-sm shadow-choco/30"
                    : "border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 text-choco-muted hover:bg-sand"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {term && totalResults === 0 && (
        <div className="rounded-2xl border border-dashed border-sand bg-sand/40 p-12 text-center">
          <p className="font-display text-xl font-semibold text-choco dark:text-ink">
            No se encontraron resultados
          </p>
          <p className="mt-2 text-choco-muted">
            Prueba con otros términos o explora las categorías.
          </p>
          <button
            onClick={() => { setQ(""); setTab("todos"); }}
            className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 font-semibold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark"
          >
            Ver todo
          </button>
        </div>
      )}

      {filteredEvents.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-choco dark:text-ink">
            <CalendarDays className="h-5 w-5 text-brand" />
            Eventos
            <span className="rounded-full bg-choco/5 px-2.5 py-0.5 text-xs font-semibold text-choco-muted">
              {filteredEvents.length}
            </span>
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                category={event.categoryId ? categoryById.get(event.categoryId) ?? null : null}
              />
            ))}
          </div>
        </section>
      )}

      {filteredRoutes.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-choco dark:text-ink">
            <Route className="h-5 w-5 text-brand" />
            Rutas
            <span className="rounded-full bg-choco/5 px-2.5 py-0.5 text-xs font-semibold text-choco-muted">
              {filteredRoutes.length}
            </span>
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRoutes.map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </div>
        </section>
      )}

      {filteredRestaurants.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-choco dark:text-ink">
            <UtensilsCrossed className="h-5 w-5 text-brand" />
            Restaurantes
            <span className="rounded-full bg-choco/5 px-2.5 py-0.5 text-xs font-semibold text-choco-muted">
              {filteredRestaurants.length}
            </span>
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </section>
      )}

      {filteredPlans.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-choco dark:text-ink">
            <BookOpen className="h-5 w-5 text-brand" />
            Planes
            <span className="rounded-full bg-choco/5 px-2.5 py-0.5 text-xs font-semibold text-choco-muted">
              {filteredPlans.length}
            </span>
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPlans.map((plan) => (
              <a
                key={plan.slug}
                href={`/planes/${plan.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-choco/5"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-sand">
                  {plan.image ? (
                    <img
                      src={plan.image}
                      alt={plan.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand/10 to-brand/5">
                      <BookOpen className="h-8 w-8 text-brand/50" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="line-clamp-2 font-display text-lg font-semibold leading-snug text-choco transition-colors group-hover:text-brand-dark">
                    {plan.title}
                  </h3>
                  {plan.summary && (
                    <p className="line-clamp-2 text-sm text-choco-muted">{plan.summary}</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}