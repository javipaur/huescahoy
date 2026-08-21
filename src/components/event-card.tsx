import Link from "next/link";
import { ArrowRight, Clock, LocateFixed, MapPin, Star } from "lucide-react";
import type { Category, EventItem } from "@/lib/types";
import { dayNumber, dayShort, formatTimeRange, monthShort } from "@/lib/format";
import { getIcon } from "@/lib/icons";
import { zoneFor, zoneLabel, type EventZone } from "@/lib/zones";

function ZoneBadge({ zone }: { zone: EventZone }) {
  if (zone !== "provincia") return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-choco shadow-sm backdrop-blur">
      <MapPin className="h-3 w-3 text-brand" />
      {zoneLabel(zone)}
    </span>
  );
}

function Placeholder({
  category,
  icon,
  title,
}: {
  category?: Category | null;
  icon: ReturnType<typeof getIcon> | null;
  title: string;
}) {
  const Icon = icon;
  const color = category?.color ?? "#16a34a";
  return (
    <div
      className="relative grid h-full w-full place-items-center overflow-hidden"
      style={{ background: `linear-gradient(150deg, ${color}20, ${color}06)` }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full"
        style={{ background: `${color}14` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full"
        style={{ background: `${color}12` }}
      />
      {Icon && (
        <span
          className="grid h-14 w-14 place-items-center rounded-2xl bg-white/90 shadow-md"
          style={{ boxShadow: `0 4px 14px ${color}33` }}
        >
          <Icon className="h-7 w-7" style={{ color }} />
        </span>
      )}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-2 px-3 text-center text-[10px] font-medium uppercase tracking-widest text-choco-muted/50"
      >
        {title}
      </span>
    </div>
  );
}

function DistanceBadge({ distance }: { distance: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sand px-2 py-0.5 text-[11px] font-semibold text-choco-muted">
      <LocateFixed className="h-3 w-3 text-brand" />
      {distance < 1 ? "menos de 1 km" : `a ${Math.round(distance)} km`}
    </span>
  );
}

export function isEventOngoing(event: EventItem): boolean {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
  return event.startDate < today && Boolean(event.endDate && event.endDate >= today);
}

function OngoingBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand/90 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm backdrop-blur">
      <Clock className="h-3 w-3" />
      En curso
    </span>
  );
}

function GridCard({
  event,
  category,
  icon,
  color,
  distance,
}: {
  event: EventItem;
  category?: Category | null;
  icon: ReturnType<typeof getIcon> | null;
  color: string;
  distance?: number | null;
}) {
  const Icon = icon;
  return (
    <Link
      href={`/eventos/${event.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-sand bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-choco/5"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-sand">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <Placeholder category={category} icon={icon} title={event.title} />
        )}

        <span className="absolute left-3 top-3 flex flex-col items-center rounded-xl bg-white/95 px-2.5 py-1.5 text-center shadow-sm backdrop-blur">
          <span className="text-[10px] font-bold uppercase leading-tight tracking-widest text-choco-muted">
            {dayShort(event.startDate)}
          </span>
          <span className="my-0.5 font-display text-lg font-bold leading-none text-choco">
            {dayNumber(event.startDate)}
          </span>
          <span
            className="text-[10px] font-bold uppercase leading-tight tracking-widest"
            style={{ color }}
          >
            {monthShort(event.startDate)}
          </span>
        </span>

        {event.featured === 1 && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-choco/85 px-2.5 py-1 text-[11px] font-semibold text-cream shadow-sm backdrop-blur">
            <Star className="h-3 w-3 fill-gold text-gold" />
            Recomendado
          </span>
        )}
        {event.featured !== 1 && isEventOngoing(event) && (
          <span className="absolute right-3 top-3">
            <OngoingBadge />
          </span>
        )}

        {category && (
          <span
            className="absolute bottom-3 left-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1 truncate rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm"
            style={{ backgroundColor: color }}
          >
            {Icon && <Icon className="h-3 w-3 shrink-0" />}
            <span className="truncate">{category.name}</span>
          </span>
        )}

        <span className="absolute bottom-3 right-3">
          <ZoneBadge zone={zoneFor(event)} />
        </span>

        <span className="pointer-events-none absolute inset-0 grid place-items-center bg-choco/0 opacity-0 transition duration-300 group-hover:bg-choco/25 group-hover:opacity-100">
          <span className="inline-flex translate-y-2 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-choco shadow-lg transition duration-300 group-hover:translate-y-0">
            Ver evento
            <ArrowRight className="h-4 w-4" />
          </span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-display text-lg font-semibold leading-snug text-choco transition-colors group-hover:text-brand-dark">
          {event.title}
        </h3>

        {event.location && (
          <p className="flex items-center gap-1.5 text-sm text-choco-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{event.location}</span>
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-sand pt-3">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            {event.price ? (
              <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-bold text-brand">
                {event.price}
              </span>
            ) : null}
            {event.startTime && (
              <span className="flex items-center gap-1 text-xs font-medium text-choco-muted">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {formatTimeRange(event.startTime, event.endTime)}
                </span>
              </span>
            )}
            {distance != null && <DistanceBadge distance={distance} />}
          </div>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-brand transition group-hover:bg-brand group-hover:text-white">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function RowCard({
  event,
  category,
  icon,
  color,
  distance,
}: {
  event: EventItem;
  category?: Category | null;
  icon: ReturnType<typeof getIcon> | null;
  color: string;
  distance?: number | null;
}) {
  const Icon = icon;
  return (
    <Link
      href={`/eventos/${event.slug}`}
      className="group flex items-stretch gap-4 rounded-2xl border border-sand bg-white p-4 shadow-sm transition hover:border-brand/40 hover:shadow-md sm:gap-5"
    >
      <div className="relative w-20 shrink-0 self-stretch overflow-hidden rounded-xl bg-sand sm:w-28">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <Placeholder category={category} icon={icon} title={event.title} />
        )}
        <span className="absolute left-2 top-2 flex flex-col items-center rounded-lg bg-white/95 px-2 py-1 text-center shadow-sm backdrop-blur">
          <span className="text-[9px] font-bold uppercase leading-tight tracking-widest text-choco-muted">
            {dayShort(event.startDate)}
          </span>
          <span className="my-0.5 font-display text-base font-bold leading-none text-choco">
            {dayNumber(event.startDate)}
          </span>
          <span
            className="text-[9px] font-bold uppercase leading-tight tracking-widest"
            style={{ color }}
          >
            {monthShort(event.startDate)}
          </span>
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {category && (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              {Icon && <Icon className="h-3 w-3" />}
              {category.name}
            </span>
          )}
          {event.featured === 1 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-choco/90 px-2 py-0.5 text-[11px] font-semibold text-cream">
              <Star className="h-3 w-3 fill-gold text-gold" />
              Recomendado
            </span>
          )}
          {event.featured !== 1 && isEventOngoing(event) && <OngoingBadge />}
          <ZoneBadge zone={zoneFor(event)} />
          {event.startTime && (
            <span className="ml-auto flex items-center gap-1 text-xs font-medium text-choco-muted">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              {formatTimeRange(event.startTime, event.endTime)}
            </span>
          )}
        </div>
        <h3 className="mt-1.5 line-clamp-2 font-display text-lg font-semibold leading-snug text-choco transition-colors group-hover:text-brand-dark">
          {event.title}
        </h3>
        {event.location && (
          <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-choco-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{event.location}</span>
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end justify-between gap-2 py-0.5 pl-1">
        <div className="flex flex-col items-end gap-2">
          {event.price && (
            <span
              className="max-w-[9rem] truncate text-right text-sm font-bold text-brand"
              title={event.price}
            >
              {event.price}
            </span>
          )}
          {distance != null && <DistanceBadge distance={distance} />}
        </div>
        <ArrowRight className="h-4 w-4 text-choco-muted transition group-hover:translate-x-0.5 group-hover:text-brand" />
      </div>
    </Link>
  );
}

export function EventCard({
  event,
  category,
  variant = "grid",
  distance,
}: {
  event: EventItem;
  category?: Category | null;
  variant?: "grid" | "row";
  distance?: number | null;
}) {
  const icon = category ? getIcon(category.icon) : null;
  const color = category?.color ?? "#16a34a";

  if (variant === "row") {
    return (
      <RowCard event={event} category={category} icon={icon} color={color} distance={distance} />
    );
  }
  return <GridCard event={event} category={category} icon={icon} color={color} distance={distance} />;
}
