import { load } from "cheerio";
import type { ScrapeEvent } from "../types";
import { cleanDescription, firstImage, normalizeTime } from "./util";

export function parseRadarFeed(xml: string): ScrapeEvent[] {
  const $ = load(xml, { xmlMode: true });
  const events: ScrapeEvent[] = [];

  $("item").each((_, el) => {
    const node = $(el);
    const title = node.find("> title").first().text().trim();
    const startDate = node.find("> mec\\:startDate").first().text().trim();
    if (!title || !startDate) return;

    const link = node.find("> link").first().text().trim();
    const rawContent = node.find("> content\\:encoded").first().text().trim();
    const rawDescription = node.find("> description").first().text().trim();
    const body = rawContent || rawDescription;

    events.push({
      title,
      start_date: startDate,
      start_time: normalizeTime(node.find("> mec\\:startHour").first().text().trim()),
      end_date: node.find("> mec\\:endDate").first().text().trim() || null,
      end_time: normalizeTime(node.find("> mec\\:endHour").first().text().trim()),
      location: node.find("> mec\\:location").first().text().trim() || null,
      price: node.find("> mec\\:cost").first().text().trim() || null,
      category: node.find("> mec\\:category").first().text().trim() || null,
      description: cleanDescription(body),
      image: firstImage(rawContent) || firstImage(rawDescription),
      external_url: link || null,
      source_url: link || null,
    });
  });

  return events;
}
