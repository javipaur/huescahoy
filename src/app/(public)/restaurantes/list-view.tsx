"use client";

import { useState, useMemo } from "react";
import { Search, MapPin } from "lucide-react";
import { RestaurantCard } from "@/components/restaurant-card";
import type { RestaurantItem } from "@/lib/types";

const CUISINE_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "Restaurante", label: "Restaurantes" },
  { value: "Bar / Cafetería", label: "Bares y Cafeterías" },
  { value: "Taberna", label: "Tabernas" },
  { value: "Pizzería", label: "Pizzerías" },
  { value: "Asador", label: "Asadores" },
];

export function RestaurantListView({ restaurants }: { restaurants: RestaurantItem[] }) {
  const [q, setQ] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [variant, setVariant] = useState<"grid" | "row">("grid");
  const term = q.trim().toLowerCase();

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      if (cuisine && r.cuisineType !== cuisine) return false;
      if (term) {
        const haystack = `${r.name} ${r.description ?? ""} ${r.address ?? ""} ${r.cuisineType ?? ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [restaurants, q, cuisine, term]);

  return (
    <div>
      <div className="mb-6 rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-choco-muted" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar restaurante, dirección, tipo de cocina…"
              className="w-full rounded-full border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <select
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="rounded-full border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 px-4 py-2.5 text-sm font-medium outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          >
            {CUISINE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <div className="hidden gap-1 sm:flex">
            <button
              onClick={() => setVariant("grid")}
              className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                variant === "grid" ? "bg-choco dark:bg-ink text-white" : "border border-sand text-choco-muted hover:bg-sand"
              }`}
            >
              Cuadrícula
            </button>
            <button
              onClick={() => setVariant("row")}
              className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                variant === "row" ? "bg-choco dark:bg-ink text-white" : "border border-sand text-choco-muted hover:bg-sand"
              }`}
            >
              Lista
            </button>
          </div>
        </div>
      </div>

      <p className="mb-4 text-sm text-choco-muted">
        <MapPin className="mr-1 inline h-4 w-4" />
        {filtered.length} {filtered.length === 1 ? "restaurante" : "restaurantes"}
      </p>

      {restaurants.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sand bg-sand/40 p-12 text-center">
          <p className="font-display text-xl font-semibold text-choco">
            Estamos recopilando los restaurantes de Huesca
          </p>
          <p className="mx-auto mt-2 max-w-md text-choco-muted">
            Estamos incorporando los restaurantes, bares y cafeterías de Huesca
            y su provincia. Vuelve en unos días o échale un vistazo a la agenda
            cultural mientras tanto.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sand bg-sand/40 p-12 text-center">
          <p className="font-display text-xl font-semibold text-choco">
            No se encontraron restaurantes
          </p>
          <p className="mt-2 text-choco-muted">
            Prueba con otros filtros o términos de búsqueda.
          </p>
        </div>
      ) : (
        <div
          className={
            variant === "grid"
              ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col gap-3"
          }
        >
          {filtered.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} variant={variant} />
          ))}
        </div>
      )}
    </div>
  );
}