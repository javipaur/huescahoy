import Link from "next/link";
import { ArrowRight, Clock, MapPin, Star } from "lucide-react";
import type { Category, EventItem } from "@/lib/types";
import {
  dayNumber,
  dayShort,
  formatDateRange,
  formatTimeRange,
  monthShort,
} from "@/lib/format";
import { getIcon } from "@/lib/icons";

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

function GridCard({
  event,
  category,
  icon,
  color,
}: {
  event: EventItem;
  category?: Category | null;
  icon: ReturnType<typeof getIcon> | null;
  color: string;
}) {
  const Icon = icon;
  return (
    <Link
      href={`/eventos/${event.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-sand bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-choco/5"
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
        <span className="absolute left-3 top-3 rounded-lg border border-sand bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-choco shadow-sm backdrop-blur">
          {formatDateRange(event.startDate, event.endDate, event.startTime, event.endTime)}
        </span>
        {event.featured === 1 && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-choco/85 px-2.5 py-1 text-[11px] font-semibold text-cream shadow-sm backdrop-blur">
            <Star className="h-3 w-3 fill-gold text-gold" />
            Recomendado
          </span>
        )}
        {category && (
          <span
            className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm"
            style={{ backgroundColor: color }}
          >
            {Icon && <Icon className="h-3 w-3" />}
            {category.name}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-display text-lg font-semibold leading-snug text-choco transition-colors group-hover:text-brand-dark">
          {event.title}
        </h3>
        {event.location && (
          <p className="flex items-center gap-1.5 text-sm text-choco-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{event.location}</span>
          </p>
        )}
        {event.startTime && (
          <p className="flex items-center gap-1.5 text-sm text-choco-muted">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            {formatTimeRange(event.startTime, event.endTime)}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-sand pt-3">
          {event.price && (
            <span className="text-sm font-bold text-brand">{event.price}</span>
          )}
          <span className="ml-auto grid h-7 w-7 place-items-center rounded-full text-brand transition group-hover:bg-brand group-hover:text-white">
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
}: {
  event: EventItem;
  category?: Category | null;
  icon: ReturnType<typeof getIcon> | null;
  color: string;
}) {
  const Icon = icon;
  return (
    <Link
      href={`/eventos/${event.slug}`}
      className="group flex items-stretch gap-4 rounded-2xl border border-sand bg-white p-4 shadow-sm transition hover:border-brand/40 hover:shadow-md sm:gap-5"
    >
      <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-sand px-2 py-3 text-center">
        <span className="text-[10px] font-bold uppercase tracking-widest text-choco-muted">
          {dayShort(event.startDate)}
        </span>
        <span className="my-0.5 font-display text-2xl font-bold leading-none text-choco">
          {dayNumber(event.startDate)}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-brand">
          {monthShort(event.startDate)}
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
          {event.startTime && (
            <span className="text-xs font-medium text-choco-muted">
              {formatTimeRange(event.startTime, event.endTime)}
            </span>
          )}
        </div>
        <h3 className="mt-1.5 font-display text-lg font-semibold leading-snug text-choco transition-colors group-hover:text-brand-dark">
          {event.title}
        </h3>
        {event.location && (
          <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-choco-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{event.location}</span>
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end justify-between py-0.5">
        {event.price && (
          <span className="text-sm font-bold text-brand">{event.price}</span>
        )}
        <ArrowRight className="h-4 w-4 text-choco-muted transition group-hover:translate-x-0.5 group-hover:text-brand" />
      </div>
    </Link>
  );
}

export function EventCard({
  event,
  category,
  variant = "grid",
}: {
  event: EventItem;
  category?: Category | null;
  variant?: "grid" | "row";
}) {
  const icon = category ? getIcon(category.icon) : null;
  const color = category?.color ?? "#16a34a";

  if (variant === "row") {
    return <RowCard event={event} category={category} icon={icon} color={color} />;
  }
  return <GridCard event={event} category={category} icon={icon} color={color} />;
}
