import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  HelpCircle,
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
import { HomeAgenda } from "@/components/home-agenda";
import { Reveal } from "@/components/reveal";
import { InstallButton } from "@/components/pwa/install-button";
import { JsonLd } from "@/components/json-ld";
import {
  getActiveFeaturedPick,
  getCategoriesAdmin,
  getCategoriesWithCounts,
  getEventBySlug,
  getFeaturedEvents,
  getEvents,
  getPlanBySlug,
  getRestaurants,
  getRoutes,
  todayStr,
} from "@/lib/db";
import { formatDayLong } from "@/lib/format";
import { site } from "@/lib/site";

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
  const [events, categories, featured, activePick, restaurants, routes, categoryList] =
    await Promise.all([
      getEvents({ from: todayStr(), to: todayStr(7), limit: 200 }),
      getCategoriesWithCounts(),
      getFeaturedEvents(3),
      getActiveFeaturedPick(),
      getRestaurants({ limit: 3 }),
      getRoutes({ limit: 3 }),
      getCategoriesAdmin(),
    ]);
  const today = todayStr();
  const categoryMap = new Map(categoryList.map((c) => [c.id, c]));

  let pickImage: string | null = null;
  if (activePick) {
    const target =
      activePick.linkType === "plan"
        ? await getPlanBySlug(activePick.targetSlug)
        : await getEventBySlug(activePick.targetSlug);
    pickImage = target?.image ?? null;
  }

  const eventsJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Próximos eventos en Huesca",
    itemListElement: events.slice(0, 10).map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${site.url}/eventos/${event.slug}`,
      name: event.title,
    })),
  };

  const faqData = [
    {
      question: "¿Qué hacer hoy en Huesca?",
      answer:
        "Entra en la agenda de Huesca Hoy y verás hoy mismo conciertos, teatro, exposiciones, cine, deporte y planes en familia, con fechas, horarios, lugares y precios. La agenda se actualiza cada día.",
    },
    {
      question: "¿Dónde consulto la agenda cultural de Huesca?",
      answer:
        "Huesca Hoy reúne cada día la agenda cultural y de ocio de Huesca y su provincia: conciertos, teatro, exposiciones, cine, rutas de senderismo, mercados y planes con niños, todo en un solo sitio.",
    },
    {
      question: "¿Qué planes hay este fin de semana en Huesca?",
      answer:
        "En /agenda con el filtro de fin de semana verás todo lo que ocurre en Huesca estos días: música en directo, teatro, exposiciones, mercados, deporte y excursiones por la provincia.",
    },
    {
      question: "¿Hay eventos gratis en Huesca?",
      answer:
        "Sí. Muchas actividades de la agenda de Huesca son gratuitas, como exposiciones, fiestas y mercados. Cada evento indica su precio y cómo llegar al lugar.",
    },
    {
      question: "¿Qué eventos hay para niños en Huesca?",
      answer:
        "Usa la categoría de planes en familia para ver teatro infantil, talleres, cuentacuentos y actividades para niños en Huesca y alrededores.",
    },
    {
      question: "¿Cómo publico mi evento en la agenda de Huesca?",
      answer:
        "Entra en la página Colabora de Huesca Hoy y envíanos tus datos por el formulario. Una persona lo revisa y lo añade a la agenda cultural de Huesca.",
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <JsonLd data={eventsJsonLd} />
      <JsonLd data={faqJsonLd} />

      <section className="relative overflow-hidden bg-choco dark:bg-ink">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-brand/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-56 -left-40 h-[26rem] w-[26rem] rounded-full bg-gold/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-semibold text-gold">
                <CalendarDays className="h-4 w-4" />
                Agenda cultural de {site.city} · actualizada cada día
              </span>
              <h1 className="mt-5 font-display text-3xl font-extrabold leading-[1.05] tracking-tight text-balance text-white sm:text-5xl">
                Qué hacer hoy en {site.city}
              </h1>
              <p className="mt-3 text-lg font-semibold text-gold">{formatDayLong(today)}</p>
              <p className="mt-2 max-w-xl text-white/70">
                Conciertos, teatro, exposiciones, cine y planes en familia: toda la
                agenda cultural de Huesca, al día. Gratis, sin anuncios.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3">
              <Link
                href="/agenda"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-gold px-7 font-semibold text-choco dark:text-ink shadow-md shadow-gold/20 transition hover:brightness-105 active:scale-95"
              >
                Ver toda la agenda
                <ArrowRight className="h-5 w-5" />
              </Link>
              <InstallButton tone="dark-outline" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <HomeAgenda events={events} categories={categoryList} initialDay={today} />
      </section>

      {activePick && <FeaturedPickCard pick={activePick} image={pickImage} />}

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-choco px-3 py-1 text-xs font-semibold text-white dark:bg-ink">
                <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                Selección de la semana
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Los planes de la semana en Huesca
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                category={event.categoryId ? categoryMap.get(event.categoryId) ?? null : null}
              />
            ))}
          </Reveal>
        </section>
      )}

      <section className="border-y border-sand bg-sand/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-white px-3 py-1 text-xs font-semibold text-brand-dark dark:border-brand/40 dark:bg-zinc-900 dark:text-brand-dark">
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
          </Reveal>
          <div className="mt-8">
            <CategoryGrid categories={categories} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand-dark">
              <Search className="h-3.5 w-3.5" />
              Salir y explorar
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Rutas, restaurantes y más de Huesca
            </h2>
            <p className="mt-1 text-choco-muted">
              No solo eventos: explora las mejores rutas de senderismo y los restaurantes de
              Huesca y su provincia.
            </p>
          </div>
          <Link
            href="/cultura"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand transition hover:text-brand-dark"
          >
            Guía de cultura en Huesca <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <Reveal className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-5 sm:grid-cols-2">
            <Link
              href="/rutas"
              className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-choco/5"
            >
              <Mountain className="h-10 w-10 text-brand" />
              <h3 className="font-display text-lg font-bold text-choco dark:text-ink">Rutas y senderismo</h3>
              <p className="text-sm text-choco-muted">Senderismo, bicicleta, cultural y excursiones por la provincia.</p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-dark">
                Explorar <ArrowRight className="h-4 w-4" />
              </span>
            </Link>

            <Link
              href="/restaurantes"
              className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-choco/5"
            >
              <UtensilsCrossed className="h-10 w-10 text-brand" />
              <h3 className="font-display text-lg font-bold text-choco dark:text-ink">Dónde comer</h3>
              <p className="text-sm text-choco-muted">Restaurantes, bares y tabernas: cocina aragonesa y fusión.</p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-dark">
                Ver restaurantes <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>

          <Link
            href="/buscar"
            className="group flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-brand/30 bg-brand/5 p-10 text-center transition hover:border-brand hover:bg-brand/10"
          >
            <Search className="h-12 w-12 text-brand" />
            <div>
              <h3 className="font-display text-xl font-bold text-choco dark:text-ink">Buscar todo</h3>
              <p className="mt-1 max-w-xs text-sm text-choco-muted">Eventos, rutas, restaurantes y planes en un solo buscador.</p>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-dark">
              Abrir buscador <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </Reveal>

        {routes.length > 0 && (
          <div className="mt-10">
            <div className="mb-4 flex items-end justify-between">
              <h3 className="font-display text-lg font-bold text-choco dark:text-ink">Rutas destacadas</h3>
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
              <h3 className="font-display text-lg font-bold text-choco dark:text-ink">Restaurantes para ti</h3>
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

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-dark to-choco dark:to-ink p-8 text-white shadow-lg sm:p-12">
            <Users
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
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 font-semibold text-choco dark:text-ink shadow-md transition hover:bg-white/90 active:scale-95"
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
        </Reveal>
      </section>

      <section className="border-t border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal className="mb-8 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand-dark">
              <HelpCircle className="h-3.5 w-3.5" />
              Guía rápida
            </span>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Preguntas frecuentes sobre la agenda cultural de Huesca
            </h2>
            <p className="mt-1 text-choco-muted">
              Resolvemos las dudas más habituales para sacarle partido a la
              agenda de {site.city}.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="grid gap-4 sm:grid-cols-2">
            {faqData.map((item) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-sand bg-cream/50 px-5 py-4 transition hover:border-brand/30 dark:bg-zinc-800/60 dark:border-zinc-700"
              >
                <summary className="flex cursor-pointer list-none items-center gap-3 font-semibold text-choco">
                  <span className="flex-1">{item.question}</span>
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand/10 text-brand-dark transition group-open:rotate-180">
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-choco-muted">
                  {item.answer}
                </p>
              </details>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-choco dark:bg-ink p-8 text-white sm:p-12">
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
                <p className="mt-3 max-w-lg leading-relaxed text-white/75">
                  La agenda cultural de Huesca funciona como una app del móvil:
                  consulta qué hacer hoy aunque no tengas cobertura, sin pasar
                  por ninguna tienda.
                </p>
              </div>
              <InstallButton tone="light" />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}