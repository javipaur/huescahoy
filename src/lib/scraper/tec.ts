import { load } from "cheerio";
import type { ScrapeEvent } from "../types";
import { cleanDescription, firstImage } from "./util";

const MONTHS: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

function naiveDate(value: string): { date: string; time: string | null } | null {
  const m = value.match(/^\w{3},\s+(\d{1,2})\s+(\w{3})\s+(\d{4})\s+(\d{2}):(\d{2}):/i);
  if (!m) return null;
  const day = Number(m[1]);
  const month = MONTHS[m[2].toLowerCase().slice(0, 3)];
  if (month === undefined) return null;
  const year = Number(m[3]);
  const hour = Number(m[4]);
  const minute = m[5];
  const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const time = hour === 0 && minute === "00" ? null : `${String(hour).padStart(2, "0")}:${minute}`;
  return { date, time };
}

export function parseTecFeed(xml: string, feedUrl: string): ScrapeEvent[] {
  const $ = load(xml, { xmlMode: true });
  const events: ScrapeEvent[] = [];

  $("item").each((_, el) => {
    const node = $(el);
    const title = node.find("> title").first().text().trim();
    if (!title) return;

    let link = node.find("> link").first().text().trim();
    if (!link) {
      const guid = node.find("> guid").first().text().trim();
      if (guid && feedUrl) link = feedUrl;
    }
    if (!link && feedUrl) link = feedUrl;

    const dateStr = node.find("> pubDate").first().text().trim();
    const parsed = dateStr ? naiveDate(dateStr) : null;
    if (!parsed) return;

    const content =
      node.find("> content\\:encoded").first().text().trim() ||
      node.find("> content").first().text().trim() ||
      node.find("> description").first().text().trim();

    events.push({
      title,
      start_date: parsed.date,
      start_time: parsed.time,
      description: cleanDescription(content),
      external_url: link || null,
      source_url: link || null,
      image: firstImage(content),
    });
  });

  return events;
}
