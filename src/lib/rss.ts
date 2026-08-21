import { site } from "./site";
import type { EventItem } from "./types";

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildEventsRss(events: EventItem[], buildDate = new Date()): string {
  const items = events
    .map((event) => {
      const url = `${site.url}/eventos/${event.slug}`;
      const pubDate = new Date(
        `${event.startDate}T${event.startTime ?? "00:00"}:00`
      ).toUTCString();
      return [
        "    <item>",
        `      <title>${escapeXml(event.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${pubDate}</pubDate>`,
        event.description
          ? `      <description>${escapeXml(event.description.slice(0, 400))}</description>`
          : null,
        event.location
          ? `      <category>${escapeXml(event.location)}</category>`
          : null,
        event.image
          ? `      <enclosure url="${escapeXml(event.image)}" type="image/jpeg" />`
          : null,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${site.name} · Agenda de eventos en ${site.city}`)}</title>
    <link>${site.url}</link>
    <description>${escapeXml(site.description)}</description>
    <language>es</language>
    <lastBuildDate>${buildDate.toUTCString()}</lastBuildDate>
    <atom:link href="${site.url}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
}
