import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Phone, Globe, Mail, ArrowRight, UtensilsCrossed } from "lucide-react";
import { getRestaurantBySlug, getRestaurants } from "@/lib/db";
import { site } from "@/lib/site";
import { JsonLd } from "@/components/json-ld";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) return { title: "Restaurante no encontrado" };
  return {
    title: `${restaurant.name} · Dónde comer en Huesca`,
    description: restaurant.description ?? `${restaurant.name} en Huesca${restaurant.address ? `, ${restaurant.address}` : ""}.`,
    alternates: { canonical: `/restaurantes/${restaurant.slug}` },
    openGraph: {
      type: "website",
      title: restaurant.name,
      description: restaurant.description ?? `${restaurant.name} en Huesca.`,
      images: restaurant.image ? [{ url: restaurant.image }] : [],
    },
  };
}

export default async function RestaurantDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    description: restaurant.description,
    image: restaurant.image,
    address: restaurant.address ? { "@type": "PostalAddress", streetAddress: restaurant.address } : undefined,
    telephone: restaurant.phone,
    email: restaurant.email,
    url: restaurant.website,
    priceRange: restaurant.priceRange,
  };

  const mapsUrl = restaurant.lat != null && restaurant.lng != null
    ? `https://www.google.com/maps/search/?api=1&query=${restaurant.lat},${restaurant.lng}`
    : restaurant.address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address + ", Huesca")}`
      : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <JsonLd data={jsonLd} />

      <nav className="mb-4 flex items-center gap-1.5 text-sm text-choco-muted">
        <Link href="/restaurantes" className="flex items-center gap-1.5 text-brand hover:text-brand-dark">
          Restaurantes
        </Link>
        <span>/</span>
        <span className="truncate text-choco">{restaurant.name}</span>
      </nav>

      {restaurant.image && (
        <div className="mb-6 overflow-hidden rounded-2xl">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="aspect-[21/9] w-full object-cover"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {restaurant.cuisineType && (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand-dark">
            {restaurant.cuisineType}
          </span>
        )}
        {restaurant.priceRange && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-sm font-semibold text-choco dark:bg-gold/15 dark:text-gold">
            {restaurant.priceRange}
          </span>
        )}
      </div>

      <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-choco sm:text-4xl">
        {restaurant.name}
      </h1>

      {restaurant.description && (
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-choco-muted">
          {restaurant.description}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {restaurant.address && (
          <div className="flex items-start gap-3 rounded-xl bg-sand/50 p-4">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-choco-muted">Dirección</p>
              <p className="mt-0.5 font-medium text-choco">{restaurant.address}</p>
            </div>
          </div>
        )}
        {restaurant.phone && (
          <div className="flex items-start gap-3 rounded-xl bg-sand/50 p-4">
            <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-choco-muted">Teléfono</p>
              <a href={`tel:${restaurant.phone}`} className="mt-0.5 font-medium text-brand hover:text-brand-dark">
                {restaurant.phone}
              </a>
            </div>
          </div>
        )}
        {restaurant.email && (
          <div className="flex items-start gap-3 rounded-xl bg-sand/50 p-4">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-choco-muted">Email</p>
              <a href={`mailto:${restaurant.email}`} className="mt-0.5 font-medium text-brand hover:text-brand-dark">
                {restaurant.email}
              </a>
            </div>
          </div>
        )}
        {restaurant.website && (
          <div className="flex items-start gap-3 rounded-xl bg-sand/50 p-4">
            <Globe className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-choco-muted">Sitio web</p>
              <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="mt-0.5 font-medium text-brand hover:text-brand-dark">
                {new URL(restaurant.website).hostname}
              </a>
            </div>
          </div>
        )}
      </div>

      {mapsUrl && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-semibold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark"
        >
          <MapPin className="h-4 w-4" />
          Cómo llegar
          <ArrowRight className="h-4 w-4" />
        </a>
      )}

      {restaurant.lat != null && restaurant.lng != null && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-sand">
          <iframe
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${restaurant.lng - 0.01},${restaurant.lat - 0.005},${restaurant.lng + 0.01},${restaurant.lat + 0.005}&layer=mapnik&marker=${restaurant.lat},${restaurant.lng}`}
            className="h-64 w-full border-0"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}