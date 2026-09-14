import { site } from "./site";
import type { Category, EventItem } from "./types";

export function isoDateTime(date: string, time: string | null): string {
  return time ? `${date}T${time}` : date;
}

export function isEventPast(
  event: Pick<EventItem, "startDate" | "endDate">,
  today: string
): boolean {
  const lastDay = event.endDate ?? event.startDate;
  return lastDay < today;
}

export function buildEventJsonLd(
  event: EventItem,
  category: Category | null,
  geo?: { lat: number; lng: number } | null
): Record<string, unknown> {
  const priceMatch = event.price?.match(/(\d+)(?:[.,](\d+))?/);
  const priceValue = priceMatch
    ? parseFloat(priceMatch[1] + (priceMatch[2] ? `.${priceMatch[2]}` : ""))
    : null;

  const location: Record<string, unknown> = {
    "@type": "Place",
    name: event.location?.trim() || site.city,
    address: {
      "@type": "PostalAddress",
      streetAddress: event.address ?? undefined,
      addressLocality: site.city,
      addressRegion: "Huesca",
      addressCountry: "ES",
    },
  };

  if (geo && typeof geo.lat === "number" && typeof geo.lng === "number") {
    location.geo = {
      "@type": "GeoCoordinates",
      latitude: geo.lat,
      longitude: geo.lng,
    };
  }

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    url: `${site.url}/eventos/${event.slug}`,
    description: event.description?.slice(0, 300) ?? undefined,
    startDate: isoDateTime(event.startDate, event.startTime),
    endDate: isoDateTime(
      event.endDate ?? event.startDate,
      event.endTime ?? event.startTime
    ),
    image: [event.image ?? `${site.url}/opengraph-image`],
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventCategory: category?.name ?? undefined,
    location,
    organizer: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
  };

  if (priceValue != null) {
    jsonLd.offers = {
      "@type": "Offer",
      price: priceValue,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: `${site.url}/eventos/${event.slug}`,
      validFrom: isoDateTime(event.createdAt.slice(0, 10), null),
    };
  }

  return jsonLd;
}

export function buildBreadcrumbJsonLd(
  items: { name: string; path?: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path ? `${site.url}${item.path}` : undefined,
    })),
  };
}
