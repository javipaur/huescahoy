import { load } from "cheerio";

export function cleanDescription(html: string): string | null {
  const text = load(html).text().replace(/\s+/g, " ").trim();
  return text.length > 0 ? text : null;
}

export function firstImage(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

function absolutizeUrl(candidate: string | null | undefined, baseUrl: string): string | null {
  if (!candidate) return null;
  const trimmed = candidate.trim();
  if (!trimmed || trimmed.startsWith("data:")) return null;
  try {
    const url = new URL(trimmed, baseUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function extractImageFromJsonLdValue(value: unknown, baseUrl: string): string | null {
  if (!value) return null;
  if (typeof value === "string") return absolutizeUrl(value, baseUrl);
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = extractImageFromJsonLdValue(item, baseUrl);
      if (found) return found;
    }
    return null;
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    for (const key of ["url", "contentUrl", "thumbnailUrl", "image", "@id"]) {
      const v = obj[key];
      if (typeof v === "string") {
        const abs = absolutizeUrl(v, baseUrl);
        if (abs) return abs;
      }
    }
    if (obj.image) return extractImageFromJsonLdValue(obj.image, baseUrl);
  }
  return null;
}

function extractJsonLdImage($: ReturnType<typeof load>, baseUrl: string): string | null {
  let found: string | null = null;
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text();
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as unknown;
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      for (const node of nodes) {
        if (!node || typeof node !== "object") continue;
        const graph = (node as Record<string, unknown>)["@graph"];
        const candidates = Array.isArray(graph) ? graph : [node];
        for (const candidate of candidates) {
          if (!candidate || typeof candidate !== "object") continue;
          const obj = candidate as Record<string, unknown>;
          const img = extractImageFromJsonLdValue(obj.image ?? obj.thumbnailUrl, baseUrl);
          if (img) {
            found = img;
            return false;
          }
        }
      }
    } catch {
      // ignore invalid JSON-LD blocks
    }
    if (found) return false;
  });
  return found;
}

export function extractOgImage(html: string, baseUrl: string): string | null {
  const $ = load(html);
  const metaCandidates = [
    $('meta[property="og:image:secure_url"]').attr("content"),
    $('meta[property="og:image:url"]').attr("content"),
    $('meta[property="og:image"]').attr("content"),
    $('meta[name="twitter:image:src"]').attr("content"),
    $('meta[name="twitter:image"]').attr("content"),
    $('link[rel="image_src"]').attr("href"),
    $('meta[itemprop="image"]').attr("content"),
  ];
  for (const c of metaCandidates) {
    const abs = absolutizeUrl(c, baseUrl);
    if (abs) return abs;
  }

  const jsonLd = extractJsonLdImage($, baseUrl);
  if (jsonLd) return jsonLd;

  let fallback: string | null = null;
  $("img[src], img[data-src]").each((_, el) => {
    const raw = ($(el).attr("src") || $(el).attr("data-src") || "").trim();
    if (!raw || raw.startsWith("data:")) return;
    if (/\.svg(\?|#|$)/i.test(raw)) return;
    if (/logo|icon|sprite|avatar|placeholder|favicon/i.test(raw)) return;
    const width = Number($(el).attr("width"));
    const height = Number($(el).attr("height"));
    if (Number.isFinite(width) && width > 0 && width < 120) return;
    if (Number.isFinite(height) && height > 0 && height < 120) return;
    const abs = absolutizeUrl(raw, baseUrl);
    if (!abs) return;
    fallback = abs;
    return false;
  });

  return fallback;
}

export function normalizeTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = value.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const h = String(Number(match[1])).padStart(2, "0");
  const m = match[2];
  if (h === "00" && m === "00") return null;
  return `${h}:${m}`;
}

export function normalizeCategory(name: string | null | undefined): string | null {
  if (!name) return null;
  const cleaned = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length > 0 ? cleaned : null;
}
