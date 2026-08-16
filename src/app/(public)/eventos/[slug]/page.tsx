import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, MapPin, Navigation, Star, Ticket } from "lucide-react";
import { EventActions } from "@/components/event-actions";
import { JsonLd } from "@/components/json-ld";
import { RemindButton } from "@/components/remind-button";
import {
  getCategoriesAdmin,
  getEventBySlug,
  getFeaturedEvents,
} from "@/lib/db";
import { geocodeLocation } from "@/lib/geocode";
import {
  formatDateRange,
  formatDayLong,
  formatTimeRange,
} from "@/lib/format";
import { getIcon } from "@/lib/icons";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function isoDateTime(date: string, time: string | null): string {
  return time ? `${date}T${time}` : date;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Evento no encontrado" };
  const url = `${site.url}/eventos/${event.slug}`;
  return {
    title: event.title,
    description: event.description?.slice(0, 160) ?? undefined,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: site.locale,
      title: event.title,
      description: event.description?.slice(0, 200) ?? undefined,
      url,
      images: event.image ? [{ url: event.image }] : [{ url: "/opengraph-image" }],
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.description?.slice(0, 200) ?? undefined,
      images: event.image ? [event.image] : ["/opengraph-image"],
    },
  };
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const [event, categories] = await Promise.all([
    getEventBySlug(slug),
    getCategoriesAdmin(),
  ]);
  if (!event) notFound();
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const category = event.categoryId ? categoryMap.get(event.categoryId) ?? null : null;
  const CategoryIcon = category ? getIcon(category.icon) : null;
  const color = category?.color ?? "#16a34a";
  const upcoming = (await getFeaturedEvents(3)).filter((e) => e.id !== event.id).slice(0, 2);
  const coords = await geocodeLocation(event.location);
  const d = 0.003;
  const mapSrc = coords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - d}%2C${coords.lat - d}%2C${coords.lng + d}%2C${coords.lat + d}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`
    : null;

  const priceMatch = event.price?.match(/(\d+)(?:[.,](\d+))?/);
  const priceValue = priceMatch
    ? parseFloat(priceMatch[1] + (priceMatch[2] ? `.${priceMatch[2]}` : ""))
    : null;

  const eventJsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    url: `${site.url}/eventos/${event.slug}`,
    description: event.description?.slice(0, 300) ?? undefined,
    startDate: isoDateTime(event.startDate, event.startTime),
    endDate: isoDateTime(
      event.endDate ?? event.startDate,
      event.endTime ?? event.startTime
    ),
    image: event.image ?? undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventCategory: category?.name ?? undefined,
    location: event.location
      ? {
          "@type": "Place",
          name: event.location,
          address: event.address ?? undefined,
        }
      : undefined,
    organizer: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
  };

  if (priceValue != null) {
    eventJsonLd.offers = {
      "@type": "Offer",
      price: priceValue,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: `${site.url}/eventos/${event.slug}`,
    };
  }

  const facts: { Icon: typeof Clock; label: string; value: string }[] = [
    {
      Icon: CalendarDays,
      label: "Fecha",
      value: formatDateRange(
        event.startDate,
        event.endDate,
        event.startTime,
        event.endTime
      ),
    },
    ...(event.startTime
      ? [
          {
            Icon: Clock,
            label: "Hora",
            value: formatTimeRange(event.startTime, event.endTime) ?? "",
          },
        ]
      : []),
    ...(event.location
      ? [{ Icon: MapPin, label: "Lugar", value: event.location }]
      : []),
    ...(event.price ? [{ Icon: Ticket, label: "Precio", value: event.price }] : []),
  ];

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <JsonLd data={eventJsonLd} />
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

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="flex items-center gap-3 rounded-2xl border border-sand bg-sand/40 px-4 py-3"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                  <fact.Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-choco-muted">
                    {fact.label}
                  </p>
                  <p className="truncate text-sm font-semibold text-choco" title={fact.value}>
                    {fact.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {event.address && (
            <p className="mt-3 text-sm text-choco-muted">{event.address}</p>
          )}

          {event.description && (
            <div className="mt-6 rounded-2xl border border-sand bg-sand/30 p-5 sm:p-6">
              <p className="whitespace-pre-line leading-relaxed text-choco/90">
                {event.description}
              </p>
            </div>
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
              const cat = e.categoryId ? categoryMap.get(e.categoryId) ?? null : null;
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
