import type { Metadata } from "next";
import { Suspense } from "react";
import { UtensilsCrossed } from "lucide-react";
import { getRestaurants } from "@/lib/db";
import { site } from "@/lib/site";
import { RestaurantListView } from "./list-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Restaurantes en Huesca",
  description:
    "Directorio de restaurantes, bares y cafeterías en Huesca: cocina aragonesa, mediterránea y fusión. Encuentra dónde comer en la ciudad y la provincia.",
  alternates: {
    canonical: "/restaurantes",
  },
  openGraph: {
    type: "website",
    locale: site.locale,
    title: `Restaurantes en ${site.city}`,
    description: "Directorio de restaurantes, bares y cafeterías en Huesca.",
    images: [{ url: "/opengraph-image" }],
  },
};

export default async function RestaurantesPage() {
  const restaurants = await getRestaurants({ limit: 500 });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand">
          <UtensilsCrossed className="h-3.5 w-3.5" />
          Directorio gastronómico
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Dónde comer en {site.city}
        </h1>
        <p className="mt-2 text-choco-muted">
          Restaurantes, bares y cafeterías de Huesca y su provincia.
        </p>
      </div>

      <Suspense fallback={<div className="text-choco-muted">Cargando restaurantes…</div>}>
        <RestaurantListView restaurants={restaurants} />
      </Suspense>
    </div>
  );
}