"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EventCard } from "@/components/event-card";
import {
  agendaEventsFor,
  dayTabs,
  FINDE,
  findeLabel,
  isFinde,
} from "@/lib/home-agenda";
import { formatDayLong } from "@/lib/format";
import type { Category, EventItem } from "@/lib/types";

export function HomeAgenda({
  events,
  categories,
  initialDay,
  initialCategory = "",
}: {
  events: EventItem[];
  categories: Category[];
  initialDay: string;
  initialCategory?: string;
}) {
  const today = initialDay;
  const [day, setDay] = useState(initialDay);
  const [categoria, setCategoria] = useState(initialCategory);

  const tabs = useMemo(() => dayTabs(events, today), [events, today]);
  const selected = useMemo(
    () => agendaEventsFor(events, day, categoria, categories, today),
    [events, day, categoria, categories, today]
  );

  const dayChip = (value: string, label: string) => (
    <button
      key={value}
      type="button"
      onClick={() => setDay(value)}
      aria-pressed={day === value}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
        day === value
          ? "bg-brand text-white shadow-sm shadow-brand/30"
          : "border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 text-choco-muted hover:border-brand/40 hover:text-choco dark:hover:text-ink"
      }`}
    >
      {label}
    </button>
  );

  const categoryChipClass = (active: boolean) =>
    `shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
      active
        ? "bg-choco text-white dark:bg-ink"
        : "border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 text-choco-muted hover:bg-sand"
    }`;

  const heading = isFinde(day) ? "Este fin de semana" : formatDayLong(day);

  return (
    <div>
      <div className="rounded-2xl border border-sand bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
        <div className="flex flex-col gap-4">
          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-choco-muted">
              Saltar al día
            </span>
            <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {tabs.map((tab) => dayChip(tab.value, tab.label))}
              {dayChip(FINDE, findeLabel(today))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-sand pt-4 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setCategoria("")}
              aria-pressed={!categoria}
              className={categoryChipClass(!categoria)}
            >
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full border border-current opacity-50" />
                Todo
              </span>
            </button>
            {categories.map((category) => {
              const active = categoria === category.slug;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setCategoria(active ? "" : category.slug)}
                  aria-pressed={active}
                  className={categoryChipClass(active)}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6">
        {selected.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sand bg-sand/40 p-12 text-center">
            <p className="font-display text-xl font-semibold text-choco">
              Nada agendado para este día
            </p>
            <p className="mt-2 text-choco-muted">
              Prueba otro día, quita el filtro de categoría o mira la agenda completa.
            </p>
            <Link
              href="/agenda"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark"
            >
              Ver toda la agenda <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="sticky top-16 z-30 -mx-1 mb-3 flex items-center gap-2 rounded-full border border-sand bg-cream/90 px-4 py-1.5 shadow-sm backdrop-blur sm:mx-0 dark:border-zinc-800 dark:bg-zinc-900/90">
              <span className="h-2 w-2 shrink-0 rounded-full bg-brand" />
              <span className="font-display text-sm font-bold tracking-tight text-choco sm:text-base dark:text-ink">
                {heading}
              </span>
              {isFinde(day) && (
                <span className="hidden text-sm text-choco-muted sm:inline">
                  · {findeLabel(today)}
                </span>
              )}
              <span className="ml-auto rounded-full bg-choco/5 px-2.5 py-0.5 text-xs font-semibold text-choco-muted">
                {selected.length} {selected.length === 1 ? "evento" : "eventos"}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {selected.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  category={
                    event.categoryId
                      ? categories.find((category) => category.id === event.categoryId) ?? null
                      : null
                  }
                  variant="row"
                />
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/agenda"
                className="inline-flex items-center gap-2 rounded-full bg-choco px-7 py-3 font-semibold text-white shadow-sm transition hover:bg-brand dark:bg-ink"
              >
                Ver toda la agenda <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}