"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteRouteById, type ActionResult } from "@/lib/actions";
import type { RouteItem } from "@/lib/types";

const btnGhost =
  "rounded-lg px-2 py-1 text-xs font-medium text-choco-muted transition hover:bg-choco/5 hover:text-choco";
const btnDanger =
  "rounded-lg px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700";

export function RoutesTable({ routes }: { routes: RouteItem[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [globalError, setGlobalError] = useState<string | null>(null);

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
        {routes.length === 0 && (
          <li className="p-10 text-center text-sm text-choco-muted">
            No hay rutas todavía. Usa las fuentes o crea una nueva.
          </li>
        )}
        {routes.map((route) => (
          <li key={route.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-sand">
              {route.image ? (
                <img src={route.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="grid h-full w-full place-items-center text-xs font-bold text-choco-muted">
                  {route.title.charAt(0)}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-choco">{route.title}</p>
              <p className="text-xs text-choco-muted">
                {route.routeType ?? "Sin tipo"}
                {route.distanceKm ? ` · ${route.distanceKm} km` : ""}
                {route.difficulty ? ` · ${route.difficulty}` : ""}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                route.status === "published"
                  ? "bg-green-100 text-green-700"
                  : "bg-choco/10 text-choco-muted"
              }`}
            >
              {route.status === "published" ? "Publicado" : "Oculto"}
            </span>
            <div className="flex shrink-0 items-center gap-1">
              <Link href={`/admin/rutas/${route.id}`} className={btnGhost}>
                Editar
              </Link>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  if (window.confirm(`¿Eliminar "${route.title}"?`)) {
                    runMutation(() => deleteRouteById(route.id));
                  }
                }}
                className={btnDanger}
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}