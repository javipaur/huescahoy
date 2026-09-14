"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import type { ReactNode } from "react";
import {
  createPlanAction,
  deletePlanById,
  togglePlanPublishedById,
  updatePlanAction,
  type ActionResult,
} from "@/lib/actions";
import type { Plan } from "@/lib/types";

const inputCls =
  "w-full rounded-lg border border-choco/20 bg-white px-3 py-2 text-sm text-choco dark:text-ink placeholder:text-choco-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";
const btnPrimary =
  "rounded-full bg-brand px-4 py-2 text-sm font-semibold text-cream transition hover:bg-brand-dark disabled:opacity-60";
const btnSecondary =
  "rounded-full border border-choco/15 bg-white/70 px-4 py-2 text-sm font-medium text-choco dark:text-ink transition hover:bg-white";
const btnGhost =
  "rounded-lg px-2 py-1 text-xs font-medium text-choco-muted transition hover:bg-choco/5 hover:text-choco dark:text-ink";
const btnDanger =
  "rounded-lg px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-choco-muted">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-choco-muted">{hint}</span>}
    </label>
  );
}

function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </p>
  );
}

function useFormDone(state: ActionResult | undefined, onDone: () => void) {
  useEffect(() => {
    if (state !== undefined && !state.error) onDone();
  }, [state, onDone]);
}

function PlanFields({ plan }: { plan?: Plan }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Título *">
        <input
          name="title"
          type="text"
          required
          defaultValue={plan?.title}
          placeholder="Ej. Un día completo por el Casco Antiguo"
          className={inputCls}
        />
      </Field>
      <Field label="Identificador (slug)" hint="En blanco se genera automáticamente.">
        <input
          name="slug"
          type="text"
          defaultValue={plan?.slug}
          placeholder="un-dia-por-el-casco"
          className={inputCls}
        />
      </Field>
      <Field label="Resumen" hint="Máximo 300 caracteres. Se muestra en la lista.">
        <textarea
          name="summary"
          rows={2}
          maxLength={300}
          defaultValue={plan?.summary ?? ""}
          placeholder="En una frase, de qué va este plan."
          className={inputCls}
        />
      </Field>
      <Field label="Imagen" hint="URL de una imagen (opcional).">
        <input
          name="image"
          type="url"
          defaultValue={plan?.image ?? ""}
          placeholder="https://…"
          className={inputCls}
        />
      </Field>
      <Field label="Orden">
        <input
          name="sort_order"
          type="number"
          min={0}
          defaultValue={plan?.sortOrder ?? 0}
          className={inputCls}
        />
      </Field>
      <label className="flex items-end gap-2 pb-2 text-sm text-choco dark:text-ink">
        <input
          name="published"
          type="checkbox"
          defaultChecked={plan ? plan.published === 1 : true}
          className="h-4 w-4 rounded accent-brand"
        />
        <span>
          Publicado
          <span className="ml-1 text-xs text-choco-muted">(visible en la web)</span>
        </span>
      </label>
      <div className="sm:col-span-2">
        <Field label="Contenido *" hint="Los saltos de línea se respetan en la web.">
          <textarea
            name="body"
            rows={12}
            required
            defaultValue={plan?.body}
            placeholder="Cuenta el plan paso a paso…"
            className={inputCls}
          />
        </Field>
      </div>
    </div>
  );
}

function AddPlanForm({ onDone }: { onDone: () => void }) {
  const [state, action, pending] = useActionState(createPlanAction, undefined);
  useFormDone(state, onDone);

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-choco/10 bg-white/70 p-5">
      <FormError message={state?.error} />
      <PlanFields />
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending ? "Guardando..." : "Añadir plan"}
        </button>
        <button type="button" onClick={onDone} className={btnSecondary}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function EditPlanForm({ plan, onDone }: { plan: Plan; onDone: () => void }) {
  const [state, action, pending] = useActionState(updatePlanAction, undefined);
  useFormDone(state, onDone);

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-brand/40 bg-white/80 p-5">
      <input type="hidden" name="id" value={plan.id} />
      <FormError message={state?.error} />
      <PlanFields plan={plan} />
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending ? "Guardando..." : "Guardar cambios"}
        </button>
        <button type="button" onClick={onDone} className={btnSecondary}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function PlanesAdmin({ plans }: { plans: Plan[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-choco dark:text-ink">Planes</h1>
          <p className="mt-1 text-sm text-choco-muted">
            Guías y planes de la ciudad que se publican en /planes.
          </p>
        </div>
        {!showAdd && (
          <button type="button" onClick={() => setShowAdd(true)} className={btnPrimary}>
            + Añadir plan
          </button>
        )}
      </div>

      {globalError && (
        <div className="mt-6">
          <FormError message={globalError} />
        </div>
      )}

      {showAdd && (
        <div className="mt-6">
          <AddPlanForm onDone={() => setShowAdd(false)} />
        </div>
      )}

      <div className="mt-8 space-y-4">
        {plans.length === 0 && (
          <p className="rounded-2xl border border-dashed border-choco/20 bg-white/50 p-10 text-center text-sm text-choco-muted">
            Todavía no hay planes. Añade el primero con el botón de arriba.
          </p>
        )}

        {plans.map((plan) => {
          const isEditing = editingId === plan.id;
          return (
            <div key={plan.id} className="rounded-2xl border border-choco/10 bg-white/70">
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-bold text-choco">{plan.title}</h2>
                    {plan.source !== "manual" && (
                      <span className="shrink-0 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand-dark">
                        {plan.source === "dph-rutas" ? "Ruta DPH" : plan.source === "dph-actividades" ? "Actividad DPH" : plan.source}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-choco-muted">
                    /{plan.slug} · orden {plan.sortOrder}
                    {plan.summary ? ` · ${plan.summary}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      plan.published === 1
                        ? "bg-green-100 text-green-700"
                        : "bg-choco/10 dark:bg-ink/10 text-choco-muted"
                    }`}
                  >
                    {plan.published === 1 ? "Publicado" : "Borrador"}
                  </span>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => setEditingId(plan.id)}
                      className={btnGhost}
                    >
                      Editar
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => runMutation(() => togglePlanPublishedById(plan.id))}
                    className={btnGhost}
                  >
                    {plan.published === 1 ? "Ocultar" : "Publicar"}
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      if (window.confirm(`¿Eliminar el plan "${plan.title}"?`)) {
                        runMutation(() => deletePlanById(plan.id));
                      }
                    }}
                    className={btnDanger}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              {isEditing && (
                <div className="border-t border-choco/10 px-5 py-4">
                  <EditPlanForm plan={plan} onDone={() => setEditingId(null)} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
