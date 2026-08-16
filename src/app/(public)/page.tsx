import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Bug,
  CalendarPlus,
  Lightbulb,
  Star,
  Users,
} from "lucide-react";
import { EventCard } from "@/components/event-card";
import { CategoryGrid } from "@/components/category-grid";
import { HomeHero } from "@/components/home-hero";
import { InstallButton } from "@/components/pwa/install-button";
import { JsonLd } from "@/components/json-ld";
import { PhotoCredit } from "@/components/photo-credit";
import {
  getCategoriesAdmin,
  getCategoriesWithCounts,
  getFeaturedEvents,
  getUpcomingEvents,
  getStats,
} from "@/lib/db";
import { photos } from "@/lib/photos";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Agenda cultural de Huesca",
  description:
    "La agenda cultural de Huesca (Huesca City): conciertos, teatro, exposiciones, deporte, cine y planes en familia. Todo lo que pasa en Huesca hoy y en los próximos días.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: site.url,
    title: `${site.name} · ${site.tagline}`,
    description:
      "Conciertos, teatro, exposiciones, deporte y planes en familia. La agenda cultural de Huesca, cada día.",
    images: [{ url: "/opengraph-image" }],
  },
};

const COLLAB_ITEMS = [
  {
    Icon: CalendarPlus,
    title: "Publica tu evento",
    text: "¿Organizas algo? Lo añadimos a la agenda tras una revisión rápida.",
  },
  {
    Icon: Bug,
    title: "Reporta un fallo",
    text: "Un horario mal, un enlace roto, un dato que no cuadra: lo corregimos.",
  },
  {
    Icon: Lightbulb,
    title: "Propón una idea",
    text: "Se te ocurre cómo mejorar la web o la ciudad: aquí se escucha.",
  },
];

export default async function HomePage() {
  const [events, categories, stats, featured, categoryList] = await Promise.all([
    getUpcomingEvents(6),
    getCategoriesWithCounts(),
    getStats(),
    getFeaturedEvents(3),
    getCategoriesAdmin(),
  ]);
  const categoryMap = new Map(categoryList.map((c) => [c.id, c]));

  const eventsJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Próximos eventos en Huesca",
    itemListElement: events.map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${site.url}/eventos/${event.slug}`,
      name: event.title,
    })),
  };

  return (
    <>
      <JsonLd data={eventsJsonLd} />
      <HomeHero stats={stats} categories={categories} />

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-choco px-3 py-1 text-xs font-semibold text-cream">
                <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                Selección de la semana
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Planes que nos gustan especialmente
              </h2>
              <p className="mt-1 text-choco-muted">
                Elegidos a mano por el equipo, no por un algoritmo.
              </p>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                category={event.categoryId ? categoryMap.get(event.categoryId) ?? null : null}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand">
              <CalendarPlus className="h-3.5 w-3.5" />
              Lo próximo
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Próximos eventos
            </h2>
            <p className="mt-1 text-choco-muted">
              Lo que está por venir en los próximos días.
            </p>
          </div>
          <Link
            href="/agenda"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand transition hover:text-brand-dark"
          >
            Ver toda la agenda <ArrowRight className="h-4 w-4" />
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
                category={event.categoryId ? categoryMap.get(event.categoryId) ?? null : null}
              />
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-sand bg-sand/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-white px-3 py-1 text-xs font-semibold text-brand">
              <Star className="h-3.5 w-3.5" />
              Categorías
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Explora por categoría
            </h2>
            <p className="mt-1 text-choco-muted">
              Encuentra el plan que buscas al instante.
            </p>
          </div>
          <div className="mt-8">
            <CategoryGrid categories={categories} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative order-2 lg:order-1">
            <div className="overflow-hidden rounded-3xl border border-sand shadow-lg">
              <Image
                src={photos.plazaNavarra.url}
                alt={photos.plazaNavarra.alt}
                width={2048}
                height={1536}
                className="aspect-[4/3] w-full object-cover"
                sizes="(min-width: 1024px) 560px, 100vw"
              />
            </div>
            <div className="absolute -bottom-7 left-6 rounded-2xl bg-choco px-5 py-4 text-cream shadow-xl">
              <p className="font-display text-lg font-bold">Hecho en Huesca</p>
              <p className="text-xs text-cream/70">por y para la ciudad</p>
            </div>
            <PhotoCredit
              photo={photos.plazaNavarra}
              className="mt-9 text-choco-muted/60"
            />
          </div>

          <div className="order-1 lg:order-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand">
              <Users className="h-3.5 w-3.5" />
              Colabora
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-balance sm:text-3xl">
              La agenda se construye entre todos
            </h2>
            <p className="mt-3 max-w-lg leading-relaxed text-choco-muted">
              {site.name} no tiene redacción: la alimentan las personas que
              viven {site.city}. Tú sabes lo que pasa en tu barrio antes que
              nadie, así que cuéntanoslo.
            </p>

            <ul className="mt-7 space-y-4">
              {COLLAB_ITEMS.map((item) => {
                const Icon = item.Icon;
                return (
                  <li key={item.title} className="flex items-start gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-choco">{item.title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-choco-muted">
                        {item.text}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/colabora"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark"
              >
                Quiero colaborar <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/colabora#publica"
                className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-6 py-3 font-semibold text-choco transition hover:bg-sand"
              >
                <CalendarPlus className="h-5 w-5 text-brand" />
                Publicar mi evento
              </Link>
            </div>
            <p className="mt-4 text-xs text-choco-muted">
              Respuesta humana, no un bot: cada aportación la lee una persona.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-choco p-8 text-cream sm:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand/30 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl"
          />
          <div className="relative grid items-center gap-8 sm:grid-cols-[1fr_auto]">
            <div>
              <p className="text-sm font-semibold text-gold">
                Instalable y sin conexión
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Lleva Huesca Hoy siempre contigo
              </h2>
              <p className="mt-3 max-w-lg leading-relaxed text-cream/75">
                Funciona como una app del móvil: consulta la agenda aunque no
                tengas cobertura, sin instalar nada desde una tienda.
              </p>
            </div>
            <InstallButton tone="light" />
          </div>
        </div>
      </section>
    </>
  );
}
