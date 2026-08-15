import Link from "next/link";
import { ArrowRight, CalendarDays, Smartphone, Star } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { CategoryGrid } from "@/components/category-grid";
import { InstallButton } from "@/components/pwa/install-button";
import {
  getCategoriesWithCounts,
  getFeaturedEvents,
  getUpcomingEvents,
  getCategoryById,
  getStats,
} from "@/lib/db";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [events, categories, stats, featured] = await Promise.all([
    getUpcomingEvents(6),
    getCategoriesWithCounts(),
    getStats(),
    getFeaturedEvents(3),
  ]);

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-brand/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-48 -left-32 h-[26rem] w-[26rem] rounded-full bg-gold/30 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/5 px-4 py-1.5 text-sm font-semibold text-brand">
            <CalendarDays className="h-4 w-4" />
            La agenda de {site.city}
          </span>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-6xl">
            No te pierdas <span className="text-brand">nada</span> de lo que
            pasa en Huesca
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-choco-muted">
            Conciertos, teatro, exposiciones, deporte, cine y planes en familia.
            Toda la vida de la ciudad, siempre a mano.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/agenda"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark"
            >
              Ver la agenda
              <ArrowRight className="h-5 w-5" />
            </Link>
            <InstallButton tone="outline" />
          </div>

          <div className="mt-12 flex flex-wrap gap-x-10 gap-y-5 border-t border-sand pt-8">
            <div>
              <p className="font-display text-3xl font-bold text-choco">
                {stats.upcoming}
                <span className="text-brand">+</span>
              </p>
              <p className="mt-0.5 text-sm text-choco-muted">eventos próximos</p>
            </div>
            <div>
              <p className="font-display text-3xl font-bold text-choco">
                {stats.categories}
              </p>
              <p className="mt-0.5 text-sm text-choco-muted">categorías</p>
            </div>
            <div className="flex flex-col justify-center">
              <p className="inline-flex items-center gap-2 font-display text-base font-semibold text-choco">
                <Smartphone className="h-4 w-4 text-brand" />
                Instalable y offline
              </p>
              <p className="mt-0.5 text-sm text-choco-muted">
                como una app del móvil
              </p>
            </div>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-choco px-3 py-1 text-xs font-semibold text-cream">
                <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                Recomendado por HuescaHoy
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Nuestra selección de la semana
              </h2>
              <p className="mt-1 text-choco-muted">
                Planes que no te deberías perder.
              </p>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                category={event.categoryId ? getCategoryById(event.categoryId) : null}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Próximos eventos
            </h2>
            <p className="mt-1 text-choco-muted">Lo que viene en los próximos días.</p>
          </div>
          <Link
            href="/agenda"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand transition hover:text-brand-dark"
          >
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sand bg-sand/40 p-10 text-center text-choco-muted">
            Todavía no hay eventos publicados. ¡Vuelve en un momento!
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                category={event.categoryId ? getCategoryById(event.categoryId) : null}
              />
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-sand bg-sand/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Explora por categoría
          </h2>
          <p className="mt-1 text-choco-muted">
            Encuentra el plan que buscas al instante.
          </p>
          <div className="mt-8">
            <CategoryGrid categories={categories} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-choco p-8 text-cream sm:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand/30 blur-3xl"
          />
          <div className="relative grid items-center gap-8 sm:grid-cols-[1fr_auto]">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Instala HuescaHoy y llévalo siempre contigo
              </h2>
              <p className="mt-3 max-w-lg text-cream/80">
                Funciona como una app del móvil: accede a la agenda aunque no
                tengas conexión.
              </p>
            </div>
            <InstallButton tone="light" />
          </div>
        </div>
      </section>
    </>
  );
}
