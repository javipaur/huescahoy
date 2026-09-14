import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Mountain, Route, ArrowRight, ExternalLink, CalendarDays } from "lucide-react";
import { getRouteBySlug, getRouteStages } from "@/lib/db";
import { site } from "@/lib/site";
import { JsonLd } from "@/components/json-ld";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const route = await getRouteBySlug(slug);
  if (!route) return { title: "Ruta no encontrada" };
  return {
    title: `${route.title} · Rutas en Huesca`,
    description: route.summary ?? route.description?.slice(0, 160) ?? `${route.title} en Huesca.`,
    alternates: { canonical: `/rutas/${route.slug}` },
    openGraph: {
      type: "website",
      title: route.title,
      description: route.summary ?? `${route.title} en Huesca.`,
      images: route.image ? [{ url: route.image }] : [],
    },
  };
}

export default async function RouteDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const route = await getRouteBySlug(slug);
  if (!route) notFound();

  const stages = await getRouteStages(route.id);

  const difficultyColor: Record<string, string> = {
    fácil: "bg-green-100 text-green-700",
    media: "bg-yellow-100 text-yellow-700",
    alta: "bg-red-100 text-red-700",
  };

  const mapsUrl = route.lat != null && route.lng != null
    ? `https://www.google.com/maps/search/?api=1&query=${route.lat},${route.lng}`
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TouristTrip",
          name: route.title,
          description: route.summary ?? route.description,
          image: route.image,
        }}
      />

      <nav className="mb-4 flex items-center gap-1.5 text-sm text-choco-muted">
        <Link href="/rutas" className="text-brand hover:text-brand-dark">Rutas</Link>
        <span>/</span>
        <span className="truncate text-choco dark:text-ink">{route.title}</span>
      </nav>

      {route.image && (
        <div className="mb-6 overflow-hidden rounded-2xl">
          <img src={route.image} alt={route.title} className="aspect-[21/9] w-full object-cover" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {route.routeType && (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand-dark">
            <Route className="h-3.5 w-3.5" />
            {route.routeType}
          </span>
        )}
        {route.difficulty && (
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${difficultyColor[route.difficulty] ?? "bg-gray-100 text-gray-700"}`}>
            {route.difficulty}
          </span>
        )}
      </div>

      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-choco dark:text-ink sm:text-4xl">
        {route.title}
      </h1>

      {route.summary && (
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-choco-muted">
          {route.summary}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-4">
        {route.distanceKm && (
          <div className="flex items-center gap-2 rounded-xl bg-sand/50 px-4 py-3">
            <MapPin className="h-5 w-5 text-brand" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-choco-muted">Distancia</p>
              <p className="text-lg font-bold text-choco dark:text-ink">{route.distanceKm} km</p>
            </div>
          </div>
        )}
        {route.elevationM && (
          <div className="flex items-center gap-2 rounded-xl bg-sand/50 px-4 py-3">
            <Mountain className="h-5 w-5 text-brand" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-choco-muted">Desnivel</p>
              <p className="text-lg font-bold text-choco dark:text-ink">{route.elevationM} m</p>
            </div>
          </div>
        )}
        {route.stagesCount > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-sand/50 px-4 py-3">
            <Route className="h-5 w-5 text-brand" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-choco-muted">Etapas</p>
              <p className="text-lg font-bold text-choco dark:text-ink">{route.stagesCount}</p>
            </div>
          </div>
        )}
      </div>

      {route.description && (
        <div className="mt-8">
          <h2 className="font-display text-xl font-bold text-choco dark:text-ink">Descripción</h2>
          <div className="mt-3 whitespace-pre-line text-choco-muted leading-relaxed">
            {route.description}
          </div>
        </div>
      )}

      {stages.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-xl font-bold text-choco dark:text-ink">Etapas</h2>
          <div className="mt-4 space-y-3">
            {stages.map((stage) => (
              <div key={stage.id} className="rounded-xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand/10 text-sm font-bold text-brand-dark">
                    {stage.stageNumber}
                  </span>
                  <h3 className="font-display font-semibold text-choco dark:text-ink">
                    {stage.title}
                  </h3>
                  {stage.distanceKm && (
                    <span className="ml-auto text-sm font-semibold text-choco-muted">
                      {stage.distanceKm} km
                    </span>
                  )}
                </div>
                {stage.description && (
                  <p className="mt-2 ml-10 text-sm text-choco-muted">
                    {stage.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark"
          >
            <MapPin className="h-4 w-4" />
            Ver en mapa
            <ArrowRight className="h-4 w-4" />
          </a>
        )}
        {route.externalUrl && (
          <a
            href={route.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-brand px-6 py-3 font-semibold text-brand transition hover:bg-brand/5"
          >
            <ExternalLink className="h-4 w-4" />
            Ver fuente original
          </a>
        )}
        {route.gpxUrl && (
          <a
            href={route.gpxUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 px-6 py-3 font-semibold text-choco dark:text-ink transition hover:bg-sand"
          >
            Descargar GPX
          </a>
        )}
      </div>

      {route.lat != null && route.lng != null && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-sand">
          <iframe
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${route.lng - 0.02},${route.lat - 0.01},${route.lng + 0.02},${route.lat + 0.01}&layer=mapnik&marker=${route.lat},${route.lng}`}
            className="h-72 w-full border-0"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}