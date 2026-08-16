import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarDays,
  CalendarPlus,
  FolderOpen,
  RefreshCw,
  Tags,
} from "lucide-react";
import {
  getCategoriesAdmin,
  getEvents,
  getScraperRuns,
  getStats,
  getSuggestionCounts,
  getSuggestions,
  getActiveFeaturedPick,
  countPushSubscriptions,
} from "@/lib/db";
import { formatDayShort } from "@/lib/format";
import { pushConfigured } from "@/lib/push";
import { PushAdmin } from "@/components/admin/push-admin";
import { FeaturedPickAdmin } from "@/components/admin/featured-pick-admin";

export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const statCards = [
  { key: "upcoming", label: "Próximos eventos", icon: CalendarDays },
  { key: "week", label: "Esta semana", icon: RefreshCw },
  { key: "categories", label: "Categorías", icon: Tags },
  { key: "sources", label: "Fuentes activas", icon: FolderOpen },
] as const;

export default async function AdminDashboardPage() {
  const [stats, recent, runs, suggestionCounts, latestSuggestions, categories, subscribers, pick] =
    await Promise.all([
      getStats(),
      getEvents({ upcoming: true, limit: 5, includeHidden: true }),
      getScraperRuns(5),
      getSuggestionCounts(),
      getSuggestions(4),
      getCategoriesAdmin(),
      countPushSubscriptions(),
      getActiveFeaturedPick(),
    ]);
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-choco">Panel</h1>
          <p className="mt-1 text-sm text-choco-muted">
            Resumen de la agenda y acciones rápidas.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/eventos/nuevo"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-brand-dark"
          >
            <CalendarPlus className="h-4 w-4" />
            Nuevo evento
          </Link>
          <Link
            href="/admin/fuentes"
            className="inline-flex items-center gap-2 rounded-full border border-choco/15 bg-white px-5 py-2.5 text-sm font-semibold text-choco transition hover:bg-sand"
          >
            <RefreshCw className="h-4 w-4" />
            Ejecutar scraper
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className="rounded-3xl border border-sand bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="text-xs font-medium uppercase tracking-wide text-choco-muted">
                  {card.label}
                </p>
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-choco">
                {stats[card.key]}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-sand bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-choco">
              Próximos eventos
            </h2>
            <Link
              href="/admin/eventos"
              className="text-sm font-medium text-brand hover:text-brand-dark"
            >
              Ver todos
            </Link>
          </div>
          <ul className="divide-y divide-choco/5">
            {recent.length === 0 && (
              <li className="py-6 text-center text-sm text-choco-muted">
                No hay eventos próximos todavía.
              </li>
            )}
            {recent.map((event) => {
              const category = event.categoryId ? categoryMap.get(event.categoryId) ?? null : null;
              return (
                <li key={event.id}>
                  <Link
                    href={`/admin/eventos/${event.id}`}
                    className="flex items-center justify-between gap-3 py-3 transition hover:bg-cream"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-choco">{event.title}</p>
                      <p className="text-xs text-choco-muted">
                        {formatDayShort(event.startDate)}
                        {category ? ` · ${category.name}` : ""}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        event.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-choco/10 text-choco-muted"
                      }`}
                    >
                      {event.status === "published" ? "Publicado" : "Oculto"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-3xl border border-sand bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-choco">
              Últimas ejecuciones del scraper
            </h2>
            <Link
              href="/admin/fuentes"
              className="text-sm font-medium text-brand hover:text-brand-dark"
            >
              Fuentes
            </Link>
          </div>
          {runs.length === 0 ? (
            <p className="py-6 text-center text-sm text-choco-muted">
              Aún no se ha ejecutado ningún scraper.{" "}
              <Link href="/admin/fuentes" className="text-brand">
                Añade una fuente
              </Link>{" "}
              para empezar.
            </p>
          ) : (
            <ul className="divide-y divide-choco/5">
              {runs.map((run) => (
                <li key={run.id} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-choco">
                        {run.sourceName ?? "Todas las fuentes"}
                      </p>
                      <p className="text-xs text-choco-muted">
                        {run.startedAt} · {run.eventsFound} encontrados ·{" "}
                        {run.eventsNew} nuevos · {run.eventsUpdated} actualizados
                      </p>
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
                  </div>
          {run.error && (
            <p className="mt-1 text-xs text-red-600">{run.error}</p>
          )}
        </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-3xl border border-sand bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-choco">
            Sugerencias recibidas
          </h2>
          <Link
            href="/admin/sugerencias"
            className="text-sm font-medium text-brand hover:text-brand-dark"
          >
            Ver todas
          </Link>
        </div>
        {suggestionCounts.pending > 0 && (
          <span className="mb-4 inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            {suggestionCounts.pending}{" "}
            {suggestionCounts.pending === 1 ? "nueva por revisar" : "nuevas por revisar"}
          </span>
        )}
        {latestSuggestions.length === 0 ? (
          <p className="py-4 text-sm text-choco-muted">
            Todavía no hay aportaciones.{" "}
            <Link href="/colabora" target="_blank" className="text-brand">
              La página Colabora
            </Link>{" "}
            se encarga de traerlas.
          </p>
        ) : (
          <ul className="divide-y divide-choco/5">
            {latestSuggestions.map((suggestion) => (
              <li key={suggestion.id} className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium text-choco">
                    {suggestion.title}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      suggestion.status === "nuevo"
                        ? "bg-green-100 text-green-700"
                        : suggestion.status === "visto"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-choco/10 text-choco-muted"
                    }`}
                  >
                    {suggestion.status === "nuevo"
                      ? "Nueva"
                      : suggestion.status === "visto"
                        ? "En revisión"
                        : "Resuelta"}
                  </span>
                </div>
                {suggestion.detail && (
                  <p className="mt-1 line-clamp-1 text-xs text-choco-muted">
                    {suggestion.detail}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-3xl border border-sand bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-display text-lg font-bold text-choco">
          El plan del finde
        </h2>
        <FeaturedPickAdmin pick={pick} />
      </section>

      <section className="rounded-3xl border border-sand bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-display text-lg font-bold text-choco">
          Notificaciones push
        </h2>
        <PushAdmin subscriberCount={subscribers} configured={pushConfigured()} />
      </section>
    </div>
  );
}
