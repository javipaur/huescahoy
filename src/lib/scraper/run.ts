import axios from "axios";
import https from "node:https";
import { parseRss } from "./rss";
import { parseJsonLd } from "./jsonld";
import { parseRadarFeed } from "./radar";
import { parsePalacio } from "./palacio";
import { parseCierraPorFuera } from "./cpf";
import { parseTecFeed } from "./tec";
import { parseSomontano } from "./somontano";
import { parseAragon } from "./aragon";
import { parseMonegros } from "./monegros";
import { parseAinsa } from "./ainsa";
import { parseFraga } from "./fraga";
import { parseMagia } from "./magia";
import { parseAytoHuesca } from "./ayto";
import { fetchHuescaLaMagiaRestaurants } from "./huescalamagia-restaurants";
import { fetchHuescaLaMagiaRoutes } from "./huescalamagia-routes";
import { fetchHuescaLaMagiaEvents } from "./huescalamagia-events";
import { fetchSenderosGrRoutes } from "./senderosgr";
import { fetchCaminosNaturalesRoutes } from "./caminosnaturales";
import { fetchOpenDataRestaurants } from "./opendata-restaurants";
import { fetchRutaDelVinoRestaurants, fetchRutaDelVinoRoutes, fetchRutaDelVinoAgenda } from "./rutadelvino";
import { fetchHuescaTurismoEvents } from "./huescaturismo-events";
import { fetchDiputacionEvents } from "./diputacion-events";
import { fetchDphPlanes } from "./dph-planes";
import { fetchInstagramHighlightEvents } from "./instagram";
import { inferCategory } from "./category";
import { extractOgImage, normalizeCategory } from "./util";
import { captureServerError } from "../posthog";
import { sendCategoryPush } from "../push";
import { geocodeLocation } from "../geocode";
import {
  getCategoriesAdmin,
  getSources,
  markSourceResult,
  recordScraperRun,
  setEventImage,
  todayStr,
  upsertPlan,
  upsertRestaurant,
  upsertRoute,
  upsertScrapedEvent,
} from "../db";
import type { Category, ScrapeEvent, Source } from "../types";

const TIMEOUT_MS = Number(process.env.SCRAPER_TIMEOUT_MS ?? 15000);
const IMAGE_TIMEOUT_MS = Number(process.env.SCRAPER_IMAGE_TIMEOUT_MS ?? 8000);
const MAX_IMAGE_FETCHES_PER_SOURCE = 8;
const IMAGE_CONCURRENCY = 4;
const MAX_RESTAURANT_GEOCODES_PER_SOURCE = 25;
const SOMONTANO_WEEKS = 5;
const AINSA_SITEMAP = "https://villadeainsa.com/wp-sitemap-posts-lsvr_event-1.xml";
const AINSA_MAX_DETAILS = 60;
const AINSA_MAX_DAYS = 180;
const AINSA_CONCURRENCY = 6;

export type SourceResult = {
  status: "ok" | "error";
  found: number;
  created: number;
  updated: number;
  error?: string;
};

async function fetchText(url: string, rejectUnauthorized = true, timeoutMs = TIMEOUT_MS): Promise<string> {
  try {
    const res = await axios.get<string>(url, {
      timeout: timeoutMs,
      responseType: "text",
      headers: {
        "User-Agent":
          "HuescaHoy/0.1 (+https://huescahoy.es) agenda de eventos de Huesca",
        Accept:
          "application/rss+xml, application/atom+xml, application/xml, application/ld+json, text/html, */*;q=0.8",
      },
      ...(rejectUnauthorized
        ? {}
        : { httpsAgent: new https.Agent({ rejectUnauthorized: false }) }),
    });
    return res.data;
  } catch (err) {
    if (
      rejectUnauthorized &&
      err instanceof Error &&
      /unable to verify|self[- ]signed|certificate/i.test(err.message)
    ) {
      return fetchText(url, false);
    }
    throw err;
  }
}

function mondayOf(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const diff = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

function somontanoUrl(weekStart: Date): string {
  return `https://turismosomontano.es/es/agenda/calendario-de-eventos/eventosporsemana/${weekStart.getFullYear()}/${String(
    weekStart.getMonth() + 1
  ).padStart(2, "0")}/${String(weekStart.getDate()).padStart(2, "0")}/-`;
}

function urlsFor(source: Source): string[] {
  if (source.kind === "somontano") {
    const urls: string[] = [];
    const weekStart = mondayOf(new Date());
    for (let i = 0; i < SOMONTANO_WEEKS; i++) {
      const start = new Date(weekStart);
      start.setDate(start.getDate() + i * 7);
      urls.push(somontanoUrl(start));
    }
    return urls;
  }
  return [source.url];
}

function parseSource(kind: Source["kind"], text: string, url: string, sourceUrl: string): ScrapeEvent[] {
  if (kind === "rss") return parseRss(text, sourceUrl);
  if (kind === "jsonld") return parseJsonLd(text);
  if (kind === "radar") return parseRadarFeed(text);
  if (kind === "palacio") return parsePalacio(text, sourceUrl);
  if (kind === "cpf") return parseCierraPorFuera(text, sourceUrl);
  if (kind === "tec") return parseTecFeed(text, sourceUrl);
  if (kind === "somontano") {
    const m = url.match(/(\d{4})\/(\d{2})\/(\d{2})/);
    const weekStart = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : mondayOf(new Date());
    return parseSomontano(text, weekStart);
  }
  if (kind === "aragon") return parseAragon(text);
  if (kind === "monegros") return parseMonegros(text);
  if (kind === "ainsa") return parseAinsa(text, url);
  if (kind === "fraga") return parseFraga(text);
  if (kind === "magia") return parseMagia(text);
  if (kind === "ayto") return parseAytoHuesca(text, url);
  return [];
}

function recentSitemapUrls(xml: string, maxDays: number, limit: number): string[] {
  const cutoff = Date.now() - maxDays * 24 * 60 * 60 * 1000;
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)]
    .map((m) => {
      const loc = m[1].match(/<loc>([^<]+)<\/loc>/)?.[1] ?? "";
      const lastmod = m[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
      return { loc, ts: lastmod ? new Date(lastmod).getTime() : 0 };
    })
    .filter((u) => u.loc && u.ts >= cutoff)
    .map((u) => u.loc)
    .slice(0, limit);
}

async function fetchAinsaEvents(): Promise<ScrapeEvent[]> {
  const sitemap = await fetchText(AINSA_SITEMAP);
  const urls = recentSitemapUrls(sitemap, AINSA_MAX_DAYS, AINSA_MAX_DETAILS);
  const events: ScrapeEvent[] = [];
  let i = 0;
  async function worker() {
    while (i < urls.length) {
      const url = urls[i++];
      try {
        const html = await fetchText(url);
        for (const event of parseAinsa(html, url)) {
          if (event.start_date >= todayStr()) events.push(event);
        }
      } catch {
        // ignora páginas de detalle con errores individuales
      }
    }
  }
  await Promise.all(Array.from({ length: AINSA_CONCURRENCY }, worker));
  return events;
}

const CATEGORY_ALIASES: Record<string, string> = {
  musica: "conciertos",
  concierto: "conciertos",
  "artes escenicas": "teatro",
  escenicas: "teatro",
  circo: "teatro",
  opera: "teatro",
  humor: "teatro",
  exposicion: "exposiciones",
  familiar: "infantil",
  ninos: "infantil",
  feria: "ferias y mercados",
  ferias: "ferias y mercados",
  mercado: "ferias y mercados",
  mercados: "ferias y mercados",
  fiesta: "fiestas populares",
  fiestas: "fiestas populares",
  cultura: "cultura",
};

function categoryIdFor(
  name: string | null | undefined,
  categories: Category[],
  fallback: number | null
): number | null {
  const norm = normalizeCategory(name);
  if (!norm) return fallback;

  const byName = new Map(categories.map((c) => [normalizeCategory(c.name), c.id]));
  const primary = norm.split(",")[0].trim();
  if (byName.has(primary)) return byName.get(primary)!;

  const alias = CATEGORY_ALIASES[primary];
  if (alias && byName.has(alias)) return byName.get(alias)!;

  return fallback;
}

async function enrichImages(
  tasks: Array<{ id: number; url: string }>
): Promise<number> {
  const queue = tasks.slice(0, MAX_IMAGE_FETCHES_PER_SOURCE);
  if (queue.length === 0) return 0;
  let added = 0;
  let i = 0;
  async function worker() {
    while (i < queue.length) {
      const task = queue[i++];
      try {
        const html = await fetchText(task.url, true, IMAGE_TIMEOUT_MS);
        const image = extractOgImage(html, task.url);
        if (image) {
          await setEventImage(task.id, image);
          added++;
        }
      } catch {
        // sin imagen no pasa nada: la card ya tiene un degradado de respaldo
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(IMAGE_CONCURRENCY, queue.length) }, worker));
  return added;
}

const API_EVENT_FETCHERS: Record<string, () => Promise<ScrapeEvent[]>> = {
  "huescalamagia-events": fetchHuescaLaMagiaEvents,
  huescaturismo: fetchHuescaTurismoEvents,
  diputacion: fetchDiputacionEvents,
  "rutadelvino-agenda": fetchRutaDelVinoAgenda,
};

const RESTAURANT_FETCHERS: Record<string, () => Promise<import("../types").RestaurantInput[]>> = {
  "huescalamagia-restaurants": fetchHuescaLaMagiaRestaurants,
  "opendata-restaurants": fetchOpenDataRestaurants,
  "rutadelvino-restaurants": fetchRutaDelVinoRestaurants,
};

const ROUTE_FETCHERS: Record<string, () => Promise<import("../types").RouteInput[]>> = {
  "huescalamagia-routes": fetchHuescaLaMagiaRoutes,
  senderosgr: fetchSenderosGrRoutes,
  caminosnaturales: fetchCaminosNaturalesRoutes,
  "rutadelvino-rutas": fetchRutaDelVinoRoutes,
};

type PlanWithSource = import("../types").PlanInput & { source: string; source_url: string | null };

const PLAN_FETCHERS: Record<string, () => Promise<PlanWithSource[]>> = {
  "dph-planes": fetchDphPlanes,
};

async function runContentSource(source: Source): Promise<SourceResult> {
  try {
    if (RESTAURANT_FETCHERS[source.kind]) {
      const items = await RESTAURANT_FETCHERS[source.kind]();
      let created = 0;
      let updated = 0;
      let geocoded = 0;
      for (const item of items) {
        if (
          geocoded < MAX_RESTAURANT_GEOCODES_PER_SOURCE &&
          item.lat == null &&
          item.address
        ) {
          geocoded++;
          const coord = await geocodeLocation(item.address);
          if (coord) {
            item.lat = coord.lat;
            item.lng = coord.lng;
          }
        }
        const result = await upsertRestaurant(item);
        if (result.status === "new") created++;
        else if (result.status === "updated") updated++;
      }
      return { status: "ok", found: items.length, created, updated };
    }
    if (ROUTE_FETCHERS[source.kind]) {
      const items = await ROUTE_FETCHERS[source.kind]();
      let created = 0;
      let updated = 0;
      for (const item of items) {
        const result = await upsertRoute(item);
        if (result.status === "new") created++;
        else if (result.status === "updated") updated++;
      }
      return { status: "ok", found: items.length, created, updated };
    }
    if (PLAN_FETCHERS[source.kind]) {
      const items = await PLAN_FETCHERS[source.kind]();
      let created = 0;
      let updated = 0;
      for (const item of items) {
        const result = await upsertPlan(item);
        if (result.status === "new") created++;
        else if (result.status === "updated") updated++;
      }
      return { status: "ok", found: items.length, created, updated };
    }
    return { status: "error", found: 0, created: 0, updated: 0, error: "Tipo de contenido no soportado" };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    await captureServerError("scraper_content_error", {
      source_name: source.name,
      source_url: source.url,
      source_kind: source.kind,
      error,
    });
    return { status: "error", found: 0, created: 0, updated: 0, error };
  }
}

export async function runSource(source: Source): Promise<SourceResult> {
  if (
    RESTAURANT_FETCHERS[source.kind] ||
    ROUTE_FETCHERS[source.kind] ||
    PLAN_FETCHERS[source.kind]
  ) {
    return runContentSource(source);
  }
  try {
    let parsed: ScrapeEvent[] = [];
    if (API_EVENT_FETCHERS[source.kind]) {
      parsed = await API_EVENT_FETCHERS[source.kind]();
    } else if (source.kind === "ainsa") {
      parsed = await fetchAinsaEvents();
    } else if (source.kind === "instagram") {
      parsed = await fetchInstagramHighlightEvents(source.url);
    } else {
      const urls = urlsFor(source);
      for (const url of urls) {
        const text = await fetchText(url);
        parsed.push(...parseSource(source.kind, text, url, source.url));
      }
    }
    const categories = await getCategoriesAdmin();

    let created = 0;
    let updated = 0;
    const pendingImages: Array<{ id: number; url: string }> = [];
    const newByCategory = new Map<number, string[]>();
    for (const event of parsed) {
      const categoryName = event.category ?? (source.categoryId == null ? inferCategory(event.title) : null);
      let categoryId = categoryIdFor(categoryName, categories, source.categoryId);
      if (categoryId == null && source.categoryId == null) {
        categoryId = categoryIdFor(inferCategory(event.title), categories, null);
      }
      const result = await upsertScrapedEvent(event, source.name, categoryId);
      if (result.status === "new") {
        created++;
        if (!event.image && event.source_url && result.id != null) {
          pendingImages.push({ id: result.id, url: event.source_url });
        }
        if (categoryId != null) {
          newByCategory.set(categoryId, [...(newByCategory.get(categoryId) ?? []), event.title]);
        }
      } else if (result.status === "updated") updated++;
    }
    await enrichImages(pendingImages);

    let notifiedCategories = 0;
    for (const [categoryId, titles] of newByCategory) {
      if (notifiedCategories >= 2) break;
      const category = categories.find((c) => c.id === categoryId);
      if (!category) continue;
      await sendCategoryPush({
        categorySlug: category.slug,
        categoryName: category.name,
        titles,
      });
      notifiedCategories++;
    }

    return { status: "ok", found: parsed.length, created, updated };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    await captureServerError("scraper_error", {
      source_name: source.name,
      source_url: source.url,
      source_kind: source.kind,
      error,
    });
    return {
      status: "error",
      found: 0,
      created: 0,
      updated: 0,
      error,
    };
  }
}

export async function runSourceById(sourceId: number): Promise<SourceResult> {
  const source = (await getSources()).find((s) => s.id === sourceId);
  if (!source) {
    return { status: "error", found: 0, created: 0, updated: 0, error: "Fuente no encontrada" };
  }
  const result = await runSource(source);
  await markSourceResult(source.id, result);
  await recordScraperRun({
    sourceId: source.id,
    sourceName: source.name,
    found: result.found,
    created: result.created,
    updated: result.updated,
    status: result.status,
    error: result.error,
  });
  return result;
}

export async function runAllSources(): Promise<SourceResult & { errors: number }> {
  const sources = (await getSources()).filter((s) => s.enabled === 1);
  let totalFound = 0;
  let totalCreated = 0;
  let totalUpdated = 0;
  let errors = 0;

  for (const source of sources) {
    const result = await runSource(source);
    await markSourceResult(source.id, result);
    await recordScraperRun({
      sourceId: source.id,
      sourceName: source.name,
      found: result.found,
      created: result.created,
      updated: result.updated,
      status: result.status,
      error: result.error,
    });
    totalFound += result.found;
    totalCreated += result.created;
    totalUpdated += result.updated;
    if (result.status === "error") errors++;
  }

  return { status: "ok", found: totalFound, created: totalCreated, updated: totalUpdated, errors };
}
