import axios from "axios";
import type { ScrapeEvent } from "../types";
import type { RouteInput } from "../types";
import type { RestaurantInput } from "../types";
import { cleanDescription, extractOgImage, firstImage } from "./util";

const BASE = "https://rutadelvinosomontano.com";
const API = `${BASE}/wp-json/wp/v2`;
const PER_PAGE = 100;
const MAX_DETAIL_FETCHES = 100;
const CONCURRENCY = 4;
const UA = "HuescaHoy/0.1 (+https://huescahoy.es) Ruta del Vino Somontano";

const FOOTER_MARKERS = [
  "Ruta del Vino Somontano Asociación para la Promoción Turística",
  "Síguenos Facebook",
  "Aviso legal Política de privacidad",
  "Gestionar consentimiento",
];

type WpListItem = {
  id: number;
  date: string;
  slug: string;
  link: string;
  title?: { rendered?: string };
  "municipio-establecimiento"?: number[];
};

type WpTerm = { id: number; name: string };

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function get<T>(url: string, params: Record<string, string | number>): Promise<{ data: T; totalPages: number }> {
  const res = await axios.get<T>(url, {
    params,
    timeout: 20000,
    headers: { "User-Agent": UA },
  });
  const totalPages = Number(res.headers["x-wp-totalpages"] ?? 1);
  return { data: res.data, totalPages };
}

async function listPosts(cpt: string): Promise<WpListItem[]> {
  const items: WpListItem[] = [];
  const first = await get<WpListItem[]>(`${API}/${cpt}`, { per_page: PER_PAGE, page: 1 });
  items.push(...first.data);
  for (let page = 2; page <= first.totalPages && page <= 5; page++) {
    const next = await get<WpListItem[]>(`${API}/${cpt}`, { per_page: PER_PAGE, page });
    items.push(...next.data);
    if (next.data.length === 0) break;
  }
  return items;
}

async function municipalityNames(): Promise<Map<number, string>> {
  const map = new Map<number, string>();
  try {
    const { data } = await get<WpTerm[]>(`${API}/municipio-establecimiento`, { per_page: PER_PAGE });
    for (const term of data) map.set(term.id, term.name);
  } catch {
    // el municipio es opcional; sin la taxonomía no perdemos el resto
  }
  return map;
}

function preFooterText(html: string): string {
  let text = html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  for (const marker of FOOTER_MARKERS) {
    const idx = text.indexOf(marker);
    if (idx >= 0) text = text.slice(0, idx);
  }
  return text.trim();
}

function parsePhone(text: string): string | null {
  const match = text.match(/(?<![A-Za-z0-9])(\d{9})(?![A-Za-z0-9])/);
  return match ? match[1] : null;
}

function parseWebsite(text: string, ownDomain: string): string | null {
  const match = text.match(/(https?:\/\/[^\s,;]+)/g);
  if (!match) return null;
  for (const url of match) {
    try {
      const u = new URL(url);
      if (u.hostname === ownDomain) continue;
      if (!u.hostname.includes(".")) continue;
      return u.toString();
    } catch {
      // URL inválida, se ignora
    }
  }
  return null;
}

function parseRestaurantDetail(html: string): {
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  image: string | null;
} {
  const text = preFooterText(html);
  const email = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/)?.[0] ?? null;
  const phone = parsePhone(text);
  const website = parseWebsite(text, "rutadelvinosomontano.com");

  let description: string | null = text;
  if (email) description = description.split(email).pop() ?? description;
  if (website) description = description.replace(website, " ");
  if (phone) description = description.replace(phone, " ");
  description = cleanDescription(description.slice(0, 600)) ?? null;
  if (description && description.length < 10) description = null;

  return { description, phone, email, website, image: extractOgImage(html, BASE) };
}

type DetailResult<T> = T & { html: string | null };

async function fetchDetails(items: WpListItem[]): Promise<DetailResult<WpListItem>[]> {
  const results = new Array<DetailResult<WpListItem>>(items.length);
  let next = 0;
  const queue: Array<() => Promise<void>> = [];
  for (let i = 0; i < items.length && i < MAX_DETAIL_FETCHES; i++) {
    const idx = i;
    queue.push(async () => {
      try {
        const res = await axios.get<string>(items[idx].link, {
          timeout: 20000,
          headers: { "User-Agent": UA },
          responseType: "text",
        });
        results[idx] = { ...items[idx], html: res.data };
      } catch {
        results[idx] = { ...items[idx], html: null };
      }
    });
  }
  for (let i = MAX_DETAIL_FETCHES; i < items.length; i++) {
    results[i] = { ...items[i], html: null };
  }
  const runner = async () => {
    for (;;) {
      const n = next++;
      if (n >= queue.length) return;
      await queue[n]();
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, runner));
  return results;
}

function parseRouteDetail(html: string, base: WpListItem): {
  description: string | null;
  image: string | null;
  distanceKm: number | null;
  difficulty: string | null;
} {
  const text = preFooterText(html);
  const distanceMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:km|kil[oó]metros)/i);
  const distanceKm = distanceMatch ? Number(distanceMatch[1].replace(",", ".")) : null;
  const diffMatch = text.match(/(f[áa]cil|media|dif[íi]cil)/i);
  const difficulty = diffMatch ? diffMatch[1].toLowerCase() : null;

  let description: string | null = text.replace(/Más información:\s*\S+/gi, " ").slice(0, 600);
  description = cleanDescription(description) ?? null;
  if (description && description.length < 10) description = null;

  let image = extractOgImage(html, BASE);
  if (!image && base.slug) {
    const probe = firstImage(html) ?? null;
    if (probe && !/\.svg(\?|#|$)/i.test(probe)) image = probe;
  }
  return { description, image, distanceKm, difficulty };
}

function parseAgendaDetail(html: string): {
  startDate: string | null;
  startTime: string | null;
  price: string | null;
  description: string | null;
  image: string | null;
} {
  const text = preFooterText(html);

  const dateMatch = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  let startDate: string | null = null;
  let startTime: string | null = null;
  if (dateMatch) {
    const [, dd, mm, yyyy, hh, mi] = dateMatch;
    startDate = `${yyyy}-${mm}-${dd}`;
    if (hh && mi) {
      const h = String(Number(hh)).padStart(2, "0");
      const m = mi.padStart(2, "0");
      if (!(h === "00" && m === "00")) startTime = `${h}:${m}`;
    }
  }

  const priceMatch = text.match(/[\d.,\s]*€/);
  let price = priceMatch ? priceMatch[0].replace(/\s+/g, " ").trim() : null;
  if (price) {
    price = price.replace(/€/, "") ? `${price.replace(/\s+/g, " ").trim()}` : null;
  }

  const description = cleanDescription(text.slice(0, 600)) ?? null;

  return { startDate, startTime, price, description, image: extractOgImage(html, BASE) };
}

export async function fetchRutaDelVinoRestaurants(): Promise<RestaurantInput[]> {
  const [items, municipalities] = await Promise.all([listPosts("establecimientos"), municipalityNames()]);
  const detailed = await fetchDetails(items);
  const sourceName = "rutadelvino-restaurants";
  const seen = new Set<string>();

  const results: RestaurantInput[] = [];
  for (const item of detailed) {
    const title = item.title?.rendered?.replace(/\s+/g, " ").trim();
    if (!title) continue;
    if (seen.has(item.id.toString())) continue;
    seen.add(item.id.toString());

    const detail = item.html ? parseRestaurantDetail(item.html) : { description: null, phone: null, email: null, website: null, image: null };
    const municipality = item["municipio-establecimiento"]
      ? item["municipio-establecimiento"]
          .map((id) => municipalities.get(id))
          .find((name): name is string => Boolean(name)) ?? null
      : null;

    results.push({
      name: title,
      slug: slugify(title) || `ruta-vino-${item.id}`,
      description: detail.description,
      cuisine_type: "Ruta del Vino Somontano · gastronomía",
      price_range: null,
      opening_hours: null,
      address: municipality,
      phone: detail.phone,
      email: detail.email,
      website: detail.website ?? item.link,
      image: detail.image,
      lat: null,
      lng: null,
      rating: null,
      source: sourceName,
      source_url: item.link,
      status: "published",
    });
  }
  return results;
}

export async function fetchRutaDelVinoRoutes(): Promise<RouteInput[]> {
  const items = await listPosts("experiencias");
  const detailed = await fetchDetails(items);
  const results: RouteInput[] = [];

  for (const item of detailed) {
    const title = item.title?.rendered?.replace(/\s+/g, " ").trim();
    if (!title) continue;

    const detail = item.html
      ? parseRouteDetail(item.html, item)
      : { description: null, image: null, distanceKm: null, difficulty: null };

    results.push({
      title,
      slug: slugify(title) || `ruta-vino-${item.id}`,
      description: detail.description,
      summary: null,
      image: detail.image,
      distance_km: detail.distanceKm,
      elevation_m: null,
      difficulty: detail.difficulty,
      route_type: "gastronomica",
      lat: null,
      lng: null,
      external_url: item.link,
      gpx_url: null,
      stages_count: 0,
      source: "rutadelvino-rutas",
      source_url: item.link,
      status: "published",
    });
  }
  return results;
}

export async function fetchRutaDelVinoAgenda(): Promise<ScrapeEvent[]> {
  const items = await listPosts("agenda");
  const detailed = await fetchDetails(items);
  const results: ScrapeEvent[] = [];

  for (const item of detailed) {
    const title = item.title?.rendered?.replace(/\s+/g, " ").trim();
    if (!title) continue;
    if (!item.html) continue;

    const detail = parseAgendaDetail(item.html);
    if (!detail.startDate) continue;

    results.push({
      title,
      start_date: detail.startDate,
      start_time: detail.startTime,
      end_date: null,
      end_time: null,
      location: null,
      address: null,
      price: detail.price,
      description: detail.description,
      image: detail.image,
      external_url: item.link,
      source_url: item.link,
      category: "cultura",
    });
  }
  return results;
}