import axios from "axios";
import type { ScrapeEvent } from "../types";

const BASE_URL = "https://www.zaragoza.es/sede/servicio/cultura/evento.geojson";
const PAGE_SIZE = 100;
const MAX_PAGES = 5;

type ZaragozaFeature = {
  geometry?: { type?: string; coordinates?: [number, number] };
  properties?: {
    id?: number;
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    subEvent?: Array<{
      location?: {
        title?: string;
        streetAddress?: string;
        junta?: string;
      };
    }>;
    category?: Array<{ title?: string }>;
    type?: string;
    image?: string;
    alt?: string;
    sameAs?: string;
    attachment?: { image?: string };
    price?: Array<{ fareGroup?: string; hasCurrencyValue?: number }>;
  };
};

function absUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("/")) return `https://www.zaragoza.es${trimmed}`;
  return trimmed;
}

function splitIso(value: string | null | undefined): { date: string | null; time: string | null } {
  if (!value) return { date: null, time: null };
  const m = value.match(/^(\d{4}-\d{2}-\d{2})(?:[T\s](\d{2}:\d{2}))/);
  if (m) {
    return { date: m[1], time: m[2] === "00:00" ? null : m[2] };
  }
  const d = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return { date: d ? d[1] : null, time: null };
}

function cleanHtml(input: string | null | undefined): string | null {
  if (!input) return null;
  const text = input
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text || null;
}

function pickCategory(p: NonNullable<ZaragozaFeature["properties"]>): string | null {
  const type = (p.type || "").toLowerCase();
  const cats = (p.category || []).map((c) => (c.title || "").toLowerCase()).join(" ");
  const hay = `${type} ${cats}`;
  if (/concierto|m[uú]sica/.test(hay)) return "Conciertos";
  if (/teatro|danza|circo|esc[eé]nic/.test(hay)) return "Teatro";
  if (/exposici|museo/.test(hay)) return "Exposiciones";
  if (/cine|proyecci/.test(hay)) return "Cine";
  if (/deporte|carrera|torneo/.test(hay)) return "Deporte";
  if (/infantil|niñ|familia|joven/.test(hay)) return "Infantil";
  if (/feria|mercado/.test(hay)) return "Ferias y mercados";
  if (/fiesta|tradici/.test(hay)) return "Fiestas populares";
  return "Cultura";
}

function pickPrice(p: NonNullable<ZaragozaFeature["properties"]>): string | null {
  const prices = p.price || [];
  for (const pr of prices) {
    if (pr.fareGroup?.toLowerCase().includes("gratuit")) return "Gratis";
    if (typeof pr.hasCurrencyValue === "number" && pr.hasCurrencyValue > 0) {
      return `${pr.hasCurrencyValue} €`;
    }
  }
  return null;
}

function parseZaragozaGeoJson(jsonText: string): ScrapeEvent[] {
  let data: { features?: ZaragozaFeature[] };
  try {
    data = JSON.parse(jsonText) as { features?: ZaragozaFeature[] };
  } catch {
    return [];
  }
  const features = Array.isArray(data.features) ? data.features : [];
  const events: ScrapeEvent[] = [];
  const seen = new Set<string>();

  for (const f of features) {
    const p = f.properties || {};
    const title = (p.title || "").trim();
    if (!title) continue;
    const start = splitIso(p.startDate);
    if (!start.date) continue;

    const end = splitIso(p.endDate);
    const subLoc = p.subEvent?.[0]?.location;
    const location = (subLoc?.title || p.location || "").trim() || null;
    const address = (subLoc?.streetAddress || "").trim() || null;
    const sourceUrl = absUrl(p.alt || p.sameAs || null);
    const image = absUrl(p.attachment?.image || p.image || null);
    const dedupe = sourceUrl || `${title}|${start.date}`;
    if (seen.has(dedupe)) continue;
    seen.add(dedupe);

    let longitude: number | null = null;
    let latitude: number | null = null;
    const coords = f.geometry?.coordinates;
    if (Array.isArray(coords) && coords.length >= 2) {
      const [x, y] = coords;
      // Zaragoza GeoJSON uses projected coords (EPSG:23030) in sample; only keep plausible WGS84
      if (Math.abs(x) <= 180 && Math.abs(y) <= 90) {
        longitude = x;
        latitude = y;
      }
    }

    events.push({
      title,
      start_date: start.date,
      end_date: end.date && end.date !== start.date ? end.date : null,
      start_time: start.time,
      end_time: end.time,
      location,
      address,
      description: cleanHtml(p.description),
      image,
      price: pickPrice(p),
      category: pickCategory(p),
      external_url: sourceUrl,
      source_url: sourceUrl,
      latitude,
      longitude,
    });
  }

  return events;
}

export async function fetchZaragozaEvents(): Promise<ScrapeEvent[]> {
  const events: ScrapeEvent[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const start = page * PAGE_SIZE;
    const res = await axios.get<string>(BASE_URL, {
      params: { rows: PAGE_SIZE, start },
      timeout: 20000,
      responseType: "text",
      headers: {
        "User-Agent": "HuescaHoy/0.1 (+https://huescahoy.es) agenda de eventos de Aragón",
        Accept: "application/json, application/geo+json, */*;q=0.8",
      },
    });
    const chunk = parseZaragozaGeoJson(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
    if (chunk.length === 0) break;
    events.push(...chunk);
    if (chunk.length < PAGE_SIZE) break;
  }
  const seen = new Set<string>();
  return events.filter((e) => {
    const key = e.source_url || `${e.title}|${e.start_date}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
