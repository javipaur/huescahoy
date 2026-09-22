import Link from "next/link";
import { ArrowRight, MapPin, Phone, UtensilsCrossed, Globe, Clock } from "lucide-react";
import type { RestaurantItem } from "@/lib/types";

function PriceBadge({ price }: { price: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-bold text-brand-dark">
      {price}
    </span>
  );
}

function CuisineBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-choco/10 dark:bg-ink/10 px-2.5 py-0.5 text-[11px] font-semibold text-choco dark:text-ink">
      {type}
    </span>
  );
}

function Placeholder({ name }: { name: string }) {
  return (
    <div className="relative grid h-full w-full place-items-center overflow-hidden bg-gradient-to-br from-brand/10 to-brand/5">
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand/8" />
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/90 dark:bg-zinc-100 shadow-sm">
        <UtensilsCrossed className="h-6 w-6 text-brand" />
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-2 px-3 text-center text-[10px] font-medium uppercase tracking-widest text-choco-muted"
      >
        {name}
      </span>
    </div>
  );
}

function GridCard({ restaurant }: { restaurant: RestaurantItem }) {
  return (
    <Link
      href={`/restaurantes/${restaurant.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-choco/5 dark:bg-zinc-900 dark:border-zinc-800"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-sand">
        {restaurant.image ? (
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <Placeholder name={restaurant.name} />
        )}
        <span className="pointer-events-none absolute inset-0 grid place-items-center bg-choco/0 opacity-0 transition duration-300 group-hover:bg-choco/25 dark:bg-ink/25 group-hover:opacity-100">
          <span className="inline-flex translate-y-2 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-choco dark:text-ink shadow-lg transition duration-300 group-hover:translate-y-0">
            Ver restaurante
            <ArrowRight className="h-4 w-4" />
          </span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-display text-lg font-semibold leading-snug text-choco dark:text-ink transition-colors group-hover:text-brand-dark">
          {restaurant.name}
        </h3>

        {restaurant.address && (
          <p className="flex items-center gap-1.5 text-sm text-choco-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{restaurant.address}</span>
          </p>
        )}

        <div className="mt-auto flex items-center gap-2 border-t border-sand pt-3">
          {restaurant.cuisineType && <CuisineBadge type={restaurant.cuisineType} />}
          {restaurant.priceRange && <PriceBadge price={restaurant.priceRange} />}
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-brand transition group-hover:bg-brand group-hover:text-white ml-auto">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function RowCard({ restaurant }: { restaurant: RestaurantItem }) {
  return (
    <Link
      href={`/restaurantes/${restaurant.slug}`}
      className="group flex items-stretch gap-4 rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 p-4 shadow-sm transition hover:border-brand/40 hover:shadow-md sm:gap-5 dark:bg-zinc-900 dark:border-zinc-800"
    >
      <div className="relative w-20 shrink-0 self-stretch overflow-hidden rounded-xl bg-sand sm:w-28">
        {restaurant.image ? (
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <Placeholder name={restaurant.name} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {restaurant.cuisineType && <CuisineBadge type={restaurant.cuisineType} />}
          {restaurant.priceRange && <PriceBadge price={restaurant.priceRange} />}
        </div>
        <h3 className="mt-1.5 line-clamp-2 font-display text-lg font-semibold leading-snug text-choco transition-colors group-hover:text-brand-dark">
          {restaurant.name}
        </h3>
        {restaurant.address && (
          <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-choco-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{restaurant.address}</span>
          </p>
        )}
        <div className="mt-1 flex items-center gap-3">
          {restaurant.openingHours && (
            <span className="flex items-center gap-1 text-xs font-medium text-choco-muted">
              <Clock className="h-3 w-3" />
              {restaurant.openingHours}
            </span>
          )}
          {restaurant.phone && (
            <span className="flex items-center gap-1 text-xs font-medium text-choco-muted">
              <Phone className="h-3 w-3" />
              {restaurant.phone}
            </span>
          )}
          {restaurant.website && (
            <span className="flex items-center gap-1 text-xs font-medium text-brand-dark">
              <Globe className="h-3 w-3" />
              Web
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-center">
        <ArrowRight className="h-4 w-4 text-choco-muted transition group-hover:translate-x-0.5 group-hover:text-brand" />
      </div>
    </Link>
  );
}

export function RestaurantCard({
  restaurant,
  variant = "grid",
}: {
  restaurant: RestaurantItem;
  variant?: "grid" | "row";
}) {
  if (variant === "row") return <RowCard restaurant={restaurant} />;
  return <GridCard restaurant={restaurant} />;
}