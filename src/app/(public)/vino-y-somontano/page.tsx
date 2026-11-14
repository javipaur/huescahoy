import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, UtensilsCrossed, Wine } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { RestaurantCard } from "@/components/restaurant-card";
import { RouteCard } from "@/components/route-card";
import { getCategoriesAdmin, getEvents, getRestaurants, getRoutes, todayStr } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vino y Somontano en Huesca",
  description:
    "Vino y Somontano: Denominación de Origen, bodegas, enoturismo, gastronomía, rutas y eventos en Barbastro y la comarca. Información y datos para tu escapada.",
  alternates: { canonical: "/vino-y-somontano" },
};

function filterSomontano<T extends { title?: string; name?: string; description?: string | null; location?: string | null; address?: string | null; summary?: string | null }>(items: T[]) {
  return items.filter((i) => /somontano|vino|bodega|barbastro|enate|viñas del vero|blecua|lalanne/i.test(
    `${i.title || ""} ${i.name || ""} ${i.description || ""} ${i.summary || ""} ${i.location || ""} ${i.address || ""}`
  ));
}

const DATOS_SOMONTANO = [
  { title: "Denominación de Origen Somontano", text: "Una de las DO históricas de Aragón, con vinos tintos, blancos y rosados que reflejan el clima continental y la diversidad de suelos entre la sierra y el llano." },
  { title: "Barbastro, capital del Somontano", text: "Ciudad de referencia para el enoturismo, con catedral, casco histórico, oferta gastronómica y acceso a bodegas y experiencias en la comarca." },
  { title: "Ruta del Vino Somontano", text: "Propuestas de visitas a bodegas, catas, maridajes y actividades en torno al vino, con una agenda que se refuerza en temporadas como el Mes del Enoturismo." },
  { title: "Bodegas y experiencias", text: "La zona reúne bodegas de distintos perfiles (tradicionales y contemporáneas) con visitas guiadas, catas comentadas y experiencias entre viñedos." },
  { title: "Gastronomía y producto local", text: "La cocina del Somontano combina vinos de la DO con producto de huerta, carnes y recetas tradicionales, ideal para maridar en restaurantes y bares." },
  { title: "Paisaje y rutas", text: "Viñedos, pueblos como Alquézar o Salas Bajas y caminos entre sierras ofrecen rutas a pie, en bici o en coche para completar la escapada." },
];

export default async function VinoSomontanoPage() {
  const today = todayStr();
  const [events, restaurants, routes, categories] = await Promise.all([
    getEvents({ q: "Somontano", from: today, limit: 40 }),
    getRestaurants({ q: "Somontano", limit: 40 }),
    getRoutes({ limit: 60 }),
    getCategoriesAdmin(),
  ]);
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const rutasSomontano = filterSomontano(routes).slice(0, 6);
  const eventosSomontano = (events.length ? events : filterSomontano(await getEvents({ from: today, limit: 120 }))).slice(0, 6);
  const restaurantesSomontano = (restaurants.length ? restaurants : filterSomontano(await getRestaurants({ limit: 120 }))).slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav aria-label="Migas de pan" className="mb-6 text-sm text-choco-muted">
        <Link href="/" className="transition hover:text-brand">Inicio</Link>
        <span aria-hidden className="mx-2">/</span>
        <span className="font-medium text-choco dark:text-ink">Vino y Somontano</span>
      </nav>

      <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand-dark">
        <Wine className="h-3.5 w-3.5" />
        Vino y Somontano
      </span>
      <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-choco dark:text-ink sm:text-4xl">
        Vino y Somontano
      </h1>
      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-choco-muted">
        Enoturismo, bodegas, gastronomía y paisajes en la Denominación de Origen Somontano. Información y datos
        disponibles (eventos, restaurantes y rutas) para planear una escapada en torno al vino en Huesca.
      </p>

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1.5 font-medium text-choco dark:text-ink">
          <Wine className="h-4 w-4 text-brand" /> D.O. Somontano · Barbastro y comarca
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1.5 font-medium text-choco dark:text-ink">
          <CalendarDays className="h-4 w-4 text-brand" /> {eventosSomontano.length} eventos relacionados
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1.5 font-medium text-choco dark:text-ink">
          <UtensilsCrossed className="h-4 w-4 text-brand" /> {restaurantesSomontano.length} sitios para comer/beber
        </span>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold tracking-tight text-choco dark:text-ink">Información y datos clave</h2>
        <p className="mt-1 max-w-2xl text-choco-muted">Lo esencial para conocer el Somontano y organizar tu visita.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DATOS_SOMONTANO.map((item) => (
            <div key={item.title} className="rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5 shadow-sm">
              <h3 className="font-display text-base font-bold text-choco dark:text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-choco-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 rounded-2xl border border-sand bg-sand/40 p-5">
        <h2 className="font-display text-lg font-bold text-choco dark:text-ink">Ideas para tu escapada</h2>
        <ul className="mt-3 grid gap-2 text-sm text-choco-muted sm:grid-cols-2">
          <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />Visita una bodega con cata y recorre Barbastro y su casco histórico.</li>
          <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />Combina vino y naturaleza con una ruta por viñedos o hacia Alquézar y la Sierra de Guara.</li>
          <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />Reserva restaurante para maridar vinos de la DO con producto local del Somontano.</li>
          <li className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />Consulta la agenda para ferias, catas y actividades de enoturismo en temporada.</li>
        </ul>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/buscar?q=Somontano" className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
          Buscar Somontano <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/donde/barbastro" className="inline-flex items-center gap-2 rounded-full border border-sand px-5 py-2.5 text-sm font-semibold text-choco dark:text-ink hover:border-brand/40">
          <MapPin className="h-4 w-4 text-brand" /> Barbastro
        </Link>
        <Link href="/restaurantes" className="inline-flex items-center gap-2 rounded-full border border-sand px-5 py-2.5 text-sm font-semibold text-choco dark:text-ink hover:border-brand/40">
          <UtensilsCrossed className="h-4 w-4 text-brand" /> Restaurantes
        </Link>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold tracking-tight text-choco dark:text-ink">Eventos relacionados</h2>
        <p className="mt-1 text-choco-muted">Actividades y agenda vinculadas al Somontano ({eventosSomontano.length} resultados).</p>
        {eventosSomontano.length > 0 ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {eventosSomontano.map((event) => (
              <EventCard key={event.id} event={event} category={event.categoryId ? categoryMap.get(event.categoryId) ?? null : null} />
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-sand bg-sand/40 p-6 text-choco-muted">
            No hay eventos específicos ahora mismo. Revisa la <Link href="/agenda" className="font-semibold text-brand hover:underline">agenda completa</Link>.
          </p>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold tracking-tight text-choco dark:text-ink">Dónde comer y beber</h2>
        <p className="mt-1 text-choco-muted">Restaurantes y espacios gastronómicos relacionados ({restaurantesSomontano.length}).</p>
        {restaurantesSomontano.length > 0 ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {restaurantesSomontano.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-choco-muted">Explora la <Link href="/restaurantes" className="font-semibold text-brand hover:underline">guía completa de restaurantes</Link>.</p>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold tracking-tight text-choco dark:text-ink">Rutas en la zona</h2>
        <p className="mt-1 text-choco-muted">Rutas y experiencias que encajan con una escapada por el Somontano ({rutasSomontano.length}).</p>
        {rutasSomontano.length > 0 ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rutasSomontano.map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-choco-muted">Descubre todas las <Link href="/rutas" className="font-semibold text-brand hover:underline">rutas disponibles</Link>.</p>
        )}
      </section>
    </div>
  );
}
