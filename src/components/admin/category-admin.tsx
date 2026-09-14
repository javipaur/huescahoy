"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import type { ReactNode } from "react";
import {
  createCategoryAction,
  deleteCategoryById,
  updateCategoryAction,
  type ActionResult,
} from "@/lib/actions";
import type { Category } from "@/lib/types";
import { getIcon, ICON_OPTIONS } from "@/lib/icons";

const inputCls =
  "w-full rounded-lg border border-choco/20 bg-white px-3 py-2 text-sm text-choco dark:text-ink placeholder:text-choco-muted/50 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";
const btnPrimary =
  "rounded-full bg-brand px-4 py-2 text-sm font-semibold text-cream transition hover:bg-brand-dark disabled:opacity-60";
const btnSecondary =
  "rounded-full border border-choco/15 bg-white/70 px-4 py-2 text-sm font-medium text-choco dark:text-ink transition hover:bg-white";
const btnGhost =
  "rounded-lg px-2 py-1 text-xs font-medium text-choco-muted transition hover:bg-choco/5 hover:text-choco dark:text-ink";
const btnDanger =
  "rounded-lg px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700";

const COLORS = [
  "#e8452c",
  "#7c3aed",
  "#0ea5e9",
  "#16a34a",
  "#f59e0b",
  "#db2777",
  "#0d9488",
  "#64748b",
];

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
      {hint && <span className="mt-1 block text-xs text-choco-muted/70">{hint}</span>}
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

function IconSelect({ defaultValue, name }: { defaultValue: string; name: string }) {
  return (
    <select name={name} defaultValue={defaultValue} className={inputCls}>
      {ICON_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function ColorSelect({ defaultValue, name }: { defaultValue: string; name: string }) {
  return (
    <select name={name} defaultValue={defaultValue} className={inputCls}>
      {COLORS.map((color) => (
        <option key={color} value={color}>
          {color}
        </option>
      ))}
    </select>
  );
}

function AddCategoryForm({ onDone }: { onDone: () => void }) {
  const [state, action, pending] = useActionState(createCategoryAction, undefined);
  useFormDone(state, onDone);

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-choco/10 bg-white/70 p-5">
      <FormError message={state?.error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre *">
          <input name="name" type="text" required placeholder="Ej. Conciertos" className={inputCls} />
        </Field>
        <Field label="Identificador (slug)" hint="En blanco se genera automáticamente.">
          <input name="slug" type="text" placeholder="conciertos" className={inputCls} />
        </Field>
        <Field label="Icono">
          <IconSelect defaultValue="calendar" name="icon" />
        </Field>
        <Field label="Color">
          <ColorSelect defaultValue="#e8452c" name="color" />
        </Field>
        <Field label="Orden">
          <input name="sort_order" type="number" min={0} defaultValue={0} className={inputCls} />
        </Field>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending ? "Guardando..." : "Añadir categoría"}
        </button>
        <button type="button" onClick={onDone} className={btnSecondary}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function EditCategoryForm({ category, onDone }: { category: Category; onDone: () => void }) {
  const [state, action, pending] = useActionState(updateCategoryAction, undefined);
  useFormDone(state, onDone);

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-brand/40 bg-white/80 p-5">
      <input type="hidden" name="id" value={category.id} />
      <FormError message={state?.error} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre *">
          <input name="name" type="text" required defaultValue={category.name} className={inputCls} />
        </Field>
        <Field label="Identificador (slug)">
          <input name="slug" type="text" defaultValue={category.slug} className={inputCls} />
        </Field>
        <Field label="Icono">
          <IconSelect defaultValue={category.icon} name="icon" />
        </Field>
        <Field label="Color">
          <ColorSelect defaultValue={category.color} name="color" />
        </Field>
        <Field label="Orden">
          <input name="sort_order" type="number" min={0} defaultValue={category.sort_order} className={inputCls} />
        </Field>
      </div>
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

export default function CategoryAdmin({ categories }: { categories: Category[] }) {
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
          <h1 className="font-display text-2xl font-bold text-choco dark:text-ink">Categorías</h1>
          <p className="mt-1 text-sm text-choco-muted">
            Las secciones en las que se agrupan los eventos.
          </p>
        </div>
        {!showAdd && (
          <button type="button" onClick={() => setShowAdd(true)} className={btnPrimary}>
            + Añadir categoría
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
          <AddCategoryForm onDone={() => setShowAdd(false)} />
        </div>
      )}

      <div className="mt-8 space-y-4">
        {categories.length === 0 && (
          <p className="rounded-2xl border border-dashed border-choco/20 bg-white/50 p-10 text-center text-sm text-choco-muted">
            Todavía no hay categorías. Añade la primera con el botón de arriba.
          </p>
        )}

        {categories.map((category) => {
          const Icon = getIcon(category.icon);
          const isEditing = editingId === category.id;
          return (
            <div key={category.id} className="rounded-2xl border border-choco/10 bg-white/70">
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span
                    className="grid h-11 w-11 place-items-center rounded-xl text-white"
                    style={{ backgroundColor: category.color }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-bold text-choco">
                      {category.name}
                    </h2>
                    <p className="text-xs text-choco-muted">
                      /{category.slug} · orden {category.sort_order}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => setEditingId(category.id)}
                      className={btnGhost}
                    >
                      Editar
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      if (window.confirm(`¿Eliminar la categoría "${category.name}"?`)) {
                        runMutation(() => deleteCategoryById(category.id));
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
                  <EditCategoryForm
                    category={category}
                    onDone={() => setEditingId(null)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
