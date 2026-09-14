"use client";

import { useActionState } from "react";
import { createRestaurantAction, updateRestaurantAction } from "@/lib/actions";
import type { RestaurantItem } from "@/lib/types";

const inputCls =
  "w-full rounded-lg border border-choco/20 bg-white px-3 py-2 text-sm text-choco dark:text-ink placeholder:text-choco-muted/50 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";
const btnPrimary =
  "rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-brand-dark disabled:opacity-60";

export function RestaurantForm({ restaurant }: { restaurant?: RestaurantItem }) {
  const isEdit = Boolean(restaurant);
  const action = isEdit ? updateRestaurantAction : createRestaurantAction;
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-5">
      {restaurant && <input type="hidden" name="id" value={restaurant.id} />}
      {state?.error && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
              Nombre *
            </span>
            <input
              name="name"
              type="text"
              required
              defaultValue={restaurant?.name}
              placeholder="Ej. Restaurante Vianetto"
              className={inputCls}
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Tipo de cocina
          </span>
          <input
            name="cuisine_type"
            type="text"
            defaultValue={restaurant?.cuisineType ?? undefined}
            placeholder="Ej. Aragonesa, Mediterránea, Asiática…"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Precio
          </span>
          <input
            name="price_range"
            type="text"
            defaultValue={restaurant?.priceRange ?? undefined}
            placeholder="Ej. 25-40 € / €€"
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
            defaultValue={restaurant?.address ?? undefined}
            placeholder="Ej. Calle Zaragoza 45"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Teléfono
          </span>
          <input
            name="phone"
            type="text"
            defaultValue={restaurant?.phone ?? undefined}
            placeholder="Ej. 974 22 33 44"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Email
          </span>
          <input
            name="email"
            type="email"
            defaultValue={restaurant?.email ?? undefined}
            placeholder="hola@restaurante.com"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Sitio web
          </span>
          <input
            name="website"
            type="url"
            defaultValue={restaurant?.website ?? undefined}
            placeholder="https://…"
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
            defaultValue={restaurant?.image ?? undefined}
            placeholder="https://…"
            className={inputCls}
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
              Latitud
            </span>
            <input
              name="lat"
              type="number"
              step="any"
              defaultValue={restaurant?.lat ?? undefined}
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
              defaultValue={restaurant?.lng ?? undefined}
              placeholder="-0.4088"
              className={inputCls}
            />
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Valoración
          </span>
          <input
            name="rating"
            type="number"
            step="0.1"
            min="0"
            max="5"
            defaultValue={restaurant?.rating ?? undefined}
            placeholder="Ej. 4.3"
            className={inputCls}
          />
        </label>

        <div className="sm:col-span-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
              Descripción
            </span>
            <textarea
              name="description"
              rows={4}
              defaultValue={restaurant?.description ?? undefined}
              placeholder="Describe el restaurante, su especialidad, ambiente…"
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
            defaultValue={restaurant?.slug}
            placeholder="Se genera automáticamente desde el nombre"
            className={inputCls}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Estado
          </span>
          <select name="status" defaultValue={restaurant?.status ?? "published"} className={inputCls}>
            <option value="published">Publicado</option>
            <option value="hidden">Oculto</option>
          </select>
        </label>
      </div>

      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear restaurante"}
      </button>
    </form>
  );
}