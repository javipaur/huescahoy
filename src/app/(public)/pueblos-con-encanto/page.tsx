import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Castle, MapPin } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { getCategoriesAdmin, getEvents, todayStr } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pueblos con encanto en la provincia de Huesca",
  description:
    "Pueblos con encanto de Huesca: Aínsa, Alquézar, Jaca, Ansó, Benasque, Loarre, Torla-Ordesa y más. Información, ideas de visita y eventos relacionados.",
  alternates: { canonical: "/pueblos-con-encanto" },
};

const DESTACADOS = [
  { slug: "ainsa", name: "Aínsa", desc: "Villa medieval del Sobrarbe con plaza porticada y castillo, puerta a Ordesa.", zona: "Sobrarbe" },
  { slug: "barbastro", name: "Barbastro", desc: "Capital del Somontano, catedral, patrimonio y punto de partida del enoturismo.", zona: "Somontano" },
  { slug: "jaca", name: "Jaca", desc: "Ciudadela renacentista, catedral románica y ambiente del Camino de Santiago.", zona: "Jacetania" },
  { slug: "huesca", name: "Huesca", desc: "Capital provincial con casco histórico, museos, cultura y vida urbana.", zona: "Hoya de Huesca" },
];

const MAS_PUEBLOS = [
  { name: "Alquézar", query: "Alquézar", desc: "Conjunto medieval sobre el río Vero, famoso por sus pasadizos y la colegiata, junto al Parque Cultural del río Vero." },
  { name: "Loarre", query: "Loarre", desc: "Conocido por su castillo románico, una de las fortalezas mejor conservadas de Europa, con vistas a la Hoya." },
  { name: "Benasque", query: "Benasque", desc: "Villa pirenaica del valle de Benasque, rodeada de cumbres y base para rutas hacia el Posets-Maladeta y el Aneto." },
  { name: "Torla-Ordesa", query: "Torla", desc: "Puerta de acceso al Parque Nacional de Ordesa y Monte Perdido, con casco de piedra y ambiente de montaña." },
  { name: "Ansó", query: "Ansó", desc: "Pueblo del valle de Ansó con arquitectura tradicional, traje típico y un entorno pirenaico de gran valor cultural." },
  { name: "Graus", query: "Graus", desc: "Villa de la Ribagorza con plaza porticada, gastronomía (longaniza) y patrimonio junto al río Ésera." },
  { name: "Boltaña", query: "Boltaña", desc: "En el Sobrarbe, con casco histórico, castillo y vistas al valle del Ara, cerca de Aínsa y Ordesa." },
  { name: "Roda de Isábena", query: "Roda de Isábena", desc: "Uno de los pueblos más pequeños con catedral de España, conjunto románico de gran valor en la Ribagorza." },
];

export default async function PueblosConEncantoPage() {
  const today = todayStr();
  const [events, categories] = await Promise.all([
    getEvents({ from: today, limit: 80 }),
    getCategoriesAdmin(),
  ]);
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const provincia = events
    .filter((e) => {
      const loc = `${e.location || ""} ${e.address || ""}`.toLowerCase();
      return /ainsa|barbastro|jaca|alquézar|alquezar|benasque|graus|boltaña|boltana|ansó|anso|fraga|monzón|monzon|sariñena|loarre|torla|broto|sallent|panticosa|canfranc/i.test(
        `${e.title} ${loc}`
      );
    })
    .slice(0, 6);
  const destacados = (provincia.length >= 3 ? provincia : events).slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav aria-label="Migas de pan" className="mb-6 text-sm text-choco-muted">
        <Link href="/" className="transition hover:text-brand">Inicio</Link>
        <span aria-hidden className="mx-2">/</span>
        <span className="font-medium text-choco dark:text-ink">Pueblos con encanto</span>
      </nav>

      <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand-dark">
        <Castle className="h-3.5 w-3.5" />
        Pueblos con encanto
      </span>
      <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-choco dark:text-ink sm:text-4xl">
        Pueblos con encanto de Huesca
      </h1>
      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-choco-muted">
        La provincia de Huesca reúne villas medievales, pueblos de montaña y localidades con un gran patrimonio.
        Aquí tienes una selección con información útil, accesos rápidos y eventos relacionados para planear tu escapada.
      </p>

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1.5 font-medium text-choco dark:text-ink">
          <Castle className="h-4 w-4 text-brand" /> {DESTACADOS.length + MAS_PUEBLOS.length} localidades destacadas
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1.5 font-medium text-choco dark:text-ink">
          <MapPin className="h-4 w-4 text-brand" /> Sobrarbe, Somontano, Jacetania, Ribagorza y más
        </span>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold tracking-tight text-choco dark:text-ink">Localidades con ficha y datos</h2>
        <p className="mt-1 text-choco-muted">Accede a la información, agenda y restaurantes disponibles de cada lugar.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DESTACADOS.map((p) => (
            <Link
              key={p.slug}
              href={`/donde/${p.slug}`}
              className="group rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand-dark">{p.zona}</span>
              <div className="mt-3 inline-flex items-center gap-2 text-choco dark:text-ink">
                <MapPin className="h-4 w-4 text-brand" />
                <span className="font-display font-bold">{p.name}</span>
              </div>
              <p className="mt-2 text-sm text-choco-muted">{p.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-dark">
                Ver información <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold tracking-tight text-choco dark:text-ink">Más pueblos que merecen una visita</h2>
        <p className="mt-1 text-choco-muted">Ideas y datos clave para ampliar tu ruta por la provincia.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MAS_PUEBLOS.map((p) => (
            <div key={p.name} className="rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5 shadow-sm">
              <h3 className="font-display text-base font-bold text-choco dark:text-ink">{p.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-choco-muted">{p.desc}</p>
              <Link href={`/buscar?q=${encodeURIComponent(p.query)}`} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-dark hover:underline">
                Buscar en Huesca Hoy <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/rutas" className="inline-flex items-center gap-2 rounded-full border border-sand px-5 py-2.5 text-sm font-semibold text-choco dark:text-ink hover:border-brand/40">Ver rutas</Link>
          <Link href="/planes" className="inline-flex items-center gap-2 rounded-full border border-sand px-5 py-2.5 text-sm font-semibold text-choco dark:text-ink hover:border-brand/40">Planes y guías</Link>
          <Link href="/que-ver" className="inline-flex items-center gap-2 rounded-full border border-sand px-5 py-2.5 text-sm font-semibold text-choco dark:text-ink hover:border-brand/40">Qué ver</Link>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold tracking-tight text-choco dark:text-ink">Eventos y planes en la provincia</h2>
        <p className="mt-1 text-choco-muted">Una muestra de actividades disponibles en localidades y zonas de la provincia ({destacados.length} resultados).</p>
        {destacados.length > 0 ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {destacados.map((event) => (
              <EventCard key={event.id} event={event} category={event.categoryId ? categoryMap.get(event.categoryId) ?? null : null} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-choco-muted">Consulta la <Link href="/agenda" className="font-semibold text-brand hover:underline">agenda completa</Link> para ver más opciones.</p>
        )}
      </section>
    </div>
  );
}
