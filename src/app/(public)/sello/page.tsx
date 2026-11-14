import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Compass, Handshake, MapPin, Star, UtensilsCrossed } from "lucide-react";

export const metadata: Metadata = {
  title: "El Sello · Huesca Hoy",
  description:
    "El Sello de Huesca Hoy: selección editorial de lugares y planes recomendados en Huesca y provincia. Criterios, categorías destacadas y cómo proponer sitios.",
  alternates: { canonical: "/sello" },
};

const CRITERIOS = [
  { title: "Calidad y experiencia", text: "Priorizamos propuestas que ofrecen una experiencia cuidada, ya sea en cultura, gastronomía, ocio o naturaleza." },
  { title: "Valor local", text: "Damos visibilidad a iniciativas con identidad propia, arraigo en el territorio y utilidad para residentes y visitantes." },
  { title: "Información contrastada", text: "Buscamos datos claros y útiles (qué es, dónde está, por qué destaca) para ayudar a elegir bien." },
];

const CATEGORIAS = [
  { title: "Dónde comer", text: "Bares y restaurantes con producto, cocina y trato que merecen recomendación.", href: "/restaurantes", icon: UtensilsCrossed },
  { title: "Planes y rutas", text: "Excursiones, recorridos y experiencias para descubrir Huesca y su provincia.", href: "/rutas", icon: Compass },
  { title: "Cultura y lugares", text: "Espacios, pueblos y propuestas culturales con interés especial.", href: "/que-ver", icon: MapPin },
];

export default function SelloPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <nav aria-label="Migas de pan" className="mb-6 text-sm text-choco-muted">
        <Link href="/" className="transition hover:text-brand">Inicio</Link>
        <span aria-hidden className="mx-2">/</span>
        <span className="font-medium text-choco dark:text-ink">El Sello</span>
      </nav>

      <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand-dark">
        <BadgeCheck className="h-3.5 w-3.5" />
        El Sello
      </span>
      <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-choco dark:text-ink sm:text-4xl">
        El Sello Huesca Hoy
      </h1>
      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-choco-muted">
        Nuestra selección editorial de lugares y planes recomendados en Huesca y su provincia. Un “sello” pensado
        para destacar propuestas con criterio local y aportar información útil a quien busca qué hacer, dónde ir o
        qué descubrir.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5 shadow-sm">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand-dark">
            <Star className="h-5 w-5" />
          </span>
          <h2 className="mt-3 font-display text-lg font-bold text-choco dark:text-ink">Qué significa El Sello</h2>
          <p className="mt-2 text-sm leading-relaxed text-choco-muted">
            Una recomendación destacada dentro de Huesca Hoy: sitios y experiencias que, por su interés y calidad,
            merecen una mención especial frente al resto de opciones disponibles.
          </p>
        </div>
        <div className="rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5 shadow-sm">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand-dark">
            <MapPin className="h-5 w-5" />
          </span>
          <h2 className="mt-3 font-display text-lg font-bold text-choco dark:text-ink">Datos y selección en crecimiento</h2>
          <p className="mt-2 text-sm leading-relaxed text-choco-muted">
            Estamos ampliando esta selección con información verificada. Mientras tanto, puedes explorar datos ya
            disponibles en restaurantes, rutas, agenda y guías por zonas.
          </p>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold tracking-tight text-choco dark:text-ink">Criterios de selección</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {CRITERIOS.map((c) => (
            <div key={c.title} className="rounded-2xl border border-sand bg-sand/40 p-5">
              <h3 className="font-display text-base font-bold text-choco dark:text-ink">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-choco-muted">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold tracking-tight text-choco dark:text-ink">Explora categorías destacadas</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {CATEGORIAS.map((c) => {
            const Icon = c.icon;
            return (
              <Link key={c.title} href={c.href} className="group rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand-dark"><Icon className="h-5 w-5" /></span>
                <h3 className="mt-3 font-display text-base font-bold text-choco dark:text-ink">{c.title}</h3>
                <p className="mt-2 text-sm text-choco-muted">{c.text}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-dark">Ver <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></span>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="mt-10 rounded-2xl border border-dashed border-brand/30 bg-brand/5 p-6">
        <div className="flex items-start gap-3">
          <Handshake className="mt-0.5 h-5 w-5 text-brand" />
          <div>
            <h2 className="font-display text-lg font-bold text-choco dark:text-ink">¿Quieres proponer un sitio para El Sello?</h2>
            <p className="mt-1 text-sm leading-relaxed text-choco-muted">
              Si conoces un negocio, espacio o iniciativa que debería estar destacado, envíanos la propuesta. Revisamos
              la información y, si encaja con los criterios, lo incorporamos a la selección.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/colabora#formulario" className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
                Enviar propuesta <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/restaurantes" className="inline-flex items-center gap-2 rounded-full border border-sand px-5 py-2.5 text-sm font-semibold text-choco dark:text-ink hover:border-brand/40">
                Ver restaurantes
              </Link>
              <Link href="/planes" className="inline-flex items-center gap-2 rounded-full border border-sand px-5 py-2.5 text-sm font-semibold text-choco dark:text-ink hover:border-brand/40">
                Ver planes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
