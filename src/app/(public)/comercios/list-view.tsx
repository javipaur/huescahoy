"use client";

import { useMemo, useState } from "react";
import { ExternalLink, MapPin, Search, Store } from "lucide-react";

type Shop = {
  slug: string;
  name: string;
  category: string;
  address: string;
  description: string;
  source: string;
  sourceUrl: string;
};

export function ComerciosListView({ shops }: { shops: Shop[] }) {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of shops) {
      if (!s.category) continue;
      counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"));
  }, [shops]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return shops.filter((s) => {
      if (category && s.category !== category) return false;
      if (term) {
        const hay = `${s.name} ${s.category} ${s.address} ${s.description}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [shops, q, category]);

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
              placeholder="Buscar comercio, categoría o dirección…"
              className="w-full rounded-full border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-full border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 px-4 py-2.5 text-sm font-medium outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 sm:max-w-xs"
          >
            <option value="">Todas las categorías</option>
            {categories.map(([name, count]) => (
              <option key={name} value={name}>
                {name} ({count})
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setCategory("")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${!category ? "bg-brand text-white" : "border border-sand text-choco-muted hover:bg-sand"}`}
          >
            Todos
          </button>
          {categories.slice(0, 10).map(([name]) => (
            <button
              key={name}
              onClick={() => setCategory(name)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${category === name ? "bg-brand text-white" : "border border-sand text-choco-muted hover:bg-sand"}`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-4 text-sm text-choco-muted">
        <Store className="mr-1 inline h-4 w-4" />
        {filtered.length} {filtered.length === 1 ? "comercio" : "comercios"}
        {category ? ` en “${category}”` : ""}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sand bg-sand/40 p-12 text-center">
          <p className="font-display text-xl font-semibold text-choco dark:text-ink">No se encontraron comercios</p>
          <p className="mt-2 text-choco-muted">Prueba con otros filtros o términos de búsqueda.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <article key={s.slug} className="flex flex-col rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5 shadow-sm">
              <span className="inline-flex w-fit rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand-dark">
                {s.category || "Comercio"}
              </span>
              <h3 className="mt-3 font-display text-lg font-bold leading-snug text-choco dark:text-ink">{s.name}</h3>
              {s.address ? (
                <p className="mt-2 flex items-start gap-1.5 text-sm text-choco-muted">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <span>{s.address}</span>
                </p>
              ) : null}
              {s.description ? (
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-choco-muted">{s.description}</p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-3 pt-1">
                <a
                  href={s.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-brand-dark hover:underline"
                >
                  Ver ficha <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
