import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Store, UtensilsCrossed } from "lucide-react";
import data from "@/data/comercios-huesca.json";
import { ComerciosListView } from "./list-view";

export const metadata: Metadata = {
  title: "Comercios locales en Huesca",
  description:
    "Directorio de comercios locales de Huesca: tiendas, alimentación, hostelería, salud, deporte, servicios y más. Información y fichas de negocios de la ciudad.",
  alternates: {
    canonical: "/comercios",
  },
};

type Shop = {
  slug: string;
  name: string;
  category: string;
  address: string;
  description: string;
  source: string;
  sourceUrl: string;
};

const shops = (data as { items: Shop[] }).items;

const CATEGORIAS_DESTACADAS = [
  "Restaurante",
  "Bar / Cafetería",
  "Tienda de alimentación",
  "Panadería",
  "Peluquería",
  "Gimnasio",
  "Farmacia",
  "Tienda de ropa",
];

export default function ComerciosPage() {
  const total = shops.length;
  const byCategory = new Map<string, number>();
  for (const s of shops) {
    if (s.category) byCategory.set(s.category, (byCategory.get(s.category) ?? 0) + 1);
  }
  const categorias = byCategory.size;
  const destacadas = CATEGORIAS_DESTACADAS.map((c) => ({ name: c, count: byCategory.get(c) ?? 0 })).filter(
    (c) => c.count > 0
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <nav aria-label="Migas de pan" className="mb-6 text-sm text-choco-muted">
        <Link href="/" className="transition hover:text-brand">Inicio</Link>
        <span aria-hidden className="mx-2">/</span>
        <span className="font-medium text-choco dark:text-ink">Comercios</span>
      </nav>

      <div className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand-dark">
          <Store className="h-3.5 w-3.5" />
          Comercio local
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl text-choco dark:text-ink">
          Comercios locales en Huesca
        </h1>
        <p className="mt-2 max-w-2xl text-choco-muted">
          Directorio de negocios y comercios de Huesca: tiendas, alimentación, hostelería, salud, deporte, servicios y
          mucho más. Información recopilada para ayudarte a descubrir y apoyar el comercio local.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1.5 font-medium text-choco dark:text-ink">
            <Store className="h-4 w-4 text-brand" /> {total} comercios
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1.5 font-medium text-choco dark:text-ink">
            <MapPin className="h-4 w-4 text-brand" /> {categorias} categorías
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1.5 font-medium text-choco dark:text-ink">
            <UtensilsCrossed className="h-4 w-4 text-brand" /> Huesca ciudad y alrededores
          </span>
        </div>
      </div>

      <section className="mb-10">
        <h2 className="font-display text-xl font-bold tracking-tight text-choco dark:text-ink">Categorías destacadas</h2>
        <p className="mt-1 text-choco-muted">Accesos rápidos a tipos de negocio con presencia en la ciudad.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {destacadas.map((c) => (
            <div key={c.name} className="rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 p-4 shadow-sm">
              <p className="font-display font-bold text-choco dark:text-ink">{c.name}</p>
              <p className="mt-1 text-sm text-choco-muted">{c.count} negocios</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link href="/restaurantes" className="inline-flex items-center gap-1 font-semibold text-brand-dark hover:underline">
            Guía de restaurantes <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/donde/huesca" className="inline-flex items-center gap-1 font-semibold text-brand-dark hover:underline">
            Qué hacer en Huesca <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-bold tracking-tight text-choco dark:text-ink">Directorio de comercios</h2>
        <p className="mt-1 text-choco-muted">Busca por nombre, categoría o dirección.</p>
        <div className="mt-4">
          <ComerciosListView shops={shops} />
        </div>
      </section>

      <p className="mt-10 text-xs text-choco-muted">
        Datos recopilados y enlazados desde{" "}
        <a href={String((data as { source?: string }).source || "https://huesca.city/negocios")} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-dark hover:underline">
          Huesca City (negocios)
        </a>
        . La información (horarios, descripciones, disponibilidad) puede cambiar; consulta la ficha de cada comercio para datos actualizados.
      </p>
    </div>
  );
}
