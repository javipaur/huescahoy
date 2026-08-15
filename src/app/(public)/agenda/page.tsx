import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { AgendaSwitcher } from "@/components/agenda-switcher";
import { EventCard } from "@/components/event-card";
import { EventFilters } from "@/components/event-filters";
import type { MapPoint } from "@/components/map-view";
import {
  getCategoriesAdmin,
  getEvents,
  getCategoryById,
  todayStr,
} from "@/lib/db";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Agenda",
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function rangeFrom(desde: string): { from?: string; to?: string } {
  const today = todayStr();
  if (desde === "hoy") return { from: today, to: today };
  if (desde === "7d") return { from: today, to: todayStr(7) };
  if (desde === "mes") {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return { from: today, to: todayStr(lastDay - now.getDate()) };
  }
  if (desde === "finde") {
    const day = new Date().getDay();
    if (day === 6) return { from: today, to: todayStr(1) };
    const daysToSat = ((6 - day) + 7) % 7;
    return { from: todayStr(daysToSat), to: todayStr(daysToSat + 1) };
  }
  return { from: today };
}

export default async function AgendaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const categoria = typeof params.categoria === "string" ? params.categoria : "";
  const desde = typeof params.desde === "string" ? params.desde : "";
  const q = typeof params.q === "string" ? params.q : "";

  const categories = getCategoriesAdmin();
  const { from, to } = rangeFrom(desde);
  const events = getEvents({
    category: categoria || undefined,
    from,
    to,
    q: q || undefined,
    limit: 100,
  });

  const points: MapPoint[] = events
    .filter((event) => event.lat != null && event.lng != null)
    .map((event) => ({
      id: event.id,
      title: event.title,
      slug: event.slug,
      lat: event.lat!,
      lng: event.lng!,
    }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Agenda
          </h1>
          <p className="mt-2 text-choco-muted">
            Todo lo que pasa en {site.city}, ordenado por fecha.
          </p>
        </div>
        <a
          href="/api/agenda.ics"
          className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-4 py-2 text-sm font-semibold text-choco transition hover:border-brand/40 hover:text-brand"
        >
          <Download className="h-4 w-4" />
          Descargar la semana (.ics)
        </a>
      </div>

      <Suspense fallback={null}>
        <div className="rounded-2xl border border-sand bg-white p-4 shadow-sm sm:p-5">
          <EventFilters
            categories={categories}
            activeCategory={categoria}
            activeDesde={desde}
            activeQ={q}
          />
        </div>
      </Suspense>

      {events.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-sand bg-sand/40 p-12 text-center">
          <p className="font-display text-xl font-semibold text-choco">
            No hay eventos que coincidan
          </p>
          <p className="mt-2 text-choco-muted">
            Prueba con otros filtros o revisa la agenda completa.
          </p>
          <Link
            href="/agenda"
            className="mt-6 inline-flex rounded-full bg-brand px-6 py-3 font-semibold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark"
          >
            Ver toda la agenda
          </Link>
        </div>
      ) : (
        <AgendaSwitcher count={events.length} points={points}>
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              category={event.categoryId ? getCategoryById(event.categoryId) : null}
              variant="row"
            />
          ))}
        </AgendaSwitcher>
      )}
    </div>
  );
}
