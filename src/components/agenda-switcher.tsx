"use client";

import { useState, type ReactNode } from "react";
import { LayoutList, Map as MapIcon } from "lucide-react";
import { MapView, type MapPoint } from "./map-view";

export function AgendaSwitcher({
  count,
  points,
  children,
}: {
  count: number;
  points: MapPoint[];
  children: ReactNode;
}) {
  const [view, setView] = useState<"list" | "map">("list");

  const tab = (value: "list" | "map", label: string, Icon: typeof MapIcon) => (
    <button
      type="button"
      onClick={() => setView(value)}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
        view === value
          ? "bg-choco text-cream"
          : "border border-sand bg-white text-choco-muted hover:bg-sand"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );

  return (
    <div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-choco-muted">
          {count} {count === 1 ? "evento" : "eventos"}
          {view === "map"
            ? ` · ${points.length} con mapa`
            : " en la agenda"}
        </p>
        <div className="flex items-center gap-2">
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
          <div className="flex flex-col gap-3">{children}</div>
        )}
      </div>
    </div>
  );
}
