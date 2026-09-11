import axios from "axios";
import { load } from "cheerio";
import type { RouteInput } from "../types";
import { cleanDescription, firstImage } from "./util";

const API = "https://www.senderosgr.es/wp-json/wp/v2/posts";
const HUESCA_CATEGORY = "26";
const PER_PAGE = 100;

type WpPost = {
  id?: number;
  title?: { rendered?: string };
  content?: { rendered?: string };
  excerpt?: { rendered?: string };
  link?: string;
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url?: string }>;
  };
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

function parseDistance(text: string): number | null {
  const match = text.match(/(\d+(?:[.,]\d+)?)\s*(?:km|kil[oó]metros)/i);
  return match ? Number(match[1].replace(",", ".")) : null;
}

function parseElevation(text: string): { gain: number | null; loss: number | null } {
  const levels: Array<{ op: string; re: RegExp }> = [
    { op: "loss", re: /desnivel\s*(?:negativo|de\s*bajada|descenso|-\s*)\s*([\d.]+)\s*m/i },
    { op: "gain", re: /desnivel\s*(?:positivo|de\s*subida|ascenso|\+\s*)\s*([\d.]+)\s*m/i },
    { op: "gain", re: /\+\s*([\d.]+)\s*m/i },
    { op: "loss", re: /-\s*([\d.]+)\s*m/i },
  ];
  let gain: number | null = null;
  let loss: number | null = null;
  for (const { op, re } of levels) {
    const match = text.match(re);
    if (match) {
      const value = Number(match[1]);
      if (op === "gain" && gain == null) gain = value;
      if (op === "loss" && loss == null) loss = value;
    }
  }
  return { gain: gain ?? loss, loss: loss ?? gain };
}

function extractMeta(contentHtml: string): {
  distance: number | null;
  elevation: number | null;
  difficulty: string | null;
  image: string | null;
} {
  const $ = load(contentHtml);
  const text = $.text().replace(/\s+/g, " ");

  const distance = parseDistance(text);
  const elevation = parseElevation(text).gain;
  const difficultyMatch = text.match(/(f[áa]cil|media|alta|dif[íi]cil|extremo)/i);
  const image = firstImage(contentHtml);

  let difficulty: string | null = null;
  if (difficultyMatch) {
    const d = difficultyMatch[1].toLowerCase();
    difficulty =
      d === "fácil" || d === "facil"
        ? "fácil"
        : d === "media"
          ? "media"
          : d === "alta" || d === "difícil" || d === "dificil"
            ? "alta"
            : "extrema";
  }

  return { distance, elevation, difficulty, image };
}

export async function fetchSenderosGrRoutes(): Promise<RouteInput[]> {
  const res = await axios.get<WpPost[]>(API, {
    params: { categories: HUESCA_CATEGORY, per_page: PER_PAGE, _embed: "true" },
    timeout: 20000,
    headers: {
      "User-Agent": "HuescaHoy/0.1 (+https://huescahoy.es) senderos GR de Huesca",
    },
  });

  const results: RouteInput[] = [];
  for (const post of res.data) {
    const title = post.title?.rendered?.trim();
    if (!title) continue;
    const html = post.content?.rendered ?? "";
    const excerpt = cleanDescription(post.excerpt?.rendered ?? "");
    const meta = extractMeta(html);
    const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null;
    const slug = slugify(title);

    results.push({
      title,
      slug: slug || `gr-${post.id ?? Math.random().toString(36).slice(2, 8)}`,
      description: cleanDescription(html),
      summary: excerpt,
      image: meta.image ?? featuredImage,
      distance_km: meta.distance,
      elevation_m: meta.elevation,
      difficulty: meta.difficulty,
      route_type: "senderismo",
      lat: null,
      lng: null,
      external_url: post.link || null,
      gpx_url: null,
      stages_count: 0,
      source: "senderosgr",
      source_url: post.link || `senderosgr:${post.id}`,
      status: "published",
    });
  }

  return results;
}