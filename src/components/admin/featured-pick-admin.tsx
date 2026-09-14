"use client";

import { useActionState } from "react";
import { Sparkles } from "lucide-react";
import { saveFeaturedPickAction } from "@/lib/actions";
import type { FeaturedPick } from "@/lib/types";

const inputCls =
  "w-full rounded-lg border border-choco/20 bg-white px-3 py-2 text-sm text-choco dark:text-ink placeholder:text-choco-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";

function FormMessage({ message }: { message?: string }) {
  if (!message) return null;
  const isError = message.startsWith("Error") || message.includes("obligatorio") || message.includes("No existe");
  return (
    <p
      className={`rounded-lg border px-3 py-2 text-sm ${
        isError
          ? "border-red-300 bg-red-50 text-red-700"
          : "border-green-300 bg-green-50 text-green-700"
      }`}
    >
      {message}
    </p>
  );
}

export function FeaturedPickAdmin({ pick }: { pick: FeaturedPick | null }) {
  const [state, formAction, pending] = useActionState(saveFeaturedPickAction, undefined);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand">
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <p className="font-medium text-choco">El plan del finde</p>
          <p className="text-xs text-choco-muted">
            Bloque editorial destacado en la portada: una imagen, un titular y un enlace
            a un evento o plan.
          </p>
        </div>
      </div>

      <form action={formAction} className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-2">
          <input
            name="active"
            type="checkbox"
            defaultChecked={(pick?.active ?? 1) === 1}
            className="h-4 w-4 rounded border-choco/30 accent-brand"
          />
          <span className="text-sm font-medium text-choco">Visible en la portada</span>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Etiqueta
          </span>
          <input
            name="label"
            type="text"
            maxLength={40}
            defaultValue={pick?.label ?? "El plan del finde"}
            className={inputCls}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Enlaza a *
          </span>
          <select
            name="link_type"
            defaultValue={pick?.linkType ?? "evento"}
            className={inputCls}
          >
            <option value="evento">Un evento</option>
            <option value="plan">Un plan</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Slug del evento/plan *
          </span>
          <input
            name="target_slug"
            type="text"
            required
            defaultValue={pick?.targetSlug ?? ""}
            placeholder="Ej. concierto-de-ayerbe"
            className={inputCls}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Título *
          </span>
          <input
            name="title"
            type="text"
            required
            maxLength={120}
            defaultValue={pick?.title ?? ""}
            placeholder="Ej. Pintar y vino en La Pso"
            className={inputCls}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Subtítulo (opcional)
          </span>
          <input
            name="tagline"
            type="text"
            maxLength={120}
            defaultValue={pick?.tagline ?? ""}
            placeholder="Ej. La cita perfecta del sábado por la mañana"
            className={inputCls}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Por qué lo recomendamos (opcional)
          </span>
          <textarea
            name="reason"
            rows={2}
            maxLength={300}
            defaultValue={pick?.reason ?? ""}
            placeholder="Una frase que invite a entrar."
            className={inputCls}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
            Imagen (opcional)
          </span>
          <input
            name="image_url"
            type="url"
            defaultValue={pick?.imageUrl ?? ""}
            placeholder="Si la dejas vacía se usa la del evento o plan enlazado."
            className={inputCls}
          />
        </label>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-brand-dark disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            {pending ? "Guardando..." : "Guardar plan del finde"}
          </button>
        </div>
      </form>

      <FormMessage message={state?.error ?? state?.summary} />
    </div>
  );
}
