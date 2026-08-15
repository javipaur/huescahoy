import { load } from "cheerio";
import type { ScrapeEvent } from "../types";

function parseDateValue(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function iso(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function time(d: Date): string {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function splitDateTime(date: Date): { date: string; time: string | null } {
  const full = iso(date);
  const startTime = time(date);
  const isMidnight = startTime === "00:00";
  return { date: full, time: isMidnight ? null : startTime };
}

function cleanDescription(html: string): string {
  const $ = load(html);
  return $.text().replace(/\s+/g, " ").trim();
}

export function parseRss(xml: string, feedUrl: string): ScrapeEvent[] {
  const $ = load(xml, { xmlMode: true });
  const events: ScrapeEvent[] = [];

  $("item, entry").each((_, el) => {
    const node = $(el);
    const isAtom = node.is("entry");

    const title = node.find("> title").first().text().trim();
    if (!title) return;

    let link = "";
    if (isAtom) {
      link = node.find("> link[href]").first().attr("href") ?? "";
    } else {
      link = node.find("> link").first().text().trim() || (node.find("> guid").first().text().trim() && feedUrl);
    }
    if (!link && feedUrl) link = feedUrl;

    const dateStr =
      node.find("> published").first().text().trim() ||
      node.find("> updated").first().text().trim() ||
      node.find("> pubDate").first().text().trim() ||
      node.find("> dc\\:date").first().text().trim() ||
      node.find("> date").first().text().trim();

    const parsed = dateStr ? parseDateValue(dateStr) : null;
    const { date, time: startTime } = parsed ? splitDateTime(parsed) : { date: "", time: null };
    if (!date) return;

    const description =
      node.find("> content\\:encoded").first().text().trim() ||
      node.find("> content").first().text().trim() ||
      node.find("> summary").first().text().trim() ||
      node.find("> description").first().text().trim();

    let image: string | null = null;
    const enclosure = node.find("> enclosure").first().attr("url");
    if (enclosure) {
      image = enclosure;
    } else {
      const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i);
      if (imgMatch) image = imgMatch[1];
    }

    events.push({
      title,
      start_date: date,
      start_time: startTime,
      description: cleanDescription(description),
      external_url: link || null,
      source_url: link || null,
      image,
    });
  });

  return events;
}
