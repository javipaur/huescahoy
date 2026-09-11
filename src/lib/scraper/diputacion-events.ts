import axios from "axios";
import { load } from "cheerio";
import type { ScrapeEvent } from "../types";
import { cleanDescription } from "./util";

const AGENDA_URL = "https://www.dphuesca.es/agenda";
const BASE_URL = "https://www.dphuesca.es";

function isoDayFromDate(date: string): string | null {
  const match = date.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

function isoDayFromSpanish(day: number | null, month: number, year: number): string | null {
  if (day == null) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseSpanishDate(text: string): {
  day: string | null;
  time: string | null;
} {
  const months: Record<string, number> = {
    enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
    julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
  };
  const now = new Date();
  const d = text.match(/(\d{1,2})\s+de\s+([a-záéíóúñ]+)/i);
  const time = text.match(/(\d{1,2}):(\d{2})/);
  if (d) {
    const month = months[d[2].toLowerCase()];
    if (month) {
      const day = Number(d[1]);
      const year = month < now.getMonth() + 1 ? now.getFullYear() + 1 : now.getFullYear();
      const hour = time ? String(Number(time[1])).padStart(2, "0") : null;
      const minute = time ? time[2] : null;
      return {
        day: isoDayFromSpanish(day, month, year),
        time: hour && minute ? `${hour}:${minute}` : null,
      };
    }
  }
  return { day: null, time: null };
}

export async function fetchDiputacionEvents(): Promise<ScrapeEvent[]> {
  const res = await axios.get<string>(AGENDA_URL, {
    timeout: 20000,
    responseType: "text",
    headers: {
      "User-Agent": "HuescaHoy/0.1 (+https://huescahoy.es) agenda de la Diputación de Huesca",
      Accept: "text/html",
    },
  });
  const $ = load(res.data);

  const events: ScrapeEvent[] = [];
  const seen = new Set<string>();

  const containers = $("main").length
    ? $("main")
    : $(".portlet-body, .asset-publisher, .agenda, article");
  const scrapedText = containers.text().replace(/\s+/g, " ");

  if (scrapedText.length === 0) return events;

  const candidates: Array<{ title: string; url: string | null }> = [];
  $("h1, h2, h3, h4, .title, .asset-title a, .entry-title a").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    const href = $(el).attr("href") ?? $(el).find("a").attr("href") ?? null;
    if (!text || text.length < 4) return;
    if (/cookie|aviso|privacidad|menú|menu|buscar|accesibilidad/i.test(text)) return;
    candidates.push({ title: text, url: href });
  });

  const datePattern = /(\d{1,2}\s+de\s+[a-záéíóúñ]+|[\d]{1,2}\/[\d]{1,2}\/[\d]{4})/gi;
  const dateMatches = [...scrapedText.matchAll(datePattern)].slice(0, 60);

  const added: string[] = [];
  for (const candidate of candidates) {
    const title = candidate.title;
    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    if (added.length >= 12) break;
    seen.add(key);

    const locationMatch = scrapedText.match(new RegExp(`${title.replace(/\s+/g, "\\s+")}\\s*([^.]*?(?:plaza|centro|pabellón|pabellon|salón|salon|teatro|auditorio|sala|museo|polideportivo)[^.]*?)\.`, "i"));
    const location = locationMatch ? locationMatch[1].replace(/\s+/g, " ").trim() : null;

    events.push({
      title,
      start_date: "2099-12-31",
      location,
      external_url: candidate.url ? new URL(candidate.url, BASE_URL).toString() : null,
      source_url: candidate.url ? new URL(candidate.url, BASE_URL).toString() : null,
      description: null,
      latitude: null,
      longitude: null,
      start_time: null,
    });
    added.push(title);
  }

  for (const dateMatch of dateMatches.slice(0, 8)) {
    const parsed = parseSpanishDate(dateMatch[0]);
    if (!parsed.day) continue;
    for (const event of events) {
      if (event.start_date === "2099-12-31") {
        event.start_date = parsed.day;
        event.start_time = parsed.time;
        break;
      }
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  return events.filter((e) => e.start_date >= today);
}