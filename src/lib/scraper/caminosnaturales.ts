import axios from "axios";
import { load } from "cheerio";
import type { RouteInput } from "../types";
import { cleanDescription } from "./util";

const SECTOR_NE_URL = "https://caminosnaturales.es/es/red-de-caminos-naturales/sector-noreste";
const PATH_PREFIX = "/es/red-de-caminos-naturales/camino-detalle/";
const PROVINCE_MARKERS = ["huesca", "aragón", "aragon", "hoya", "somontano", "pirineo", "guara", "sobrarbe", "ribagorza", "jacetania", "riglos", "bierge", "agüero", "aguero", "ainsa", "broto"];

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseDistance(text: string): number | null {
  const match = text.match(/(\d+(?:[.,]\d+)?)\s*km/i);
  return match ? Number(match[1].replace(",", ".")) : null;
}

function relevantToHuesca(url: string, text: string): boolean {
  const haystack = `${url} ${text}`.toLowerCase();
  return PROVINCE_MARKERS.some((m) => haystack.includes(m));
}

async function fetchHtml(url: string): Promise<string> {
  const res = await axios.get<string>(url, {
    timeout: 20000,
    responseType: "text",
    headers: {
      "User-Agent": "HuescaHoy/0.1 (+https://huescahoy.es) caminos naturales de Huesca",
    },
  });
  return res.data;
}

export async function fetchCaminosNaturalesRoutes(): Promise<RouteInput[]> {
  const results: RouteInput[] = [];

  const listingHtml = await fetchHtml(SECTOR_NE_URL);
  const $ = load(listingHtml);

  const pathUrls: string[] = [];
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    if (href.includes(PATH_PREFIX)) {
      const clean = href.startsWith("/") ? `https://caminosnaturales.es${href}` : href;
      if (relevantToHuesca(href, "")) pathUrls.push(clean);
    }
  });

  const unique = [...new Set(pathUrls)];
  const fallbackUrl = "https://caminosnaturales.es/es/red-de-caminos-naturales/camino-detalle/sector-noreste/hoya-de-huesca";
  if (unique.length === 0) unique.push(fallbackUrl);

  for (const url of unique.slice(0, 15)) {
    try {
      const html = await fetchHtml(url);
      const page = load(html);
      const title = page("h1").first().text().trim() || page("title").first().text().trim();
      if (!title) continue;
      const paragraphs = page("p").text().replace(/\s+/g, " ").trim();
      const distance = parseDistance(paragraphs);
      const img = page("img[src]").first().attr("src") ?? null;
      const summary = paragraphs.slice(0, 300);

      const stageHrefs: string[] = [];
      page("a[href]").each((_, el) => {
        const href = $(el).attr("href") ?? "";
        if (href.includes(url) || (href.includes("camino-detalle") && href.includes("etapa"))) {
          const clean = href.startsWith("/") ? `https://caminosnaturales.es${href}` : href;
          stageHrefs.push(clean);
        }
      });

      const route: RouteInput = {
        title,
        slug: `${slugify(title)}-${Math.random().toString(36).slice(2, 8)}`,
        description: cleanDescription(paragraphs),
        summary: summary.length > 200 ? summary.slice(0, 200) : null,
        image: img,
        distance_km: distance,
        elevation_m: null,
        difficulty: null,
        route_type: "camino_natural",
        lat: null,
        lng: null,
        external_url: url,
        gpx_url: null,
        stages_count: stageHrefs.length,
        source: "caminosnaturales",
        source_url: url,
        status: "published",
      };
      results.push(route);
    } catch {
      // salta páginas individuales con errores
    }
  }

  return results;
}