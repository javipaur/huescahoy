import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarPlus,
  MapPin,
  Mountain,
  Search,
  Star,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { EventCard } from "@/components/event-card";
import { RestaurantCard } from "@/components/restaurant-card";
import { RouteCard } from "@/components/route-card";
import { CategoryGrid } from "@/components/category-grid";
import { FeaturedPickCard } from "@/components/featured-pick-card";
import { HomeHero } from "@/components/home-hero";
import { InstallButton } from "@/components/pwa/install-button";
import { JsonLd } from "@/components/json-ld";
import {
  getActiveFeaturedPick,
  getCategoriesAdmin,
  getCategoriesWithCounts,
  getEventBySlug,
  getFeaturedEvents,
  getPlanBySlug,
  getUpcomingEvents,
  getStats,
  getRestaurants,
  getRoutes,
} from "@/lib/db";
import { site } from "@/lib/site";
import { zoneFor } from "@/lib/zones";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Agenda cultural de Huesca",
  description:
    "Qué hacer en Huesca hoy y este fin de semana: conciertos, teatro, exposiciones, cine, deporte y planes en familia. La agenda cultural de Huesca y su provincia, actualizada cada día.",
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

export default async function HomePage() {
  const [allEvents, categories, stats, featured, categoryList, activePick, restaurants, routes] =
    await Promise.all([
      getUpcomingEvents(60),
      getCategoriesWithCounts(),
      getStats(),
      getFeaturedEvents(3),
      getCategoriesAdmin(),
      getActiveFeaturedPick(),
      getRestaurants({ limit: 3 }),
      getRoutes({ limit: 3 }),
    ]);
  const categoryMap = new Map(categoryList.map((c) => [c.id, c]));

  let pickImage: string | null = null;
  if (activePick) {
    const target =
      activePick.linkType === "plan"
        ? await getPlanBySlug(activePick.targetSlug)
        : await getEventBySlug(activePick.targetSlug);
    pickImage = target?.image ?? null;
  }

  const today = new Date().toISOString().slice(0, 10);
  const isOngoing = (event: (typeof allEvents)[number]) =>
    event.startDate < today && (event.endDate ?? event.startDate) >= today;
  const inCity = (event: (typeof allEvents)[number]) =>
    zoneFor(event) === "ciudad" || zoneFor(event) === null;

  const cityEvents = [
    ...allEvents.filter((event) => inCity(event) && !isOngoing(event)).slice(0, 6),
    ...allEvents.filter((event) => inCity(event) && isOngoing(event)).slice(0, 2),
  ];
  const provinceEvents = [
    ...allEvents
      .filter((event) => zoneFor(event) === "provincia" && !isOngoing(event))
      .slice(0, 3),
    ...allEvents
      .filter((event) => zoneFor(event) === "provincia" && isOngoing(event))
      .slice(0, 1),
  ];

  const eventsJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Próximos eventos en Huesca",
    itemListElement: cityEvents.map((event, index) => ({
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

      {activePick && <FeaturedPickCard pick={activePick} image={pickImage} />}

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-choco px-3 py-1 text-xs font-semibold text-cream">
                <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                Selección de la semana
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Los planes de la semana en Huesca
              </h2>
              <p className="mt-1 text-choco-muted">
                Elegidos a mano por el equipo: lo mejor del teatro, la música y
                las exposiciones de Huesca estos días.
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
              Qué hacer en Huesca hoy y estos días
            </h2>
            <p className="mt-1 text-choco-muted">
              Los próximos conciertos, obras de teatro, exposiciones y planes
              en familia de la agenda cultural de Huesca. Actualizado cada día.
            </p>
          </div>
          <Link
            href="/agenda"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand transition hover:text-brand-dark"
          >
            Ver toda la agenda <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {cityEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sand bg-sand/40 p-10 text-center text-choco-muted">
            Todavía no hay eventos publicados. ¡Vuelve en un momento!
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cityEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                category={event.categoryId ? categoryMap.get(event.categoryId) ?? null : null}
              />
            ))}
          </div>
        )}
      </section>

      {provinceEvents.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-gold bg-gold/20 px-3 py-1 text-xs font-semibold text-choco">
                <MapPin className="h-3.5 w-3.5 text-brand" />
                También en la provincia
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Planes por toda la provincia de Huesca
              </h2>
              <p className="mt-1 text-choco-muted">
                Fiestas, conciertos y cultura en los pueblos: Aínsa, Barbastro,
                Fraga, Sariñena y la Sierra de Guara.
              </p>
            </div>
            <Link
              href="/agenda?zona=provincia"
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-dark transition hover:text-brand"
            >
              Ver toda la provincia <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {provinceEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                category={event.categoryId ? categoryMap.get(event.categoryId) ?? null : null}
              />
            ))}
          </div>
        </section>
      )}

      <section className="border-y border-sand bg-sand/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-white px-3 py-1 text-xs font-semibold text-brand">
              <Star className="h-3.5 w-3.5" />
              Categorías
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Explora la agenda por categoría
            </h2>
            <p className="mt-1 text-choco-muted">
              Música, teatro, exposiciones, deporte, cine y planes con niños:
              encuentra en un clic qué hacer en Huesca.
            </p>
          </div>
          <div className="mt-8">
            <CategoryGrid categories={categories} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand">
              <Search className="h-3.5 w-3.5" />
              Buscador híbrido
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Descubre Huesca: rutas, restaurantes y más
            </h2>
            <p className="mt-1 text-choco-muted">
              No solo eventos: explora las mejores rutas de senderismo y los restaurantes de Huesca y su provincia.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/buscar"
            className="group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-brand/30 bg-brand/5 p-8 text-center transition hover:border-brand hover:bg-brand/10"
          >
            <Search className="h-10 w-10 text-brand" />
            <h3 className="font-display text-lg font-bold text-choco">Buscar todo</h3>
            <p className="text-sm text-choco-muted">Eventos, rutas, restaurantes y planes en un solo buscador.</p>
          </Link>

          <Link
            href="/rutas"
            className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-sand bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-choco/5"
          >
            <Mountain className="h-10 w-10 text-brand" />
            <h3 className="font-display text-lg font-bold text-choco">Rutas y senderismo</h3>
            <p className="text-sm text-choco-muted">Senderismo, bicicleta, cultural y excursiones por la provincia.</p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
              Explorar <ArrowRight className="h-4 w-4" />
            </span>
          </Link>

          <Link
            href="/restaurantes"
            className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-sand bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-choco/5"
          >
            <UtensilsCrossed className="h-10 w-10 text-brand" />
            <h3 className="font-display text-lg font-bold text-choco">Dónde comer</h3>
            <p className="text-sm text-choco-muted">Restaurantes, bares y tabernas: cocina aragonesa y fusión.</p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
              Ver restaurantes <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>

        {routes.length > 0 && (
          <div className="mt-10">
            <div className="mb-4 flex items-end justify-between">
              <h3 className="font-display text-lg font-bold text-choco">Rutas destacadas</h3>
              <Link href="/rutas" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-dark">
                Ver todas <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {routes.map((route) => (
                <RouteCard key={route.id} route={route} />
              ))}
            </div>
          </div>
        )}

        {restaurants.length > 0 && (
          <div className="mt-10">
            <div className="mb-4 flex items-end justify-between">
              <h3 className="font-display text-lg font-bold text-choco">Restaurantes para ti</h3>
              <Link href="/restaurantes" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-dark">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-dark to-choco p-8 text-white shadow-lg sm:p-12">
          <CalendarPlus
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-8 h-56 w-56 text-white/10"
            strokeWidth={1.2}
          />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
              <Users className="h-3.5 w-3.5" />
              Colabora
            </span>
            <h2 className="mt-4 max-w-xl font-display text-2xl font-bold tracking-tight text-balance sm:text-3xl">
              Una agenda de Huesca hecha entre todos
            </h2>
            <p className="mt-3 max-w-lg leading-relaxed text-white/85">
              {site.name} no tiene redacción: la alimentan las personas que
              viven {site.city}. Tú sabes qué pasa en tu barrio antes que
              nadie, así que cuéntanoslo y lo contaremos con la ciudad entera.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/colabora#publica"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 font-semibold text-choco shadow-md transition hover:bg-cream active:scale-95"
              >
                Publicar mi evento <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/colabora#formulario"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/40 px-7 font-semibold text-white transition hover:bg-white/10 active:scale-95"
              >
                Reportar un fallo o proponer una idea
              </Link>
            </div>
            <p className="mt-4 text-xs text-white/70">
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
                La agenda cultural de Huesca funciona como una app del móvil:
                consulta qué hacer hoy aunque no tengas cobertura, sin pasar
                por ninguna tienda.
              </p>
            </div>
            <InstallButton tone="light" />
          </div>
        </div>
      </section>
    </>
  );
}
