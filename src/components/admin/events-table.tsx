"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  deleteEventById,
  toggleEventFeaturedById,
  toggleEventStatusById,
  type ActionResult,
} from "@/lib/actions";
import type { Category, EventItem } from "@/lib/types";
import { formatDayShort } from "@/lib/format";

const btnGhost =
  "rounded-lg px-2 py-1 text-xs font-medium text-choco-muted transition hover:bg-choco/5 hover:text-choco";
const btnPublish =
  "rounded-lg bg-brand px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-brand-dark";
const btnDanger =
  "rounded-lg px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700";

export function EventsTable({
  events,
  categories,
}: {
  events: EventItem[];
  categories: Category[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const categoryMap = new Map(categories.map((category) => [category.id, category]));

  function runMutation(action: () => Promise<ActionResult>) {
    startTransition(async () => {
      const result = await action();
      if (result?.error) setGlobalError(result.error);
      else {
        setGlobalError(null);
        router.refresh();
      }
    });
  }

  return (
    <div>
      {globalError && (
        <div className="mb-4">
          <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {globalError}
          </p>
        </div>
      )}

      <ul className="divide-y divide-choco/5 rounded-3xl border border-sand bg-white shadow-sm">
        {events.length === 0 && (
          <li className="p-10 text-center text-sm text-choco-muted">
            No hay eventos que coincidan.
          </li>
        )}
        {events.map((event) => {
          const category = event.categoryId
            ? categoryMap.get(event.categoryId)
            : undefined;
          return (
            <li key={event.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xs font-bold text-white"
                style={{ backgroundColor: category?.color ?? "#e8452c" }}
              >
                {formatDayShort(event.startDate).split(" ")[1]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-choco">{event.title}</p>
                <p className="text-xs text-choco-muted">
                  {formatDayShort(event.startDate)}
                  {event.startTime ? ` · ${event.startTime}` : ""}
                  {category ? ` · ${category.name}` : ""}
                  {event.featured === 1 ? " · ★ Recomendado" : ""}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  event.status === "published"
                    ? "bg-green-100 text-green-700"
                    : event.status === "pending"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-choco/10 text-choco-muted"
                }`}
              >
                {event.status === "published"
                  ? "Publicado"
                  : event.status === "pending"
                    ? "Pendiente"
                    : "Oculto"}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <Link href={`/admin/eventos/${event.id}`} className={btnGhost}>
                  Editar
                </Link>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => runMutation(() => toggleEventStatusById(event.id))}
                  className={event.status === "pending" ? btnPublish : btnGhost}
                >
                  {event.status === "pending"
                    ? "Aprobar y publicar"
                    : event.status === "published"
                      ? "Ocultar"
                      : "Publicar"}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => runMutation(() => toggleEventFeaturedById(event.id))}
                  className={btnGhost}
                >
                  {event.featured === 1 ? "Quitar rec." : "Recomendar"}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (window.confirm(`¿Eliminar "${event.title}"?`)) {
                      runMutation(() => deleteEventById(event.id));
                    }
                  }}
                  className={btnDanger}
                >
                  Eliminar
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
