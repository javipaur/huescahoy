"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import type { ReactNode } from "react";
import {
  createSourceAction,
  deleteSourceById,
  runScraperAction,
  toggleSourceEnabled,
  updateSourceAction,
  type ActionResult,
} from "@/lib/actions";
import type { Category, ScraperRun, Source } from "@/lib/types";

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

function SourceFields({
  categories,
  source,
}: {
  categories: Category[];
  source?: Source;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Nombre *">
        <input
          name="name"
          type="text"
          required
          defaultValue={source?.name}
          placeholder="Ej. Agenda del Ayuntamiento"
          className={inputCls}
        />
      </Field>
      <Field label="Tipo">
        <select name="kind" defaultValue={source?.kind ?? "rss"} className={inputCls}>
          <option value="rss">RSS / Atom</option>
          <option value="jsonld">HTML con JSON-LD</option>
          <option value="radar">Radar Huesca (feed MEC)</option>
          <option value="palacio">Palacio de Congresos (HTML)</option>
          <option value="cpf">Cierra por Fuera (HTML)</option>
          <option value="tec">Feed RSS específico</option>
          <option value="somontano">Somontano (agenda semanal)</option>
          <option value="aragon">Turismo de Aragón (HTML)</option>
          <option value="monegros">Turismo Monegros (HTML)</option>
          <option value="ainsa">Aínsa (sitemap + detalle)</option>
          <option value="fraga">Ayto. de Fraga (calendario)</option>
          <option value="magia">Huesca La Magia (API JSON)</option>
          <option value="ayto">Agenda Ayuntamiento Huesca (HTML)</option>
          <option value="huescalamagia-events">Huesca La Magia · eventos</option>
          <option value="huescaturismo">Huesca Turismo · eventos</option>
          <option value="diputacion">Diputación Huesca · eventos</option>
          <option value="huescalamagia-restaurants">Huesca La Magia · restaurantes</option>
          <option value="opendata-restaurants">Aragón Open Data · restaurantes</option>
          <option value="huescalamagia-routes">Huesca La Magia · rutas</option>
          <option value="senderosgr">Senderos GR · rutas</option>
          <option value="caminosnaturales">Caminos Naturales · rutas</option>
          <option value="dph-planes">Diputación Huesca · planes (rutas y actividades)</option>
        </select>
      </Field>
      <div className="sm:col-span-2">
        <Field label="URL de la fuente *" hint="La página que se consulta para extraer los eventos.">
          <input
            name="url"
            type="url"
            required
            defaultValue={source?.url}
            placeholder="https://ejemplo.es/agenda.xml"
            className={inputCls}
          />
        </Field>
      </div>
      <Field label="Categoría por defecto">
        <select
          name="category_id"
          defaultValue={source?.categoryId ?? ""}
          className={inputCls}
        >
          <option value="">Sin categoría</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </Field>
      <label className="flex items-center gap-2 self-end pb-1 text-sm text-choco dark:text-ink">
        <input
          name="enabled"
          type="checkbox"
          defaultChecked={source ? source.enabled === 1 : true}
          className="h-4 w-4 rounded accent-brand"
        />
        Fuente activa
      </label>
    </div>
  );
}

function AddSourceForm({ categories, onDone }: { categories: Category[]; onDone: () => void }) {
  const [state, action, pending] = useActionState(createSourceAction, undefined);
  useFormDone(state, onDone);

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-choco/10 bg-white/70 p-5">
      <FormError message={state?.error} />
      <SourceFields categories={categories} />
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending ? "Guardando..." : "Añadir fuente"}
        </button>
        <button type="button" onClick={onDone} className={btnSecondary}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

function EditSourceForm({
  categories,
  source,
  onDone,
}: {
  categories: Category[];
  source: Source;
  onDone: () => void;
}) {
  const [state, action, pending] = useActionState(updateSourceAction, undefined);
  useFormDone(state, onDone);

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-brand/40 bg-white/80 p-5">
      <input type="hidden" name="id" value={source.id} />
      <FormError message={state?.error} />
      <SourceFields categories={categories} source={source} />
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

function RunForm({ sourceId, buttonLabel }: { sourceId: number; buttonLabel: string }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(runScraperAction, undefined);

  useEffect(() => {
    if (state?.summary) router.refresh();
  }, [state, router]);

  return (
    <form action={action} className="flex items-center gap-3">
      <input type="hidden" name="source_id" value={sourceId} />
      <button type="submit" disabled={pending} className={btnPrimary}>
        {pending ? "Procesando..." : buttonLabel}
      </button>
      {state?.summary && (
        <p className="text-sm text-green-700">{state.summary}</p>
      )}
      {state?.error && (
        <p className="text-sm text-red-700">{state.error}</p>
      )}
    </form>
  );
}

export default function SourcesAdmin({
  sources,
  categories,
  runs,
}: {
  sources: Source[];
  categories: Category[];
  runs: ScraperRun[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-choco dark:text-ink">Fuentes</h1>
          <p className="mt-1 text-sm text-choco-muted">
            Webs de las que se extraen eventos automáticamente (RSS, JSON-LD o parsers dedicados).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <RunForm sourceId={0} buttonLabel="Ejecutar todas" />
          {!showAdd && (
            <button type="button" onClick={() => setShowAdd(true)} className={btnSecondary}>
              + Añadir fuente
            </button>
          )}
        </div>
      </div>

      {globalError && (
        <div className="mt-6">
          <FormError message={globalError} />
        </div>
      )}

      {showAdd && (
        <div className="mt-6">
          <AddSourceForm categories={categories} onDone={() => setShowAdd(false)} />
        </div>
      )}

      <div className="mt-8 space-y-4">
        {sources.length === 0 && (
          <p className="rounded-2xl border border-dashed border-choco/20 bg-white/50 p-10 text-center text-sm text-choco-muted">
            Todavía no hay fuentes configuradas. Añade la primera con el botón de arriba.
          </p>
        )}

        {sources.map((source) => {
          const category = source.categoryId ? categoryMap.get(source.categoryId) : undefined;
          const isEditing = editingId === source.id;
          return (
            <div key={source.id} className="rounded-2xl border border-choco/10 bg-white/70">
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-bold text-choco dark:text-ink">
                      {source.name}
                    </h2>
                    <span className="rounded-full bg-choco/10 dark:bg-ink/10 px-2 py-0.5 text-xs font-semibold uppercase text-choco-muted">
                      {source.kind}
                    </span>
                    {source.enabled === 1 ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                        Activa
                      </span>
                    ) : (
                      <span className="rounded-full bg-choco/10 dark:bg-ink/10 px-2 py-0.5 text-xs font-semibold text-choco-muted">
                        Inactiva
                      </span>
                    )}
                    {category && (
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.name}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-sm text-choco-muted">{source.url}</p>
                  <p className="mt-0.5 text-xs text-choco-muted">
                    Última ejecución: {source.lastRun ?? "nunca"} ·{" "}
                    {source.lastStatus === "ok"
                      ? `${source.lastFound} encontrados, ${source.lastNew} nuevos, ${source.lastUpdated} actualizados`
                      : source.lastStatus === "error"
                        ? `error: ${source.lastError ?? "desconocido"}`
                        : "sin ejecutar"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <RunForm sourceId={source.id} buttonLabel="Ejecutar" />
                  {!isEditing && (
                    <button type="button" onClick={() => setEditingId(source.id)} className={btnGhost}>
                      Editar
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => runMutation(() => toggleSourceEnabled(source.id))}
                    className={btnGhost}
                  >
                    {source.enabled === 1 ? "Desactivar" : "Activar"}
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      if (window.confirm(`¿Eliminar la fuente "${source.name}"?`)) {
                        runMutation(() => deleteSourceById(source.id));
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
                  <EditSourceForm
                    categories={categories}
                    source={source}
                    onDone={() => setEditingId(null)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-12">
        <h2 className="font-display text-lg font-bold text-choco dark:text-ink">Historial de ejecuciones</h2>
        {runs.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-choco/20 bg-white/50 p-8 text-center text-sm text-choco-muted">
            Aún no se ha ejecutado ningún scraper.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-choco/5 rounded-2xl border border-choco/10 bg-white/70">
            {runs.map((run) => (
              <li key={run.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-choco">
                    {run.sourceName ?? "Todas las fuentes"}
                  </p>
                  <p className="text-xs text-choco-muted">
                    {run.startedAt} · {run.eventsFound} encontrados · {run.eventsNew} nuevos ·{" "}
                    {run.eventsUpdated} actualizados
                  </p>
                  {run.error && <p className="mt-0.5 text-xs text-red-600">{run.error}</p>}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    run.status === "ok"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {run.status === "ok" ? "OK" : "Error"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
