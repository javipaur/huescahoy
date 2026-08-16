import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { getPlans } from "@/lib/db";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Planes y guías de Huesca",
  description:
    "Planes y guías útiles para disfrutar de Huesca: rutas, ideas en familia, un día completo por la ciudad y más. Lo hemos probado para que solo disfrutes.",
  alternates: {
    canonical: "/planes",
  },
  openGraph: {
    type: "website",
    locale: site.locale,
    title: "Planes y guías de Huesca",
    description:
      "Rutas, planes en familia y un día completo por Huesca. Ideas probadas para que solo disfrutes.",
    images: [{ url: "/opengraph-image" }],
  },
};

export const dynamic = "force-dynamic";

export default async function PlanesPage() {
  const plans = await getPlans();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/5 px-4 py-1.5 text-sm font-semibold text-brand">
        <Compass className="h-4 w-4" />
        Planes y guías
      </span>
      <h1 className="mt-5 max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
        Ideas para disfrutar de {site.city}
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-choco-muted">
        Rutas, planes en familia, un día completo por la ciudad... Lo hemos
        probado para que solo tengas que disfrutar.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {plans.length === 0 && (
          <div className="rounded-2xl border border-dashed border-sand bg-sand/40 p-10 text-center text-choco-muted sm:col-span-2">
            Pronto publicaremos los primeros planes. ¡Vuelve en un momento!
          </div>
        )}
        {plans.map((plan) => (
          <Link
            key={plan.id}
            href={`/planes/${plan.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-sand bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-choco/5"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-sand">
              {plan.image ? (
                <img
                  src={plan.image}
                  alt={plan.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand/15 to-gold/20">
                  <Compass className="h-10 w-10 text-brand" />
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 p-6">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand">
                <Compass className="h-3.5 w-3.5" />
                Guía de {site.city}
              </span>
              <h2 className="line-clamp-2 font-display text-xl font-bold text-choco transition-colors group-hover:text-brand-dark">
                {plan.title}
              </h2>
              {plan.summary && (
                <p className="line-clamp-2 text-sm leading-relaxed text-choco-muted">
                  {plan.summary}
                </p>
              )}
              <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-semibold text-brand">
                Leer el plan
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
