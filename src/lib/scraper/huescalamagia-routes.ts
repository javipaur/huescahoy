import axios from "axios";
import type { RouteInput } from "../types";
import { cleanDescription, firstImage } from "./util";

const API_BASE = "https://web.huescalamagia.es";
const APP_ID = "1015514";
const RUTAS_SECTION = "16878118";
const EXCURSIONES_SECTION = "16880211";
const IMPRESCINDIBLES_SECTION = "16877701";
const PER_PAGE = 24;

const CATEGORY_MAP: Array<{ match: RegExp; type: string }> = [
  { match: /camino de santiago/i, type: "camino_santiago" },
  { match: /rutas gastronomicas|gastronomicas|gastronomica/i, type: "gastronomica" },
  { match: /btt|bici/i, type: "bici" },
  { match: /en coche|coche/i, type: "coche" },
  { match: /senderismo/i, type: "senderismo" },
  { match: /excursiones|excursion/i, type: "excursion" },
  { match: /culturales|cultural/i, type: "cultural" },
  { match: /naturales|naturaleza/i, type: "naturales" },
  { match: /en familia/i, type: "en_familia" },
  { match: /aventura/i, type: "aventura" },
];

type MagiaItem = {
  id?: string | number;
  title?: string;
  summary?: string;
  content?: string;
  images?: Array<{ url?: string; large?: string } | string>;
  thumbnail?: string;
  xLargeThumbnail?: string;
  originalThumbnail?: string;
  url?: string;
  subsections?: Record<string, string[]>;
  latitude?: string | number;
  longitude?: string | number;
};

type MagiaResponse = {
  items?: MagiaItem[];
  next_page?: number | null;
  stat?: string;
};

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function categoryFor(item: MagiaItem, fallback: string): string {
  const subsections: string[] = [];
  if (item.subsections) {
    for (const key of Object.keys(item.subsections)) {
      subsections.push(...(item.subsections[key] ?? []));
    }
  }
  const haystack = [...subsections, item.title ?? ""]
    .join(" ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  for (const mapping of CATEGORY_MAP) {
    if (mapping.match.test(haystack)) return mapping.type;
  }
  return fallback;
}

function coord(value: string | number | undefined): number | null {
  if (value == null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) && num !== 0 ? num : null;
}

function pickImage(item: MagiaItem): string | null {
  if (item.images && item.images.length > 0) {
    const img = item.images[0];
    if (typeof img === "string") return img;
    return (img as { url?: string }).url ?? (img as { large?: string }).large ?? null;
  }
  if (item.xLargeThumbnail) return item.xLargeThumbnail;
  if (item.content) {
    const fromContent = firstImage(item.content);
    if (fromContent) return fromContent;
  }
  return item.thumbnail || item.originalThumbnail || null;
}

function parseDistance(text: string): number | null {
  const match = text.match(/(\d+(?:[.,]\d+)?)\s*(?:km|kil[oó]metros)/i);
  return match ? Number(match[1].replace(",", ".")) : null;
}

function parseElevation(text: string): number | null {
  const patterns: RegExp[] = [
    /desnivel\s*(?:positivo|de\s*subida|ascenso|\+\s*)\s*([\d.]+)\s*m/i,
    /\+\s*([\d.]+)\s*m/i,
    /desnivel\s*(?:total|acumulado|de\s*la\s*ruta)\s*([\d.]+)\s*m/i,
    /([\d.]+)\s*m\s*de\s*desnivel/i,
  ];
  for (const re of patterns) {
    const match = text.match(re);
    if (match) {
      const value = Number(match[1]);
      if (Number.isFinite(value) && value > 0) return value;
    }
  }
  return null;
}

function parseDifficulty(text: string): string | null {
  const match = text.match(/(f[áa]cil|media|alta|dif[íi]cil|extremo)/i);
  if (!match) return null;
  const d = match[1].toLowerCase();
  if (d === "fácil" || d === "facil") return "fácil";
  if (d === "media") return "media";
  return "alta";
}

function itemToRoute(item: MagiaItem, fallbackType: string, sourceName: string): RouteInput | null {
  const title = item.title?.replace(/\s+/g, " ").trim();
  if (!title) return null;
  const description = cleanDescription(item.content || item.summary || "");
  const routeType = categoryFor(item, fallbackType);
  const haystack = `${description} ${item.summary ?? ""}`;

  return {
    title,
    slug: `${slugify(title)}-${item.id ?? Math.random().toString(36).slice(2, 8)}`,
    description,
    summary: item.summary ? item.summary.replace(/\s+/g, " ").trim() : null,
    image: pickImage(item),
    distance_km: parseDistance(haystack),
    elevation_m: parseElevation(haystack),
    difficulty: parseDifficulty(haystack),
    route_type: routeType,
    lat: coord(item.latitude),
    lng: coord(item.longitude),
    external_url: item.url || null,
    gpx_url: null,
    stages_count: 0,
    source: sourceName,
    source_url: item.url || `huescalamagia:${item.id}`,
    status: "published",
  };
}

async function fetchPage(sectionId: string, page: number): Promise<MagiaResponse> {
  const res = await axios.get<MagiaResponse>(
    `${API_BASE}/front/get_items/${APP_ID}/${sectionId}/?page=${page}&per_page=${PER_PAGE}`,
    {
      timeout: 20000,
      headers: {
        "User-Agent": "HuescaHoy/0.1 (+https://huescahoy.es) rutas de Huesca",
        Accept: "application/json",
      },
    }
  );
  return res.data;
}

export async function fetchHuescaLaMagiaRoutes(): Promise<RouteInput[]> {
  const results: RouteInput[] = [];

  for (const section of [
    { id: RUTAS_SECTION, fallback: "cultural", source: "huescalamagia-rutas" },
    { id: EXCURSIONES_SECTION, fallback: "excursion", source: "huescalamagia-excursiones" },
    { id: IMPRESCINDIBLES_SECTION, fallback: "cultural", source: "huescalamagia-imprescindibles" },
  ]) {
    let page = 1;
    let breakLoop = false;
    while (!breakLoop) {
      try {
        const data = await fetchPage(section.id, page);
        const items = Array.isArray(data?.items) ? data.items : [];
        for (const item of items) {
          const route = itemToRoute(item, section.fallback, section.source);
          if (route) results.push(route);
        }
        const next =
          typeof data.next_page === "number"
            ? data.next_page
            : data.next_page != null
              ? Number(data.next_page)
              : null;
        if (!next || next <= page || items.length === 0) breakLoop = true;
        else page = next;
      } catch {
        breakLoop = true;
      }
    }
  }

  return results;
}