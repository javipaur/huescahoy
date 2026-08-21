import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays } from "lucide-react";
import { CategoryAlerts } from "@/components/category-alerts";
import { EventCard } from "@/components/event-card";
import { JsonLd } from "@/components/json-ld";
import { getCategoriesAdmin, getEvents, todayStr } from "@/lib/db";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ categoria: string }>;
};

const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function monthName(offset = 0): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  return MONTHS_ES[d.getMonth()];
}

function yearOf(offset = 0): number {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  return d.getFullYear();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categoria } = await params;
  const categories = await getCategoriesAdmin();
  const category = categories.find((c) => c.slug === categoria);
  if (!category) return {};

  const name = category.name.toLowerCase();
  return {
    title: `${category.name} en Huesca · Agenda cultural`,
    description: `Los mejores ${name} en Huesca en ${monthName()} y ${monthName(1)} de ${yearOf()}: conciertos, fechas, lugares y precios. Agenda actualizada cada día por la ciudad.`,
    alternates: {
      canonical: `/agenda/${category.slug}`,
    },
    openGraph: {
      type: "website",
      locale: site.locale,
      title: `${category.name} en Huesca · ${site.name}`,
      description: `Todos los ${name} en Huesca: agenda actualizada cada día con fechas, lugares y detalles.`,
      images: [{ url: "/opengraph-image" }],
    },
  };
}

export default async function CategoryLandingPage({ params }: PageProps) {
  const { categoria } = await params;
  const categories = await getCategoriesAdmin();
  const category = categories.find((c) => c.slug === categoria);
  if (!category) notFound();

  const events = await getEvents({
    category: category.slug,
    from: todayStr(),
    limit: 24,
  });

  const others = categories.filter((c) => c.slug !== category.slug).slice(0, 8);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: site.url },
      { "@type": "ListItem", position: 2, name: "Agenda", item: `${site.url}/agenda` },
      {
        "@type": "ListItem",
        position: 3,
        name: category.name,
        item: `${site.url}/agenda/${category.slug}`,
      },
    ],
  };

  const eventsJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category.name} en Huesca`,
    numberOfItems: events.length,
    itemListElement: events.slice(0, 10).map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${site.url}/eventos/${event.slug}`,
      name: event.title,
    })),
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={eventsJsonLd} />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <nav aria-label="Migas de pan" className="mb-5 text-sm text-choco-muted">
          <Link href="/" className="transition hover:text-brand">
            Inicio
          </Link>
          <span aria-hidden className="mx-2">
            /
          </span>
          <Link href="/agenda" className="transition hover:text-brand">
            Agenda
          </Link>
          <span aria-hidden className="mx-2">
            /
          </span>
          <span className="font-medium text-choco">{category.name}</span>
        </nav>

        <span
          className="inline-flex items-center gap-2 rounded-full border border-sand bg-white px-3 py-1 text-xs font-semibold text-choco"
        >
          <CalendarDays className="h-3.5 w-3.5" style={{ color: category.color }} />
          Agenda cultural de {site.city}
        </span>

        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
          {category.name} en Huesca
        </h1>

        <p className="mt-3 max-w-2xl leading-relaxed text-choco-muted">
          Descubre los mejores {category.name.toLowerCase()} en Huesca para{" "}
          {monthName()} y {monthName(1)} de {yearOf()}: fechas, lugares, horarios
          y todos los detalles. La agenda se actualiza cada día con los planes
          de la ciudad y su provincia.
        </p>

        <p className="mt-2 text-sm font-medium text-choco">
          {events.length > 0
            ? `${events.length} ${events.length === 1 ? "evento próximo" : "eventos próximos"}`
            : "Sin eventos próximos por ahora"}
        </p>

        <div className="mt-8">
          <CategoryAlerts categories={categories} />
        </div>

        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sand bg-sand/40 p-10 text-center text-choco-muted">
            Ahora mismo no hay {category.name.toLowerCase()} programados.{" "}
            <Link href="/agenda" className="font-semibold text-brand-dark hover:text-brand">
              Explora el resto de la agenda
            </Link>
            .
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} category={category} />
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center gap-3 rounded-2xl border border-sand bg-sand/40 p-5">
          <p className="text-sm font-semibold text-choco">¿Buscas otros planes?</p>
          <div className="flex flex-wrap gap-2">
            {others.map((other) => (
              <Link
                key={other.id}
                href={`/agenda/${other.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-sand bg-white px-3 py-1.5 text-sm font-medium text-choco transition hover:border-brand/40 hover:text-brand-dark"
              >
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: other.color }}
                />
                {other.name} en Huesca
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/agenda"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark"
          >
            Ver toda la agenda de Huesca <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </>
  );
}
