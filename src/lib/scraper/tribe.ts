import axios from "axios";
import type { ScrapeEvent } from "../types";

const PER_PAGE = 50;
const MAX_PAGES = 6;

type TribeEvent = {
  title?: string;
  description?: string;
  excerpt?: string;
  url?: string;
  start_date?: string;
  end_date?: string;
  all_day?: boolean;
  cost?: string;
  image?: { url?: string } | string | null;
  venue?: { venue?: string; address?: string; city?: string; province?: string } | unknown[] | null;
  categories?: Array<{ name?: string }>;
};

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
    .replace(/[ \t]+/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text || null;
}

function splitDateTime(value: string | null | undefined): { date: string | null; time: string | null } {
  if (!value) return { date: null, time: null };
  const m = value.match(/^(\d{4}-\d{2}-\d{2})(?:[T\s]+(\d{2}:\d{2}))/);
  if (m) return { date: m[1], time: m[2] === "00:00" ? null : m[2] };
  const d = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return { date: d ? d[1] : null, time: null };
}

function pickCategory(categories: Array<{ name?: string }> | undefined): string | null {
  const names = (categories || []).map((c) => (c.name || "").toLowerCase()).join(" ");
  if (!names) return null;
  if (/m[uú]sica|concierto/.test(names)) return "Conciertos";
  if (/teatro|danza|esc[eé]nic|comedia|ópera|opera/.test(names)) return "Teatro";
  if (/exposici/.test(names)) return "Exposiciones";
  if (/cine|proyecci/.test(names)) return "Cine";
  if (/deport/.test(names)) return "Deporte";
  if (/infantil|familiar|niñ/.test(names)) return "Infantil";
  if (/feria|mercado/.test(names)) return "Ferias y mercados";
  if (/fiesta|tradici/.test(names)) return "Fiestas populares";
  return "Cultura";
}

function imageUrl(image: TribeEvent["image"]): string | null {
  if (!image) return null;
  if (typeof image === "string") return image;
  return image.url || null;
}

export async function fetchTribeEvents(baseUrl: string): Promise<ScrapeEvent[]> {
  const events: ScrapeEvent[] = [];
  const seen = new Set<string>();
  const startDate = new Date().toISOString().slice(0, 10);

  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await axios.get<{ events?: TribeEvent[]; total_pages?: number }>(baseUrl, {
      params: { per_page: PER_PAGE, page, start_date: startDate, status: "publish" },
      timeout: 20000,
      headers: {
        "User-Agent": "HuescaHoy/0.1 (+https://huescahoy.es) agenda de eventos de Aragón",
        Accept: "application/json, */*;q=0.8",
      },
    });
    const list = Array.isArray(res.data?.events) ? res.data.events : [];
    if (list.length === 0) break;

    for (const ev of list) {
      const title = (ev.title || "").replace(/<[^>]+>/g, "").trim();
      if (!title) continue;
      const start = splitDateTime(ev.start_date);
      if (!start.date) continue;
      const end = splitDateTime(ev.end_date);
      const url = ev.url || null;
      const key = url || `${title}|${start.date}`;
      if (seen.has(key)) continue;
      seen.add(key);

      let venueName: string | null = null;
      let address: string | null = null;
      if (ev.venue && !Array.isArray(ev.venue)) {
        const v = ev.venue as { venue?: string; address?: string; city?: string };
        venueName = (v.venue || "").trim() || null;
        const parts = [v.address, v.city].map((x) => (x || "").trim()).filter(Boolean);
        address = parts.length ? parts.join(", ") : null;
      }

      events.push({
        title,
        start_date: start.date,
        end_date: end.date && end.date !== start.date ? end.date : null,
        start_time: start.time,
        end_time: end.time,
        location: venueName,
        address,
        description: cleanHtml(ev.description || ev.excerpt || null),
        image: imageUrl(ev.image),
        price: (ev.cost || "").trim() || null,
        category: pickCategory(ev.categories),
        external_url: url,
        source_url: url,
      });
    }

    const totalPages = res.data?.total_pages ?? page;
    if (page >= totalPages) break;
  }

  return events;
}
