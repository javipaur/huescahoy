import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, Compass, Sparkles } from "lucide-react";
import { getPlans } from "@/lib/db";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Planes y guías para disfrutar de Huesca",
  description:
    "Rutas por la naturaleza, planes en familia, un día completo por Huesca y guías útiles de la ciudad. Planes probados sobre el terreno para que solo disfrutes.",
  alternates: {
    canonical: "/planes",
  },
  openGraph: {
    type: "website",
    locale: site.locale,
    title: `${site.name} · Planes y guías para disfrutar de Huesca`,
    description:
      "Rutas, planes en familia y un día completo por Huesca. Guías probadas para que solo tengas que disfrutar.",
    images: [{ url: "/opengraph-image" }],
  },
};

export const dynamic = "force-dynamic";

export default async function PlanesPage() {
  const plans = await getPlans();
  const [featured, ...rest] = plans;

  function minutes(body: string): number {
    return Math.max(1, Math.round(body.trim().split(/\s+/).length / 200));
  }

  return (
    <>
      <section className="bg-choco dark:bg-ink text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-semibold text-gold">
            <Compass className="h-4 w-4" />
            La magia de Huesca
          </span>
          <h1 className="mt-5 max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight text-balance sm:text-5xl">
            Planes y guías para{" "}
            <span className="text-gold">disfrutar de Huesca</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/70">
            Rutas por los cañones y la Sierra, un día perfecto por la ciudad,
            escapadas en familia... Guías probadas sobre el terreno para que
            solo tengas que disfrutar.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/agenda?desde=hoy"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-semibold text-choco dark:text-ink shadow-md shadow-gold/20 transition hover:brightness-105 active:scale-95"
            >
              <CalendarDays className="h-5 w-5" />
              Ver la agenda de hoy
            </Link>
            {plans.length > 0 && (
              <span className="text-sm font-medium text-white/60">
                {plans.length} {plans.length === 1 ? "guía publicada" : "guías publicadas"}
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {plans.length === 0 && (
          <div className="rounded-2xl border border-dashed border-sand bg-sand/40 p-10 text-center text-choco-muted">
            Pronto publicaremos los primeros planes. ¡Vuelve en un momento!
          </div>
        )}

        {featured && (
          <Link
            href={`/planes/${featured.slug}`}
            className="group relative flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-3xl bg-sand shadow-sm"
          >
            {featured.image ? (
              <Image
                src={featured.image}
                alt={featured.title}
                fill
                priority
                sizes="(min-width: 1152px) 1152px, 100vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-br from-brand via-brand-dark to-choco dark:to-ink"
              />
            )}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-choco/90 via-choco/35 to-transparent dark:from-ink/90 dark:via-ink/35"
            />
            <div className="relative flex flex-col gap-3 p-7 sm:p-9">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Guía destacada
              </span>
              <h2 className="max-w-xl font-display text-2xl font-bold text-white text-balance sm:text-3xl">
                {featured.title}
              </h2>
              {featured.summary && (
                <p className="max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
                  {featured.summary}
                </p>
              )}
              <span className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-white/70">
                <Clock className="h-3.5 w-3.5 text-gold" />
                {minutes(featured.body)} min de lectura
              </span>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold">
                Leer el plan
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        )}

        {rest.length > 0 && (
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {rest.map((plan) => (
              <Link
                key={plan.id}
                href={`/planes/${plan.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-choco/5 dark:bg-zinc-900 dark:border-zinc-800"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-sand">
                  {plan.image ? (
                    <Image
                      src={plan.image}
                      alt={plan.title}
                      fill
                      sizes="(min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand/15 to-gold/20">
                      <Compass className="h-10 w-10 text-brand" />
                    </div>
                  )}
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-choco dark:text-ink shadow-sm backdrop-blur">
                    <Compass className="h-3.5 w-3.5 text-brand" />
                    Guía de {site.city}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-6">
                  <h2 className="line-clamp-2 font-display text-xl font-bold text-choco transition-colors group-hover:text-brand-dark">
                    {plan.title}
                  </h2>
                  {plan.summary && (
                    <p className="line-clamp-2 text-sm leading-relaxed text-choco-muted">
                      {plan.summary}
                    </p>
                  )}
                  <p className="inline-flex items-center gap-1.5 pt-1 text-xs font-medium text-choco-muted">
                    <Clock className="h-3.5 w-3.5 text-brand" />
                    {minutes(plan.body)} min de lectura
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-semibold text-brand-dark">
                    Leer el plan
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="relative mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-dark to-choco dark:to-ink p-8 text-white shadow-lg sm:p-10">
          <Compass
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 text-white/10"
            strokeWidth={1.2}
          />
          <div className="relative">
            <h2 className="max-w-lg font-display text-2xl font-bold tracking-tight text-balance sm:text-3xl">
              ¿Qué plan te gustaría encontrar aquí?
            </h2>
            <p className="mt-3 max-w-lg leading-relaxed text-white/85">
              Rutas secretas, terrazas con encanto, planes con niños:
              cuéntanos qué echa en falta y lo preparamos.
            </p>
            <Link
              href="/colabora#formulario"
              className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/40 px-7 font-semibold text-white transition hover:bg-white/10 active:scale-95"
            >
              Sugerir un plan <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
