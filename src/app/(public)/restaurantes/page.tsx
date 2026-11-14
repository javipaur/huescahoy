import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Star, UtensilsCrossed } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getRestaurants } from "@/lib/db";
import { site } from "@/lib/site";
import { RestaurantListView } from "./list-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Restaurantes en Huesca",
  description:
    "Dónde comer en Huesca: directorio y selección de restaurantes conocidos y mejor valorados por zonas (Huesca capital, Somontano, Jacetania, Sobrarbe, Ribagorza y más).",
  alternates: {
    canonical: "/restaurantes",
  },
  openGraph: {
    type: "website",
    locale: site.locale,
    title: `Restaurantes en ${site.city}`,
    description: "Directorio y guía de restaurantes, bares y cafeterías en Huesca y su provincia.",
    images: [{ url: "/opengraph-image" }],
  },
};

const ZONAS_COMER = [
  {
    zona: "Huesca capital",
    lugar: "Huesca",
    href: "/donde/huesca",
    desc: "La ciudad concentra cocina de autor, producto de temporada y tapeo clásico alrededor del Coso, la plaza de Navarra y el centro.",
    destacados: [
      { nombre: "Lillas Pastia", info: "Alta cocina oscense con larga trayectoria y reconocimientos (Michelin/Repsol); referencia en la capital." },
      { nombre: "Tatau Bistro", info: "Cocina creativa en formato más informal y tapas de autor, muy conocido en Huesca." },
      { nombre: "Las Torres", info: "Clásico de la ciudad con cocina tradicional y aragonesa, valorado por su regularidad." },
      { nombre: "Taberna de Lillas Pastia", info: "Propuesta más desenfadada del universo Lillas Pastia, popular para raciones y producto." },
    ],
  },
  {
    zona: "Somontano y Barbastro",
    lugar: "Barbastro y Somontano",
    href: "/donde/barbastro",
    desc: "Zona de vinos D.O. Somontano donde la gastronomía marida producto local, cocina aragonesa y propuestas vinculadas al enoturismo.",
    destacados: [
      { nombre: "Trasiego", info: "Restaurante conocido en Barbastro por su cocina de mercado y bodega en clave de Somontano." },
      { nombre: "El Placer", info: "Dirección reconocida en Monzón/Somontano por su apuesta gastronómica y producto de la zona." },
      { nombre: "Flor", info: "Propuesta de cocina actual en Barbastro, habitual en recomendaciones locales." },
      { nombre: "Bodegas y espacios gastronómicos", info: "Muchas bodegas del Somontano ofrecen visitas con maridaje; consulta agenda y /vino-y-somontano." },
    ],
  },
  {
    zona: "Sobrarbe (Aínsa y entorno)",
    lugar: "Aínsa / Sobrarbe",
    href: "/donde/ainsa",
    desc: "Cocina de montaña y producto del Pirineo en villas con gran atractivo turístico, ideal tras rutas por Ordesa y el Sobrarbe.",
    destacados: [
      { nombre: "Callizo", info: "Restaurante de referencia en Aínsa, reconocido por su cocina de raíces y producto local." },
      { nombre: "Bodegón de Mallacán", info: "Cocina tradicional aragonesa muy conocida entre quienes visitan Aínsa." },
      { nombre: "Restaurantes en la plaza y casco", info: "Oferta variada de brasa, carnes y cocina pirenaica en el entorno medieval de Aínsa." },
      { nombre: "Producto del Sobrarbe", info: "Carnes, ternasco, setas de temporada y recetas de montaña son habituales en la zona." },
    ],
  },
  {
    zona: "Jacetania y Jaca",
    lugar: "Jaca",
    href: "/donde/jaca",
    desc: "Parada clásica del Pirineo y del Camino de Santiago, con buena oferta de cocina tradicional, tapas y restaurantes para todos los gustos.",
    destacados: [
      { nombre: "La Cocina Aragonesa", info: "Restaurante conocido en Jaca por su enfoque en recetas y producto de Aragón." },
      { nombre: "Restaurante Biarritz", info: "Dirección tradicional y popular en la ciudad, habitual en recomendaciones de la zona." },
      { nombre: "Tapas en el casco histórico", info: "El centro de Jaca concentra bares y restaurantes con ambiente animado todo el año." },
      { nombre: "Canfranc y alrededores", info: "El entorno jacetano suma propuestas singulares (incluido Canfranc Estación) a poca distancia." },
    ],
  },
  {
    zona: "Ribagorza y Benasque",
    lugar: "Benasque / Ribagorza",
    href: "/donde/benasque",
    desc: "Valle de alta montaña con cocina de producto, brasa y restaurantes vinculados al turismo de naturaleza y nieve.",
    destacados: [
      { nombre: "Ansils (Anciles)", info: "Restaurante reconocido en el entorno de Benasque por su cocina de autor y producto local." },
      { nombre: "Casa Arcas (Villanova)", info: "Referencia gastronómica del valle, muy conocida por su propuesta vinculada al territorio." },
      { nombre: "Restaurantes de Benasque", info: "La Parrilla, Casa Tous y otros locales del valle son opciones habituales tras rutas o esquí." },
      { nombre: "Graus y Ribagorza", info: "En Graus destaca la gastronomía local (longaniza y producto ribagorzano) y su oferta de bares." },
    ],
  },
  {
    zona: "Hoya, Guara y otras comarcas",
    lugar: "Alquézar, Loarre y provincia",
    href: "/pueblos-con-encanto",
    desc: "En pueblos y rutas de la provincia abundan restaurantes de cocina casera, asadores y propuestas ligadas al turismo rural y de naturaleza.",
    destacados: [
      { nombre: "Casa Pardina (Alquézar)", info: "Restaurante muy conocido en Alquézar, valorado por su cocina y ubicación en el entorno del Vero." },
      { nombre: "Asadores y cocina tradicional", info: "En la Hoya y comarcas cercanas son habituales el ternasco, las carnes a la brasa y el recetario aragonés." },
      { nombre: "Paradas en pueblos con encanto", info: "Loarre, Torla, Boltaña, Ansó o Graus ofrecen opciones locales interesantes junto a sus atractivos." },
      { nombre: "Explora por zona", info: "Usa el filtro por comarca y el buscador del directorio para encontrar opciones cercanas a tu ruta." },
    ],
  },
];

export default async function RestaurantesPage() {
  const restaurants = await getRestaurants({ limit: 500 });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Restaurantes" },
        ]}
      />
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand-dark">
          <UtensilsCrossed className="h-3.5 w-3.5" />
          Directorio gastronómico
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Dónde comer en {site.city}
        </h1>
        <p className="mt-2 max-w-2xl text-choco-muted">
          Guía y directorio de restaurantes, bares y cafeterías de Huesca y su provincia: referentes conocidos,
          cocina aragonesa y opciones por zonas, junto al listado actualizado disponible.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1.5 font-medium text-choco dark:text-ink">
            <UtensilsCrossed className="h-4 w-4 text-brand" /> {restaurants.length} en el directorio
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1.5 font-medium text-choco dark:text-ink">
            <MapPin className="h-4 w-4 text-brand" /> {ZONAS_COMER.length} zonas destacadas
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1.5 font-medium text-choco dark:text-ink">
            <Star className="h-4 w-4 text-brand" /> Selección de referentes conocidos
          </span>
        </div>
      </div>

      <section className="mb-12">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-choco dark:text-ink">Restaurantes conocidos y recomendados por zonas</h2>
            <p className="mt-1 max-w-3xl text-choco-muted">
              Una selección orientativa de nombres famosos y bien valorados en la provincia. Comprueba horarios, carta y disponibilidad antes de ir.
            </p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {ZONAS_COMER.map((z) => (
            <div key={z.zona} className="rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark">{z.lugar}</p>
                  <h3 className="mt-1 font-display text-lg font-bold text-choco dark:text-ink">{z.zona}</h3>
                </div>
                <Link href={z.href} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-dark hover:underline">
                  Ver zona <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <p className="mt-2 text-sm text-choco-muted">{z.desc}</p>
              <ul className="mt-4 space-y-2">
                {z.destacados.map((d) => (
                  <li key={d.nombre} className="rounded-xl bg-sand/50 px-3 py-2 text-sm">
                    <span className="font-semibold text-choco dark:text-ink">{d.nombre}:</span>{" "}
                    <span className="text-choco-muted">{d.info}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-choco-muted">
          Nota: la presencia, categoría, valoraciones y reconocimientos (p. ej. Michelin/Repsol) pueden cambiar; usa esta guía como punto de partida y contrasta con la información actual de cada establecimiento.
        </p>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="font-display text-2xl font-bold tracking-tight text-choco dark:text-ink">Directorio de restaurantes</h2>
          <p className="mt-1 text-choco-muted">Busca y filtra por tipo de cocina o comarca en el listado disponible en Huesca Hoy.</p>
        </div>
        <Suspense fallback={<div className="text-choco-muted">Cargando restaurantes…</div>}>
          <RestaurantListView restaurants={restaurants} />
        </Suspense>
      </section>
    </div>
  );
}