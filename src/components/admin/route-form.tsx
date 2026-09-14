"use client";

import { useActionState } from "react";
import { createRouteAction, updateRouteAction } from "@/lib/actions";
import type { RouteItem } from "@/lib/types";

const inputCls =
  "w-full rounded-lg border border-choco/20 bg-white px-3 py-2 text-sm text-choco dark:text-ink placeholder:text-choco-muted/50 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";
const btnPrimary =
  "rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-brand-dark disabled:opacity-60";

const ROUTE_TYPE_OPTIONS = [
  "",
  "senderismo",
  "excursion",
  "cultural",
  "bici",
  "coche",
  "camino_natural",
  "camino_santiago",
  "en_familia",
  "aventura",
  "gastronomica",
];

export function RouteForm({ route }: { route?: RouteItem }) {
  const isEdit = Boolean(route);
  const action = isEdit ? updateRouteAction : createRouteAction;
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      {route && <input type="hidden" name="id" value={route.id} />}
      {state?.error && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
              Título *
            </span>
            <input
              name="title"
              type="text"
              required
              defaultValue={route?.title}
              placeholder="Ej. Camino de Santiago por Huesca"
              className={inputCls}
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Tipo de ruta
          </span>
          <select name="route_type" defaultValue={route?.routeType ?? ""} className={inputCls}>
            {ROUTE_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option === "" ? "Sin tipo" : option}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Dificultad
          </span>
          <select name="difficulty" defaultValue={route?.difficulty ?? ""} className={inputCls}>
            <option value="">Sin especificar</option>
            <option value="fácil">Fácil</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Distancia (km)
          </span>
          <input
            name="distance_km"
            type="number"
            step="0.1"
            defaultValue={route?.distanceKm ?? undefined}
            placeholder="Ej. 12.5"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Desnivel (m)
          </span>
          <input
            name="elevation_m"
            type="number"
            step="1"
            defaultValue={route?.elevationM ?? undefined}
            placeholder="Ej. 450"
            className={inputCls}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Nº de etapas
          </span>
          <input
            name="stages_count"
            type="number"
            min="0"
            defaultValue={route?.stagesCount ?? undefined}
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Imagen (URL)
          </span>
          <input
            name="image"
            type="url"
            defaultValue={route?.image ?? undefined}
            placeholder="https://…"
            className={inputCls}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Latitud
          </span>
          <input
            name="lat"
            type="number"
            step="any"
            defaultValue={route?.lat ?? undefined}
            placeholder="42.1390"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Longitud
          </span>
          <input
            name="lng"
            type="number"
            step="any"
            defaultValue={route?.lng ?? undefined}
            placeholder="-0.4088"
            className={inputCls}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            URL GPX
          </span>
          <input
            name="gpx_url"
            type="url"
            defaultValue={route?.gpxUrl ?? undefined}
            placeholder="https://…tracks.gpx"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Enlace original
          </span>
          <input
            name="external_url"
            type="url"
            defaultValue={route?.externalUrl ?? undefined}
            placeholder="https://…"
            className={inputCls}
          />
        </label>

        <div className="sm:col-span-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
              Resumen
            </span>
            <textarea
              name="summary"
              rows={2}
              defaultValue={route?.summary ?? undefined}
              placeholder="Resumen breve para las tarjetas"
              className={inputCls}
            />
          </label>
        </div>

        <div className="sm:col-span-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
              Descripción
            </span>
            <textarea
              name="description"
              rows={5}
              defaultValue={route?.description ?? undefined}
              placeholder="Describe la ruta: recorrido, puntos de interés…"
              className={inputCls}
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Identificador (slug)
          </span>
          <input
            name="slug"
            type="text"
            defaultValue={route?.slug}
            placeholder="Se genera automáticamente desde el título"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Estado
          </span>
          <select name="status" defaultValue={route?.status ?? "published"} className={inputCls}>
            <option value="published">Publicado</option>
            <option value="hidden">Oculto</option>
          </select>
        </label>
      </div>

      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear ruta"}
      </button>
    </form>
  );
}