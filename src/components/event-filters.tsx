"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import type { Category } from "@/lib/types";

const DATE_OPTIONS = [
  { value: "", label: "Todas las fechas" },
  { value: "hoy", label: "Hoy" },
  { value: "7d", label: "Próximos 7 días" },
  { value: "finde", label: "Este fin de semana" },
  { value: "mes", label: "Este mes" },
];

export function EventFilters({
  categories,
  activeCategory,
  activeDesde,
  activeQ,
}: {
  categories: Category[];
  activeCategory: string;
  activeDesde: string;
  activeQ: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(activeQ);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const next = new URLSearchParams(searchParams.toString());
      if (query.trim()) next.set("q", query.trim());
      else next.delete("q");
      const qs = next.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    }, 350);
    return () => clearTimeout(timeout);
  }, [query, pathname, router, searchParams]);

  function update(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-choco-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar conciertos, teatro, exposiciones…"
            className="w-full rounded-full border border-sand bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <select
          value={activeDesde}
          onChange={(event) => update("desde", event.target.value)}
          className="rounded-full border border-sand bg-white px-4 py-2.5 text-sm font-medium outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
        >
          {DATE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => update("categoria", "")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            !activeCategory
              ? "bg-choco text-cream"
              : "border border-sand bg-white text-choco-muted hover:bg-sand"
          }`}
        >
          Todo
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => update("categoria", category.slug)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
              activeCategory === category.slug
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
  );
}
