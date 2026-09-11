"use client";

import { useState, useMemo } from "react";
import { Search, Mountain, MapPin } from "lucide-react";
import { RouteCard } from "@/components/route-card";
import type { RouteItem } from "@/lib/types";

const ROUTE_TYPES = [
  { value: "", label: "Todos" },
  { value: "senderismo", label: "Senderismo" },
  { value: "excursion", label: "Excursiones" },
  { value: "cultural", label: "Cultural" },
  { value: "bici", label: "Bici" },
  { value: "coche", label: "En coche" },
  { value: "camino_natural", label: "Camino natural" },
  { value: "camino_santiago", label: "Camino de Santiago" },
  { value: "en_familia", label: "En familia" },
  { value: "aventura", label: "Aventura" },
  { value: "gastronomica", label: "Gastronómica" },
];

const DIFFICULTY_OPTIONS = [
  { value: "", label: "Cualquier dificultad" },
  { value: "fácil", label: "Fácil" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
];

export function RouteListView({ routes }: { routes: RouteItem[] }) {
  const [q, setQ] = useState("");
  const [routeType, setRouteType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [variant, setVariant] = useState<"grid" | "row">("grid");
  const term = q.trim().toLowerCase();

  const filtered = useMemo(() => {
    return routes.filter((r) => {
      if (routeType && r.routeType !== routeType) return false;
      if (difficulty && r.difficulty !== difficulty) return false;
      if (term) {
        const haystack = `${r.title} ${r.description ?? ""} ${r.summary ?? ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [routes, q, routeType, difficulty, term]);

  return (
    <div>
      <div className="mb-6 rounded-2xl border border-sand bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-choco-muted" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar ruta, sendero, excursión…"
              className="w-full rounded-full border border-sand bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={routeType}
              onChange={(e) => setRouteType(e.target.value)}
              className="rounded-full border border-sand bg-white px-4 py-2.5 text-sm font-medium outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            >
              {ROUTE_TYPES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="rounded-full border border-sand bg-white px-4 py-2.5 text-sm font-medium outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            >
              {DIFFICULTY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden gap-1 sm:flex">
            <button
              onClick={() => setVariant("grid")}
              className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                variant === "grid" ? "bg-choco text-cream" : "border border-sand text-choco-muted hover:bg-sand"
              }`}
            >
              Cuadrícula
            </button>
            <button
              onClick={() => setVariant("row")}
              className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                variant === "row" ? "bg-choco text-cream" : "border border-sand text-choco-muted hover:bg-sand"
              }`}
            >
              Lista
            </button>
          </div>
        </div>
      </div>

      <p className="mb-4 text-sm text-choco-muted">
        <Mountain className="mr-1 inline h-4 w-4" />
        {filtered.length} {filtered.length === 1 ? "ruta" : "rutas"}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sand bg-sand/40 p-12 text-center">
          <p className="font-display text-xl font-semibold text-choco">
            No se encontraron rutas
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
            <RouteCard key={r.id} route={r} variant={variant} />
          ))}
        </div>
      )}
    </div>
  );
}