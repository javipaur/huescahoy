"use client";

import { useMemo, useState } from "react";
import { Landmark, MapPin, Search } from "lucide-react";

type Poi = {
  name: string;
  category: string;
  locality: string;
  comarca: string;
  lat: string;
  lon: string;
};

export function PuntosInteresView({ items }: { items: Poi[] }) {
  const [q, setQ] = useState("");
  const [comarca, setComarca] = useState("");

  const comarcas = useMemo(() => {
    const counts = new Map<string, number>();
    for (const it of items) {
      if (!it.comarca) continue;
      counts.set(it.comarca, (counts.get(it.comarca) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"));
  }, [items]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((it) => {
      if (comarca && it.comarca !== comarca) return false;
      if (term) {
        const hay = `${it.name} ${it.category} ${it.locality} ${it.comarca}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [items, q, comarca]);

  const shown = filtered.slice(0, 60);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-choco-muted" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar punto de interés, localidad o categoría…"
            className="w-full rounded-full border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <select
          value={comarca}
          onChange={(e) => setComarca(e.target.value)}
          className="rounded-full border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 px-4 py-2.5 text-sm font-medium outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 sm:max-w-xs"
        >
          <option value="">Todas las comarcas</option>
          {comarcas.map(([name, count]) => (
            <option key={name} value={name}>
              {name} ({count})
            </option>
          ))}
        </select>
      </div>

      <p className="mb-3 text-sm text-choco-muted">
        <Landmark className="mr-1 inline h-4 w-4" />
        {filtered.length} {filtered.length === 1 ? "punto" : "puntos"}
        {comarca ? ` en ${comarca}` : ""}{filtered.length > shown.length ? ` · mostrando ${shown.length}` : ""}
      </p>

      {shown.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sand bg-sand/40 p-8 text-center text-choco-muted">
          No se encontraron puntos con esos filtros.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((it, i) => (
            <article key={`${it.name}-${it.locality}-${i}`} className="rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 p-4 shadow-sm">
              {it.category ? (
                <span className="inline-flex rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand-dark">
                  {it.category}
                </span>
              ) : null}
              <h3 className="mt-2 font-display text-base font-bold leading-snug text-choco dark:text-ink">{it.name}</h3>
              <p className="mt-1 flex items-start gap-1.5 text-sm text-choco-muted">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span>{[it.locality, it.comarca].filter(Boolean).join(" · ") || "Provincia de Huesca"}</span>
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
