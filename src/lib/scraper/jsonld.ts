import { load } from "cheerio";
import type { ScrapeEvent } from "../types";

function splitDateTime(value: string): { date: string; time: string | null } {
  const cleaned = value.trim();
  const match = cleaned.match(/^(\d{4}-\d{2}-\d{2})T?(\d{2}:\d{2})?/);
  if (!match) return { date: cleaned.slice(0, 10), time: null };
  const time = match[2] ?? null;
  return { date: match[1], time: time === "00:00" ? null : time };
}

function decodeEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function asString(value: unknown): string | null {
  if (typeof value === "string") return decodeEntities(value).trim() || null;
  if (typeof value === "number") return String(value);
  if (value instanceof Date) return value.toISOString();
  return null;
}

function imageFrom(node: Record<string, unknown>): string | null {
  const img = node.image;
  if (typeof img === "string") return img || null;
  if (img && typeof img === "object") {
    const url = (img as Record<string, unknown>).url;
    if (typeof url === "string") return url || null;
  }
  return null;
}

function locationFrom(node: Record<string, unknown>): {
  location: string | null;
  address: string | null;
} {
  const loc = node.location;
  if (!loc || typeof loc !== "object") return { location: null, address: null };
  const obj = loc as Record<string, unknown>;
  const name = asString(obj.name);
  const addressObj = obj.address;
  let address: string | null = null;
  if (addressObj && typeof addressObj === "object") {
    const street = asString((addressObj as Record<string, unknown>).streetAddress);
    const postal = asString((addressObj as Record<string, unknown>).postalCode);
    const locality = asString((addressObj as Record<string, unknown>).addressLocality);
    address = [street, postal, locality].filter(Boolean).join(", ") || null;
  } else if (typeof addressObj === "string") {
    address = addressObj;
  }
  return { location: name, address };
}

function eventFrom(node: Record<string, unknown>): ScrapeEvent | null {
  const title = asString(node.name) ?? asString(node.title);
  if (!title) return null;

  const startValue = asString(node.startDate);
  if (!startValue) return null;
  const start = splitDateTime(startValue);
  if (!start.date) return null;

  const endValue = asString(node.endDate);
  const end = endValue ? splitDateTime(endValue) : null;
  const url = asString(node.url) ?? asString(node.sameAs);
  const offers = node.offers as Record<string, unknown> | undefined;
  const price = offers ? asString(offers.price) : null;
  const { location, address } = locationFrom(node);

  return {
    title,
    start_date: start.date,
    start_time: start.time,
    end_date: end ? end.date : null,
    end_time: end ? end.time : null,
    location,
    address,
    price,
    description: asString(node.description),
    image: imageFrom(node),
    external_url: url,
    source_url: url,
  };
}

function collect(node: unknown, out: ScrapeEvent[]): void {
  if (Array.isArray(node)) {
    for (const item of node) collect(item, out);
    return;
  }
  if (!node || typeof node !== "object") return;
  const obj = node as Record<string, unknown>;

  const types: unknown = obj["@type"];
  const typeList = Array.isArray(types) ? types : [types];
  const isEvent =
    typeList.includes("Event") ||
    (typeof obj["@type"] === "string" && obj["@type"].includes("Event"));

  if (isEvent) {
    const parsed = eventFrom(obj);
    if (parsed) out.push(parsed);
  }

  if (Array.isArray(obj["@graph"])) collect(obj["@graph"], out);
  if (Array.isArray(obj.itemListElement)) collect(obj.itemListElement, out);
  if (typeof obj.mainEntity === "object" && obj.mainEntity !== null) collect(obj.mainEntity, out);
  if (Array.isArray(obj["@type"]) === false && Array.isArray(obj.events)) collect(obj.events, out);
}

export function parseJsonLd(html: string): ScrapeEvent[] {
  const $ = load(html);
  const events: ScrapeEvent[] = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).html() ?? "";
    try {
      const data = JSON.parse(raw);
      collect(data, events);
    } catch {
      // ignore invalid JSON-LD blocks
    }
  });

  return events;
}
