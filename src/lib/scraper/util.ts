import { load } from "cheerio";

export function cleanDescription(html: string): string | null {
  const text = load(html).text().replace(/\s+/g, " ").trim();
  return text.length > 0 ? text : null;
}

export function firstImage(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

export function extractOgImage(html: string, baseUrl: string): string | null {
  const $ = load(html);
  const metas = [
    $('meta[property="og:image"]').attr("content"),
    $('meta[property="og:image:url"]').attr("content"),
    $('meta[name="twitter:image"]').attr("content"),
    $('meta[name="twitter:image:src"]').attr("content"),
  ];
  let candidate = metas.find((c) => c && c.trim().length > 0)?.trim() ?? null;

  if (!candidate) {
    $("img[src]").each((_, el) => {
      const src = $(el).attr("src")?.trim();
      if (!src || src.startsWith("data:")) return;
      if (/\.svg(\?|#|$)/i.test(src)) return;
      const width = Number($(el).attr("width"));
      if (Number.isFinite(width) && width > 0 && width < 200) return;
      candidate = src;
      return false;
    });
  }

  if (!candidate) return null;
  try {
    const url = new URL(candidate, baseUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
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
