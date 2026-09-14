import Link from "next/link";
import { ArrowRight, Mountain, MapPin, Route, Footprints, Bike, Car, Compass } from "lucide-react";
import type { RouteItem } from "@/lib/types";

const ROUTE_TYPE_CONFIG: Record<string, { icon: typeof Mountain; color: string; label: string }> = {
  senderismo: { icon: Footprints, color: "#16a34a", label: "Senderismo" },
  excursion: { icon: Compass, color: "#0ea5e9", label: "Excursión" },
  cultural: { icon: Compass, color: "#6366f1", label: "Cultural" },
  bici: { icon: Bike, color: "#f59e0b", label: "Bici" },
  coche: { icon: Car, color: "#7c3aed", label: "En coche" },
  camino_natural: { icon: Route, color: "#16a34a", label: "Camino natural" },
  naturales: { icon: Mountain, color: "#16a34a", label: "Natural" },
  en_familia: { icon: Compass, color: "#db2777", label: "En familia" },
  aventura: { icon: Compass, color: "#ea580c", label: "Aventura" },
  gastronomica: { icon: Compass, color: "#d97706", label: "Gastronómica" },
  camino_santiago: { icon: Route, color: "#6366f1", label: "Camino de Santiago" },
};

function getRouteConfig(type: string | null): { icon: typeof Mountain; color: string; label: string } {
  if (!type) return { icon: Route, color: "#16a34a", label: "Ruta" };
  return ROUTE_TYPE_CONFIG[type] ?? { icon: Route, color: "#16a34a", label: type };
}

function DiffBadge({ difficulty }: { difficulty: string | null }) {
  if (!difficulty) return null;
  const colors: Record<string, string> = {
    fácil: "bg-green-100 text-green-700",
    media: "bg-yellow-100 text-yellow-700",
    alta: "bg-red-100 text-red-700",
  };
  const cls = colors[difficulty] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>
      {difficulty}
    </span>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="relative grid h-full w-full place-items-center overflow-hidden bg-gradient-to-br from-brand/10 to-brand/5">
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand/8" />
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/90 dark:bg-zinc-100 shadow-sm">
        <Route className="h-6 w-6 text-brand" />
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-2 px-3 text-center text-[10px] font-medium uppercase tracking-widest text-choco-muted"
      >
        {title}
      </span>
    </div>
  );
}

function GridCard({ route }: { route: RouteItem }) {
  const config = getRouteConfig(route.routeType);
  const Icon = config.icon;

  return (
    <Link
      href={`/rutas/${route.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-choco/5 dark:bg-zinc-900 dark:border-zinc-800"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-sand">
        {route.image ? (
          <img
            src={route.image}
            alt={route.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <Placeholder title={route.title} />
        )}
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm" style={{ backgroundColor: config.color }}>
          <Icon className="h-3 w-3 shrink-0" />
          {config.label}
        </span>
        {route.difficulty && (
          <span className="absolute right-3 top-3">
            <DiffBadge difficulty={route.difficulty} />
          </span>
        )}
        <span className="pointer-events-none absolute inset-0 grid place-items-center bg-choco/0 opacity-0 transition duration-300 group-hover:bg-choco/25 dark:bg-ink/25 group-hover:opacity-100">
          <span className="inline-flex translate-y-2 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-choco dark:text-ink shadow-lg transition duration-300 group-hover:translate-y-0">
            Ver ruta
            <ArrowRight className="h-4 w-4" />
          </span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-display text-lg font-semibold leading-snug text-choco dark:text-ink transition-colors group-hover:text-brand-dark">
          {route.title}
        </h3>

        {route.summary && (
          <p className="line-clamp-2 text-sm text-choco-muted">{route.summary}</p>
        )}

        <div className="mt-auto flex items-center gap-3 border-t border-sand pt-3">
          {route.distanceKm && (
            <span className="flex items-center gap-1 text-xs font-semibold text-choco-muted">
              <MapPin className="h-3.5 w-3.5 text-brand" />
              {route.distanceKm} km
            </span>
          )}
          {route.elevationM && (
            <span className="flex items-center gap-1 text-xs font-semibold text-choco-muted">
              <Mountain className="h-3.5 w-3.5 text-brand" />
              {route.elevationM} m
            </span>
          )}
          {route.stagesCount > 0 && (
            <span className="text-xs font-semibold text-choco-muted">
              {route.stagesCount} etapas
            </span>
          )}
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-brand transition group-hover:bg-brand group-hover:text-white ml-auto">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function RowCard({ route }: { route: RouteItem }) {
  const config = getRouteConfig(route.routeType);
  const Icon = config.icon;

  return (
    <Link
      href={`/rutas/${route.slug}`}
      className="group flex items-stretch gap-4 rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 p-4 shadow-sm transition hover:border-brand/40 hover:shadow-md sm:gap-5 dark:bg-zinc-900 dark:border-zinc-800"
    >
      <div className="relative w-20 shrink-0 self-stretch overflow-hidden rounded-xl bg-sand sm:w-28">
        {route.image ? (
          <img
            src={route.image}
            alt={route.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <Placeholder title={route.title} />
        )}
        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{ backgroundColor: config.color }}>
          <Icon className="h-3 w-3 shrink-0" />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ backgroundColor: `${config.color}18`, color: config.color }}>
            {config.label}
          </span>
          <DiffBadge difficulty={route.difficulty} />
        </div>
        <h3 className="mt-1.5 line-clamp-2 font-display text-lg font-semibold leading-snug text-choco transition-colors group-hover:text-brand-dark">
          {route.title}
        </h3>
        {route.summary && (
          <p className="mt-1 line-clamp-1 text-sm text-choco-muted">{route.summary}</p>
        )}
        <div className="mt-2 flex items-center gap-3">
          {route.distanceKm && (
            <span className="text-xs font-semibold text-choco-muted">
              {route.distanceKm} km
            </span>
          )}
          {route.elevationM && (
            <span className="text-xs font-semibold text-choco-muted">
              {route.elevationM} m ↑
            </span>
          )}
          {route.stagesCount > 0 && (
            <span className="text-xs font-semibold text-choco-muted">
              {route.stagesCount} etapas
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

export function RouteCard({
  route,
  variant = "grid",
}: {
  route: RouteItem;
  variant?: "grid" | "row";
}) {
  if (variant === "row") return <RowCard route={route} />;
  return <GridCard route={route} />;
}