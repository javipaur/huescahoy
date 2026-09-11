import type { Metadata } from "next";
import { Suspense } from "react";
import { Route } from "lucide-react";
import { getRoutes } from "@/lib/db";
import { site } from "@/lib/site";
import { RouteListView } from "./list-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rutas y senderismo en Huesca",
  description:
    "Descubre las mejores rutas de senderismo, bicicleta, cultural y turismo por la provincia de Huesca: Pirineo, Sierra de Guara, caminos de Santiago y más.",
  alternates: {
    canonical: "/rutas",
  },
  openGraph: {
    type: "website",
    locale: site.locale,
    title: "Rutas y senderismo en Huesca",
    description: "Senderismo, bicid, cultural y turismo por la provincia de Huesca.",
    images: [{ url: "/opengraph-image" }],
  },
};

export default async function RutasPage() {
  const routes = await getRoutes({ limit: 500 });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand">
          <Route className="h-3.5 w-3.5" />
          Explora Huesca
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Rutas y senderismo en {site.city}
        </h1>
        <p className="mt-2 text-choco-muted">
          Senderismo, bicicleta, cultural, caminos naturales y excursiones por la provincia.
        </p>
      </div>

      <Suspense fallback={<div className="text-choco-muted">Cargando rutas…</div>}>
        <RouteListView routes={routes} />
      </Suspense>
    </div>
  );
}