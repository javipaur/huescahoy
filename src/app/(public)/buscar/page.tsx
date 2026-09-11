import type { Metadata } from "next";
import { Search } from "lucide-react";
import { site } from "@/lib/site";
import { getEvents, getRestaurants, getRoutes, getPlans, getCategoriesWithCounts } from "@/lib/db";
import { GlobalSearch } from "@/components/global-search";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buscar en HuescaHoy",
  description: "Busca eventos, rutas, restaurantes y planes en Huesca y su provincia.",
  alternates: { canonical: "/buscar" },
};

export default async function BuscarPage() {
  const [events, restaurants, routes, plans, categories] = await Promise.all([
    getEvents({ limit: 500 }),
    getRestaurants({ limit: 500 }),
    getRoutes({ limit: 500 }),
    getPlans(),
    getCategoriesWithCounts(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand">
          <Search className="h-3.5 w-3.5" />
          Buscador híbrido
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Busca en {site.city}
        </h1>
        <p className="mt-2 text-choco-muted">
          Encuentra eventos, rutas, restaurantes y planes en un solo lugar.
        </p>
      </div>

      <GlobalSearch
        events={events}
        routes={routes}
        restaurants={restaurants}
        plans={plans}
        categories={categories}
      />
    </div>
  );
}