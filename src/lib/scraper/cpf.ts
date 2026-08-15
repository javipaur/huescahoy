import { load } from "cheerio";
import type { ScrapeEvent } from "../types";
import { normalizeTime } from "./util";

const MONTHS: Record<string, number> = {
  ene: 1,
  feb: 2,
  mar: 3,
  abr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  ago: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dic: 12,
};

function monthNumber(name: string): number | null {
  const key = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .slice(0, 3);
  return MONTHS[key] ?? null;
}

function inferYear(day: number, month: number, today: Date): number {
  let year = today.getFullYear();
  const candidate = new Date(year, month - 1, day);
  const oneDayAgo = new Date(today);
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  oneDayAgo.setHours(0, 0, 0, 0);
  if (candidate < oneDayAgo) year += 1;
  return year;
}

function toIso(day: number, month: number, year: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function absoluteUrl(href: string | undefined, baseUrl: string): string | null {
  if (!href) return null;
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

function cleanPrice(value: string): string | null {
  const v = value.replace(/\s+/g, " ").trim();
  return v.length > 0 ? v : null;
}

function pushUnique(events: ScrapeEvent[], event: ScrapeEvent): void {
  const key = event.source_url ?? `${event.title}:${event.start_date}`;
  const exists = events.some((e) => (e.source_url ?? `${e.title}:${e.start_date}`) === key);
  if (!exists) events.push(event);
}

export function parseCierraPorFuera(html: string, baseUrl: string): ScrapeEvent[] {
  const $ = load(html);
  const events: ScrapeEvent[] = [];
  const today = new Date();

  $(".item.minimo").each((_, el) => {
    const item = $(el);
    const fechaText = item.find("> .fecha").first().text().trim();
    const a = item.find("> .descripcion h3 a").first();
    const title = a.text().trim();
    if (!title || !fechaText) return;

    const dateMatch = fechaText.match(/(\d{1,2})\s+([a-z\u00e0-\u00ff]+)/i);
    if (!dateMatch) return;
    const day = Number(dateMatch[1]);
    const month = monthNumber(dateMatch[2]);
    if (!month) return;
    const year = inferYear(day, month, today);

    const url = absoluteUrl(a.attr("href"), baseUrl);
    events.push({
      title,
      start_date: toIso(day, month, year),
      start_time: normalizeTime(item.find("> .hora").first().text().trim()),
      price: cleanPrice(item.find("> .precio").first().text()),
      external_url: url,
      source_url: url,
    });
  });

  $(".item-primero").each((_, el) => {
    const item = $(el);
    const a = item.find("h3 a, .titulo a, #texto a[href*='/evento/']").first();
    const title = (item.find(".titulo a").first().text() || item.find("h3 a").first().text()).trim();
    if (!title) return;

    const fechaText = item.find(".fecha").first().text().trim();
    const dateMatch = fechaText.match(/(\d{1,2})\s+([a-z\u00e0-\u00ff]+)\s+(\d{4})?/i);
    if (!dateMatch) return;
    const day = Number(dateMatch[1]);
    const month = monthNumber(dateMatch[2]);
    if (!month) return;
    const explicitYear = dateMatch[3] ? Number(dateMatch[3]) : null;
    const year = explicitYear ?? inferYear(day, month, today);

    const infoText = item.find(".datos_agenda").last().text().replace(/\s+/g, " ").trim();
    const timeMatch = infoText.match(/\d{1,2}:\d{2}/);
    const locationMatch = infoText.match(/([^0-9]+?)(?:\s*\d{1,2}:\d{2}|$)/);
    const location =
      locationMatch && locationMatch[1] && !locationMatch[1].includes("Día")
        ? locationMatch[1].trim()
        : null;

    const url = absoluteUrl(a.attr("href") ?? item.find("a[href*='/evento/']").first().attr("href"), baseUrl);
    const image = item.find("#foto img, .foto img").first().attr("src") ?? null;
    const description = item.find(".entradilla").first().text().replace(/\s+/g, " ").trim() || null;

    pushUnique(events, {
      title,
      start_date: toIso(day, month, year),
      start_time: timeMatch ? normalizeTime(timeMatch[0]) : null,
      location,
      price: cleanPrice(item.find(".precio").first().text()),
      description: description || null,
      image: image ? new URL(image, baseUrl).toString() : null,
      external_url: url,
      source_url: url,
    });
  });

  $(".item_portada").each((_, el) => {
    const card = $(el);
    const a = card.find("h3 a").first();
    const href = a.attr("href") ?? "";
    if (!href.includes("/huesca/evento/")) return;
    const title = a.text().trim();
    const dayText = card.find("> .texto .fecha").first().contents().filter((_, n) => n.type === "text").text().trim();
    const monthText = card.find("> .texto .fecha .mes").first().text().trim();
    if (!title || !dayText || !monthText) return;
    const day = Number(dayText);
    const month = monthNumber(monthText);
    if (!Number.isFinite(day) || !month) return;
    const year = inferYear(day, month, today);

    const url = absoluteUrl(href, baseUrl);
    const image = card.find("> .foto img").first().attr("src") ?? null;
    const description = card.find("> .texto .entradilla").first().text().replace(/\s+/g, " ").trim() || null;
    const localidad = card.find("> .texto .localidad").first().text().replace(/\s+/g, " ").trim() || null;

    pushUnique(events, {
      title,
      start_date: toIso(day, month, year),
      location: localidad,
      price: cleanPrice(card.find("> .texto .precio").first().text()),
      description: description || null,
      image: image ? new URL(image, baseUrl).toString() : null,
      external_url: url,
      source_url: url,
    });
  });

  return events;
}
