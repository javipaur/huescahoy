import axios from "axios";
import { load } from "cheerio";
import type { ScrapeEvent } from "../types";
import { cleanDescription } from "./util";

const API = "https://www.huescaturismo.com/wp-json/wp/v2/mec-events";
const PER_PAGE = 100;

type WpEvent = {
  id?: number;
  date?: string;
  title?: { rendered?: string };
  content?: { rendered?: string };
  excerpt?: { rendered?: string };
  link?: string;
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url?: string }>;
  };
};

function isoDay(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

function isoTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = value.match(/T(\d{2}):(\d{2})/);
  return match && match[1] !== "00" ? `${match[1]}:${match[2]}` : null;
}

function extractDates(html: string, fallback: string | undefined): { start: string | null; end: string | null; time: string | null } {
  const $ = load(html);
  const bodyText = $.text();

  const isoMatch = bodyText.match(/(\d{4}-\d{2}-\d{2})/);
  let start = isoMatch ? isoMatch[1] : null;

  const dayMatch = bodyText.match(/(\d{1,2})\s*(?:de\s*)?([a-záéíóúñ]+)\s*(?:de\s*)?(\d{4})/i);
  if (!start && dayMatch) {
    const months: Record<string, string> = {
      enero: "01", febrero: "02", marzo: "03", abril: "04", mayo: "05", junio: "06",
      julio: "07", agosto: "08", septiembre: "09", octubre: "10", noviembre: "11", diciembre: "12",
    };
    const month = months[dayMatch[2].toLowerCase()];
    if (month) {
      const day = Number(dayMatch[1]);
      const year = Number(dayMatch[3]);
      start = `${year}-${month}-${String(day).padStart(2, "0")}`;
    }
  }
  if (!start) start = isoDay(fallback);

  const timeMatch = bodyText.match(/(\d{1,2}:\d{2})\s*(?:h|horas)?/i);
  const time = timeMatch ? timeMatch[1].padStart(5, "0") : null;

  return { start, end: start, time };
}

export async function fetchHuescaTurismoEvents(): Promise<ScrapeEvent[]> {
  const results: ScrapeEvent[] = [];
  let page = 1;
  let breakLoop = false;

  while (!breakLoop) {
    try {
      const res = await axios.get<WpEvent[]>(API, {
        params: { per_page: PER_PAGE, page },
        timeout: 20000,
        headers: {
          "User-Agent": "HuescaHoy/0.1 (+https://huescahoy.es) agenda de turismo de Huesca",
        },
      });
      const posts = res.data;
      if (posts.length === 0) breakLoop = true;

      for (const post of posts) {
        const title = post.title?.rendered?.trim();
        if (!title) continue;
        const html = post.content?.rendered ?? "";
        const { start, end, time } = extractDates(html, post.date);
        if (!start) continue;
        const excerpt = cleanDescription(post.excerpt?.rendered ?? "");
        const content = cleanDescription(html);
        const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null;

        results.push({
          title,
          start_date: start,
          end_date: end,
          start_time: time,
          end_time: null,
          location: null,
          description: content ?? excerpt,
          image: featuredImage,
          external_url: post.link || null,
          source_url: post.link || `huescaturismo:${post.id}`,
          latitude: null,
          longitude: null,
        });
      }

      if (posts.length < PER_PAGE) breakLoop = true;
      else page++;
    } catch {
      breakLoop = true;
    }
  }

  return results;
}