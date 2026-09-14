"use client";

import type { ReactNode } from "react";
import { LayoutGrid, LayoutList, Map as MapIcon } from "lucide-react";
import { MapView, type MapPoint } from "./map-view";

export type AgendaViewMode = "grid" | "list" | "map";

export function AgendaSwitcher({
  count,
  points,
  view,
  onViewChange,
  children,
}: {
  count: number;
  points: MapPoint[];
  view: AgendaViewMode;
  onViewChange: (view: AgendaViewMode) => void;
  children: ReactNode;
}) {
  const tab = (value: AgendaViewMode, label: string, Icon: typeof MapIcon) => (
    <button
      type="button"
      onClick={() => onViewChange(value)}
      aria-pressed={view === value}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
        view === value
          ? "bg-choco dark:bg-ink text-white shadow-sm"
          : "text-choco-muted hover:text-choco dark:text-ink"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  return (
    <div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="rounded-full bg-choco/5 px-3.5 py-1.5 text-sm font-semibold text-choco-muted">
          {count} {count === 1 ? "evento" : "eventos"}
          {view === "map" ? ` · ${points.length} con mapa` : " en la agenda"}
        </p>
        <div className="flex items-center gap-1 rounded-full border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 p-1 shadow-sm">
          {tab("grid", "Tarjetas", LayoutGrid)}
          {tab("list", "Lista", LayoutList)}
          {tab("map", "Mapa", MapIcon)}
        </div>
      </div>

      <div className="mt-4">
        {view === "map" ? (
          points.length > 0 ? (
            <MapView points={points} />
          ) : (
            <div className="rounded-2xl border border-dashed border-sand bg-sand/40 p-12 text-center">
              <p className="font-display text-lg font-semibold text-choco">
                No hay eventos con ubicación en el mapa
              </p>
              <p className="mt-2 text-sm text-choco-muted">
                Prueba con otros filtros para ver más resultados.
              </p>
            </div>
          )
        ) : (
          children
        )}
      </div>
    </div>
  );
}
