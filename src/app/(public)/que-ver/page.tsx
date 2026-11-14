import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Landmark, MapPin } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { getCategoriesAdmin, getEvents, todayStr } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Qué ver en Huesca",
  description:
    "Qué ver en Huesca: Catedral, San Pedro el Viejo, Museo, CDAN, casco histórico y rincones de la provincia. Información práctica y eventos culturales actualizados.",
  alternates: { canonical: "/que-ver" },
};

const IMPRESCINDIBLES = [
  { title: "Catedral de Santa María", text: "Catedral gótica levantada desde el siglo XIII en el corazón de la ciudad, con portada principal y un destacado conjunto artístico interior." },
  { title: "Monasterio de San Pedro el Viejo", text: "Joya del románico aragonés (s. XII) con claustro, capiteles historiados y panteón real de Alfonso I el Batallador y Ramiro II." },
  { title: "Museo de Huesca", text: "Ubicado en el antiguo Palacio Real y la Universidad Sertoriana, alberga arqueología y bellas artes, incluida la sala de la Campana de Huesca." },
  { title: "Coso, plazas y casco histórico", text: "El Coso marca el antiguo recinto amurallado. Merecen paseo la plaza de la Catedral, la plaza López Allué y las Cuatro Esquinas." },
  { title: "Parque Miguel Servet", text: "El parque más emblemático de Huesca, un espacio verde con paseos, estanques y esculturas, ideal para descansar entre visitas." },
  { title: "Cerro de San Jorge y muralla", text: "Zona alta con restos de muralla y miradores desde los que se contemplan vistas panorámicas de la ciudad y la Hoya." },
  { title: "CDAN (Centro de Arte y Naturaleza)", text: "Espacio de arte contemporáneo vinculado al paisaje y la naturaleza, con exposiciones temporales y una arquitectura singular." },
  { title: "Basílica de San Lorenzo", text: "Templo dedicado al patrón de Huesca, muy ligado a las fiestas de San Lorenzo y a la tradición popular oscense." },
];

export default async function QueVerPage() {
  const today = todayStr();
  const [events, categories] = await Promise.all([
    getEvents({ from: today, limit: 60 }),
    getCategoriesAdmin(),
  ]);
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const cultura = events.filter((e) => {
    const c = e.categoryId ? categoryMap.get(e.categoryId) : null;
    const name = (c?.name || "").toLowerCase();
    return name.includes("cultura") || name.includes("expos") || name.includes("teatro") || name.includes("museo");
  });
  const destacados = (cultura.length >= 3 ? cultura : events).slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav aria-label="Migas de pan" className="mb-6 text-sm text-choco-muted">
        <Link href="/" className="transition hover:text-brand">Inicio</Link>
        <span aria-hidden className="mx-2">/</span>
        <span className="font-medium text-choco dark:text-ink">Qué ver</span>
      </nav>

      <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand-dark">
        <Landmark className="h-3.5 w-3.5" />
        Qué ver
      </span>
      <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-choco dark:text-ink sm:text-4xl">
        Qué ver en Huesca
      </h1>
      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-choco-muted">
        Monumentos, museos, paseos y rincones esenciales de Huesca capital y su provincia. Una guía con información
        práctica y enlazada a la agenda y los contenidos disponibles en Huesca Hoy.
      </p>

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1.5 font-medium text-choco dark:text-ink">
          <Landmark className="h-4 w-4 text-brand" /> {IMPRESCINDIBLES.length} lugares y espacios destacados
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1.5 font-medium text-choco dark:text-ink">
          <CalendarDays className="h-4 w-4 text-brand" /> {destacados.length} actividades culturales ahora
        </span>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold tracking-tight text-choco dark:text-ink">Imprescindibles en Huesca ciudad</h2>
        <p className="mt-1 max-w-2xl text-choco-muted">Los puntos clave para una primera visita o para redescubrir la capital oscense.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {IMPRESCINDIBLES.map((item) => (
            <div key={item.title} className="rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5 shadow-sm">
              <h3 className="font-display text-base font-bold text-choco dark:text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-choco-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-choco dark:text-ink">Arte y cultura en agenda</h2>
          <p className="mt-2 text-sm leading-relaxed text-choco-muted">
            Exposiciones, teatro, conciertos y visitas culturales en espacios como el CDAN, museos y salas de la ciudad y provincia.
          </p>
          <Link href="/cultura" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-dark">
            Guía de cultura <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-choco dark:text-ink">Rutas y naturaleza</h2>
          <p className="mt-2 text-sm leading-relaxed text-choco-muted">
            Desde Huesca es fácil acceder a rutas por la Hoya, la Sierra de Guara y el Pirineo. Combina patrimonio urbano con escapadas al aire libre.
          </p>
          <Link href="/rutas" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-dark">
            Ver rutas <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5 shadow-sm">
          <h2 className="font-display text-lg font-bold text-choco dark:text-ink">Provincia y pueblos</h2>
          <p className="mt-2 text-sm leading-relaxed text-choco-muted">
            Alquézar, Aínsa, Loarre, Jaca, Benasque o Torla-Ordesa son paradas imprescindibles para completar la visita a la provincia.
          </p>
          <Link href="/pueblos-con-encanto" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-dark">
            Pueblos con encanto <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/agenda" className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
          <CalendarDays className="h-4 w-4" /> Ver agenda cultural
        </Link>
        <Link href="/planes" className="inline-flex items-center gap-2 rounded-full border border-sand px-5 py-2.5 text-sm font-semibold text-choco dark:text-ink hover:border-brand/40">
          <MapPin className="h-4 w-4 text-brand" /> Planes y guías
        </Link>
        <Link href="/donde/huesca" className="inline-flex items-center gap-2 rounded-full border border-sand px-5 py-2.5 text-sm font-semibold text-choco dark:text-ink hover:border-brand/40">
          Información de Huesca
        </Link>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold tracking-tight text-choco dark:text-ink">Planes culturales y destacados ahora</h2>
        <p className="mt-1 text-choco-muted">Selección basada en la agenda disponible ({destacados.length} resultados).</p>
        {destacados.length > 0 ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {destacados.map((event) => (
              <EventCard key={event.id} event={event} category={event.categoryId ? categoryMap.get(event.categoryId) ?? null : null} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-choco-muted">No hay eventos destacados ahora mismo; revisa la <Link href="/agenda" className="font-semibold text-brand hover:underline">agenda</Link>.</p>
        )}
      </section>
    </div>
  );
}
