"use client";

import { useActionState } from "react";
import { createEventAction, updateEventAction } from "@/lib/actions";
import type { Category, EventItem } from "@/lib/types";

const inputCls =
  "w-full rounded-lg border border-choco/20 bg-white px-3 py-2 text-sm text-choco placeholder:text-choco-muted/50 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";
const btnPrimary =
  "rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-brand-dark disabled:opacity-60";

export function EventForm({
  categories,
  event,
}: {
  categories: Category[];
  event?: EventItem;
}) {
  const isEdit = Boolean(event);
  const action = isEdit ? updateEventAction : createEventAction;
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      {event && <input type="hidden" name="id" value={event.id} />}
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
              defaultValue={event?.title}
              placeholder="Ej. Concierto en el Teatro Olimpia"
              className={inputCls}
            />
          </label>
        </div>

        <div className="sm:col-span-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
              Categoría
            </span>
            <select
              name="category_id"
              defaultValue={event?.categoryId ?? ""}
              className={inputCls}
            >
              <option value="">Sin categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Fecha de inicio *
          </span>
          <input
            name="start_date"
            type="date"
            required
            defaultValue={event?.startDate}
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Fecha de fin
          </span>
          <input
            name="end_date"
            type="date"
            defaultValue={event?.endDate ?? undefined}
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Hora de inicio
          </span>
          <input
            name="start_time"
            type="time"
            defaultValue={event?.startTime ?? undefined}
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Hora de fin
          </span>
          <input
            name="end_time"
            type="time"
            defaultValue={event?.endTime ?? undefined}
            className={inputCls}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Lugar
          </span>
          <input
            name="location"
            type="text"
            defaultValue={event?.location ?? undefined}
            placeholder="Ej. Teatro Olimpia"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Dirección
          </span>
          <input
            name="address"
            type="text"
            defaultValue={event?.address ?? undefined}
            placeholder="Ej. Calle Perena 10"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Precio
          </span>
          <input
            name="price"
            type="text"
            defaultValue={event?.price ?? undefined}
            placeholder="Ej. 12 € / Entrada gratuita"
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
            defaultValue={event?.image ?? undefined}
            placeholder="https://…"
            className={inputCls}
          />
        </label>

        <div className="sm:col-span-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
              Enlace oficial (venta de entradas, más info…)
            </span>
            <input
              name="external_url"
              type="url"
              defaultValue={event?.externalUrl ?? undefined}
              placeholder="https://…"
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
              defaultValue={event?.description ?? undefined}
              placeholder="Describe el evento…"
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
            defaultValue={event?.slug}
            placeholder="Se genera automáticamente desde el título"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Estado
          </span>
          <select name="status" defaultValue={event?.status ?? "published"} className={inputCls}>
            <option value="published">Publicado</option>
            <option value="hidden">Oculto</option>
          </select>
        </label>

        <label className="flex flex-wrap items-center gap-2 text-sm text-choco sm:col-span-2">
          <input
            name="featured"
            type="checkbox"
            defaultChecked={event?.featured === 1}
            className="h-4 w-4 rounded accent-brand"
          />
          <span>
            Recomendado por HuescaHoy
            <span className="ml-1 text-xs text-choco-muted/70">
              — aparece en la sección recomendada de la portada
            </span>
          </span>
        </label>
      </div>

      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear evento"}
      </button>
    </form>
  );
}
