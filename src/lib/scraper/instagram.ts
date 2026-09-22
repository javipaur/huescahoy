import axios from "axios";
import { createWorker } from "tesseract.js";
import type { ScrapeEvent } from "../types";

const IG_APP_ID = "936619743392459";
const IG_MOBILE_UA =
  "Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 Instagram 219.0.0.12.117 Android (34; 240dpi; 1080x2340)";
const REELS_API = "https://i.instagram.com/api/v1/feed/reels_media/";
const TIMEOUT_MS = Number(process.env.SCRAPER_TIMEOUT_MS ?? 20000);
const MAX_ITEMS = Number(process.env.IG_MAX_ITEMS ?? 20);

const MONTHS: Record<string, number> = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
};

type ReelItem = {
  id: string;
  media_type?: number;
  image_versions2?: { candidates?: Array<{ width: number; height: number; url: string }> };
};

type ReelsResponse = {
  reels?: Record<string, { items?: ReelItem[] }>;
};

export function getHighlightIdFromUrl(url: string): string | null {
  const match = url.match(/\/stories\/highlights\/(\d+)/);
  return match ? match[1] : null;
}

function todaySpain(): string {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Madrid" }));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isoFor(day: number, month: number, year: number): string | null {
  const d = new Date(Date.UTC(year, month, 0));
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > d.getUTCDate()) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function resolveDate(day: number, month: number, explicitYear?: number): string | null {
  const today = todaySpain();
  if (explicitYear !== undefined) {
    const y = explicitYear >= 100 ? explicitYear : 2000 + explicitYear;
    const iso = isoFor(day, month, y);
    return iso && iso >= today ? iso : null;
  }
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Madrid" }));
  const year = now.getFullYear();
  for (const candidate of [year, year + 1]) {
    const iso = isoFor(day, month, candidate);
    if (iso && iso >= today) return iso;
  }
  return null;
}

function cleanLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function findTime(lines: string[]): string | null {
  for (const line of lines) {
    const match = line.match(/\b(\d{1,2})[.:](\d{2})\s*(?:h|horas)?\b/i);
    if (match) {
      const h = Number(match[1]);
      const m = Number(match[2]);
      if (h >= 0 && h <= 23 && m <= 59) {
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      }
    }
  }
  return null;
}

function isDateOnlyLine(line: string): boolean {
  if (/\b\d{1,2}[/\-.]\d{1,2}(?:[/\-.]\d{2,4})?\b/.test(line)) return true;
  if (/(?:lunes|martes|miercoles|miércoles|jueves|viernes|sabado|sábado|domingo)\s*,?\s*\d{1,2}\s*(?:de\s*)?[a-záéíóúñ]{4,}/i.test(line)) return true;
  return /\b\d{1,2}\s+(?:de\s+)?[a-záéíóúñ]{4,}\b/i.test(line);
}

function isTimeOnlyLine(line: string): boolean {
  return /^\s*\d{1,2}[.:]\d{2}\s*(?:h|horas)?\s*$/i.test(line);
}

function findDate(lines: string[]): string | null {
  for (const line of lines) {
    const numeric = line.match(/\b(\d{1,2})[/\-.](\d{1,2})(?:[/\-.](\d{2,4}))?\b/);
    if (numeric) {
      const day = Number(numeric[1]);
      const month = Number(numeric[2]);
      const explicit = numeric[3] ? Number(numeric[3]) : undefined;
      const resolved = resolveDate(day, month, explicit);
      if (resolved) return resolved;
      continue;
    }

    const weekday = line.match(
      /(?:lunes|martes|miercoles|miércoles|jueves|viernes|sabado|sábado|domingo)\s*,?\s*(\d{1,2})\s*(?:de\s*)?([a-záéíóúñ]{4,})/i
    );
    if (weekday) {
      const day = Number(weekday[1]);
      const month = MONTHS[weekday[2].toLowerCase()];
      if (month) {
        const resolved = resolveDate(day, month);
        if (resolved) return resolved;
      }
      continue;
    }

    const verbal = line.match(/\b(\d{1,2})\s+(?:de\s+)?([a-záéíóúñ]{4,})\b/i);
    if (verbal) {
      const day = Number(verbal[1]);
      const month = MONTHS[verbal[2].toLowerCase()];
      if (month) {
        const resolved = resolveDate(day, month);
        if (resolved) return resolved;
      }
    }
  }
  return null;
}

function findLocation(lines: string[]): string | null {
  for (const line of lines) {
    const match = line.match(/en\s+(?:el\s+|la\s+|los\s+|las\s+)?(.{4,})/i);
    if (match) {
      const location = match[1].replace(/[.,;:]+$/g, "").trim();
      if (location.length >= 4) return location;
    }
  }
  return null;
}

function isNoise(title: string): boolean {
  return /^(www\.|htt(p|ps):)/i.test(title) || /^\d+[.,]?\d*$/.test(title) || title.length < 4;
}

function isGenericHeader(title: string): boolean {
  return /^(agenda|programa|plan de (la )?agenda|esta semana|este fin de semana|proximamente|no te lo pierdas|apuntate|reserva)/i.test(
    title
  );
}

function isCapsLine(line: string): boolean {
  const letters = line.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/g, "");
  return letters.length >= 3 && letters === letters.toUpperCase();
}

function pickTitle(lines: string[], location: string | null): string | null {
  const candidates = lines.filter((line) => {
    if (isTimeOnlyLine(line)) return false;
    if (isDateOnlyLine(line)) return false;
    if (location) {
      if (line.trim() === location) return false;
      const m = line.match(/en\s+(?:el\s+|la\s+|los\s+|las\s+)?(.{4,})/i);
      if (m && m[1].replace(/[.,;:]+$/g, "").trim() === location) return false;
    }
    return true;
  });
  const meaningful = candidates.filter((line) => line.length >= 8 && !isNoise(line));
  const body = meaningful.filter((line) => !isGenericHeader(line));
  const pool = body.length > 0 ? body : meaningful;
  const caps = pool.filter((line) => isCapsLine(line));
  const source = caps.length > 0 ? caps : pool;
  const title = source.sort((a, b) => b.length - a.length)[0] ?? candidates.find((line) => !isNoise(line)) ?? null;
  if (!title) return null;
  return title.replace(/[.,;:]+$/g, "").trim();
}

export type ParsedHighlightEvent = {
  title: string;
  startDate: string;
  startTime: string | null;
  location: string | null;
  description: string;
};

export function parseInstagramHighlightText(text: string): ParsedHighlightEvent | null {
  const lines = cleanLines(text);
  if (lines.length === 0) return null;

  const startDate = findDate(lines);
  if (!startDate) return null;

  const startTime = findTime(lines);
  const location = findLocation(lines);
  const title = pickTitle(lines, location);
  if (!title) return null;

  const description = text.replace(/\s+/g, " ").trim();

  return { title, startDate, startTime, location, description };
}

function headersFor(cookie: string): Record<string, string> {
  return {
    "x-ig-app-id": IG_APP_ID,
    "User-Agent": IG_MOBILE_UA,
    Accept: "*/*",
    Referer: "https://www.instagram.com/",
    Cookie: cookie,
  };
}

function cookieFromEnv(): string {
  const parts: string[] = [];
  if (process.env.IG_SESSIONID) parts.push(`sessionid=${process.env.IG_SESSIONID}`);
  if (process.env.IG_DS_USER_ID) parts.push(`ds_user_id=${process.env.IG_DS_USER_ID}`);
  if (process.env.IG_USER_ID) parts.push(`user_id=${process.env.IG_USER_ID}`);
  return parts.join("; ");
}

async function bestImage(item: ReelItem): Promise<string | null> {
  const candidates = item.image_versions2?.candidates ?? [];
  if (candidates.length === 0) return null;
  return [...candidates].sort((a, b) => b.width * b.height - a.width * a.height)[0].url;
}

async function ocrImage(url: string): Promise<string | null> {
  const res = await axios.get<ArrayBuffer>(url, {
    responseType: "arraybuffer",
    timeout: 20000,
    headers: { "User-Agent": IG_MOBILE_UA, Referer: "https://www.instagram.com/" },
  });
  const buffer = Buffer.from(res.data);
  if (buffer.length === 0) return null;
  const worker = await createWorker("spa");
  try {
    const { data } = await worker.recognize(buffer);
    return data.text && data.text.trim().length > 0 ? data.text : null;
  } finally {
    await worker.terminate();
  }
}

export async function fetchInstagramHighlightEvents(url: string): Promise<ScrapeEvent[]> {
  const highlightId = getHighlightIdFromUrl(url);
  if (!highlightId) throw new Error("La URL de la fuente no apunta a un highlight de Instagram");

  const sessionId = process.env.IG_SESSIONID;
  if (!sessionId) throw new Error("Falta IG_SESSIONID en el entorno para leer el highlight");

  const res = await axios.get<ReelsResponse>(REELS_API, {
    params: { reel_ids: `highlight:${highlightId}` },
    timeout: TIMEOUT_MS,
    headers: headersFor(cookieFromEnv()),
  });

  const items = res.data?.reels?.[`highlight:${highlightId}`]?.items ?? [];
  if (items.length === 0) return [];

  const events: ScrapeEvent[] = [];
  for (const item of items.slice(0, MAX_ITEMS)) {
    try {
      const image = await bestImage(item);
      if (!image) continue;
      const text = await ocrImage(image);
      if (!text) continue;
      const parsed = parseInstagramHighlightText(text);
      if (!parsed) continue;

      events.push({
        title: parsed.title,
        start_date: parsed.startDate,
        start_time: parsed.startTime,
        end_time: null,
        location: parsed.location,
        description: parsed.description,
        image,
        external_url: `https://www.instagram.com/stories/highlights/${highlightId}/${item.id}/`,
        source_url: `https://www.instagram.com/stories/highlights/${highlightId}/${item.id}/`,
        category: null,
        latitude: null,
        longitude: null,
      });
    } catch {
      // una story que no se puede leer no derriba el proceso: se ignora
    }
  }

  return events;
}