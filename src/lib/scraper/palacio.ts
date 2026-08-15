import { load } from "cheerio";
import type { ScrapeEvent } from "../types";
import { normalizeTime } from "./util";

function absoluteUrl(href: string | undefined, baseUrl: string): string | null {
  if (!href) return null;
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

export function parsePalacio(html: string, baseUrl: string): ScrapeEvent[] {
  const $ = load(html);
  const events: ScrapeEvent[] = [];

  $(".caj").each((_, el) => {
    const card = $(el);
    const title = card.find("h3").first().text().trim();
    const link = card.find("a[href*='/evento/']").first().attr("href");
    if (!title) return;

    let startDate = "";
    let startTime: string | null = null;
    let endTime: string | null = null;
    let location: string | null = null;
    let category: string | null = null;

    card.find(".cont-caracts > .caract").each((_, el2) => {
      const c = $(el2);
      const cat = c.find(".boton-categoria").first().text().trim();
      if (cat) {
        category = cat;
        return;
      }
      const label = c.children("div").first().text().replace(/[:\s]/g, "").toLowerCase();
      const valueNode = c.clone();
      valueNode.children("div").first().remove();
      const value = valueNode.text().replace(/\s+/g, " ").trim();
      if (!value) return;

      if (label.includes("inicio")) {
        startDate = value;
      } else if (label.includes("hora")) {
        const times = value.match(/\d{1,2}:\d{2}/g);
        startTime = normalizeTime(times?.[0] ?? null);
        endTime = normalizeTime(times?.[1] ?? null);
      } else if (label.includes("ubicaci")) {
        location = value;
      }
    });

    const dateMatch = startDate.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
    if (!dateMatch) return;
    const isoDate = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;

    const image =
      card
        .find(".foto")
        .first()
        .attr("style")
        ?.match(/url\(["']?([^"')]+)["']?\)/)?.[1] ?? null;

    const url = absoluteUrl(link, baseUrl);
    events.push({
      title,
      start_date: isoDate,
      start_time: startTime,
      end_time: endTime,
      location: location || "Palacio de Congresos de Huesca",
      category,
      image,
      external_url: url,
      source_url: url,
    });
  });

  return events;
}
