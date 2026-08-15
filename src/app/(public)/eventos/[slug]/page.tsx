import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, MapPin, Navigation, Star, Ticket } from "lucide-react";
import { EventActions } from "@/components/event-actions";
import { RemindButton } from "@/components/remind-button";
import {
  getCategoryById,
  getEventBySlug,
  getFeaturedEvents,
} from "@/lib/db";
import { geocodeLocation } from "@/lib/geocode";
import { formatDateRange, formatDayLong } from "@/lib/format";
import { getIcon } from "@/lib/icons";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return { title: "Evento no encontrado" };
  return {
    title: event.title,
    description: event.description?.slice(0, 160) ?? undefined,
    openGraph: {
      title: event.title,
      description: event.description?.slice(0, 200) ?? undefined,
      url: `${site.url}/eventos/${event.slug}`,
      images: event.image ? [{ url: event.image }] : undefined,
    },
  };
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) notFound();

  const category = event.categoryId ? getCategoryById(event.categoryId) : null;
  const CategoryIcon = category ? getIcon(category.icon) : null;
  const color = category?.color ?? "#16a34a";
  const upcoming = getFeaturedEvents(3).filter((e) => e.id !== event.id).slice(0, 2);
  const coords = await geocodeLocation(event.location);
  const d = 0.003;
  const mapSrc = coords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - d}%2C${coords.lat - d}%2C${coords.lng + d}%2C${coords.lat + d}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`
    : null;

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/agenda"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-choco-muted transition hover:text-choco"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a la agenda
      </Link>

      <div className="overflow-hidden rounded-2xl border border-sand bg-white shadow-sm">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="aspect-[16/9] w-full object-cover"
          />
        ) : (
          <div
            className="relative grid aspect-[16/9] w-full place-items-center overflow-hidden"
            style={{
              background: `linear-gradient(150deg, ${color}20, ${color}06)`,
            }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full"
              style={{ background: `${color}14` }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full"
              style={{ background: `${color}12` }}
            />
            {CategoryIcon && (
              <span
                className="grid h-20 w-20 place-items-center rounded-3xl bg-white/90 shadow-md"
                style={{ boxShadow: `0 6px 20px ${color}33` }}
              >
                <CategoryIcon className="h-10 w-10" style={{ color }} />
              </span>
            )}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-4 px-4 text-center text-[11px] font-medium uppercase tracking-widest text-choco-muted/50"
            >
              {event.title}
            </span>
          </div>
        )}

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            {category && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white"
                style={{ backgroundColor: color }}
              >
                {CategoryIcon && <CategoryIcon className="h-3.5 w-3.5" />}
                {category.name}
              </span>
            )}
            {event.featured === 1 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-choco px-3 py-1 text-xs font-semibold text-cream">
                <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                Recomendado por HuescaHoy
              </span>
            )}
          </div>

          <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            {event.title}
          </h1>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-choco-muted">
            <p className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 shrink-0 text-brand" />
              <span className="font-medium text-choco">
                {formatDateRange(
                  event.startDate,
                  event.endDate,
                  event.startTime,
                  event.endTime
                )}
              </span>
            </p>
            {event.location && (
              <p className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 shrink-0 text-brand" />
                <span className="font-medium text-choco">{event.location}</span>
              </p>
            )}
            {event.price && (
              <p className="flex items-center gap-2 text-sm">
                <Ticket className="h-4 w-4 shrink-0 text-brand" />
                <span className="font-medium text-choco">{event.price}</span>
              </p>
            )}
          </div>

          {event.address && (
            <p className="mt-2 text-sm text-choco-muted">{event.address}</p>
          )}

          {event.description && (
            <p className="mt-6 whitespace-pre-line leading-relaxed text-choco/90">
              {event.description}
            </p>
          )}

          {mapSrc && (
            <div className="mt-6 overflow-hidden rounded-2xl border border-sand">
              <iframe
                src={mapSrc}
                title={`Mapa de ${event.location ?? event.title}`}
                loading="lazy"
                className="h-64 w-full"
              />
              {coords && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 bg-white px-4 py-2.5 text-sm font-semibold text-brand transition hover:bg-sand"
                >
                  <Navigation className="h-4 w-4" />
                  Cómo llegar
                </a>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-sand pt-6">
            <EventActions event={event} />
            <RemindButton event={event} />
          </div>

          <p className="mt-6 text-xs text-choco-muted/70">
            {formatDayLong(event.startDate)} · Agenda de {site.city}
          </p>
        </div>
      </div>

      {upcoming.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-xl font-bold">También te puede interesar</h2>
          <div className="mt-4 space-y-3">
            {upcoming.map((e) => {
              const cat = e.categoryId ? getCategoryById(e.categoryId) : null;
              const Icon = cat ? getIcon(cat.icon) : null;
              return (
                <Link
                  key={e.id}
                  href={`/eventos/${e.slug}`}
                  className="flex items-center gap-4 rounded-2xl border border-sand bg-white p-4 shadow-sm transition hover:border-brand/40 hover:shadow-md"
                >
                  <span
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white"
                    style={{ backgroundColor: cat?.color ?? "#16a34a" }}
                  >
                    {Icon && <Icon className="h-6 w-6" />}
                  </span>
                  <span>
                    <span className="block font-display font-semibold text-choco">
                      {e.title}
                    </span>
                    <span className="text-sm text-choco-muted">
                      {formatDateRange(e.startDate, e.endDate, e.startTime, e.endTime)}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}
