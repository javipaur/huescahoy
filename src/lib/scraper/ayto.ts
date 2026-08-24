import { load } from "cheerio";
import type { ScrapeEvent } from "../types";
import { normalizeTime } from "./util";

function isoDate(value: string): string | null {
  const match = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) return null;
  const [, d, m, y] = match;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function absolute(href: string | undefined, baseUrl: string): string | null {
  if (!href) return null;
  try {
    const url = new URL(href, baseUrl);
    url.searchParams.delete("redirect");
    return url.toString();
  } catch {
    return null;
  }
}

export function parseAytoHuesca(html: string, baseUrl: string): ScrapeEvent[] {
  const $ = load(html);
  const events: ScrapeEvent[] = [];

  $(".card-title").each((_, el) => {
    const link = $(el);
    const card = link.closest(".card");
    const title = link.text().replace(/\s+/g, " ").trim();
    if (!title) return;

    const iconValue = (iconClass: string): string | null => {
      const text = card
        .find(`.${iconClass}`)
        .first()
        .parent()
        .text()
        .replace(/\s+/g, " ")
        .trim();
      return text.length > 0 ? text : null;
    };

    const startDate = isoDate(iconValue("fa-calendar-alt") ?? "");
    if (!startDate) return;

    let image =
      card
        .find("a[style*='background-image']")
        .first()
        .attr("style")
        ?.match(/url\(['\"]?([^'\")]+)['\"]?\)/)?.[1] ?? null;
    image = image ?? card.find("img").first().attr("src") ?? null;
    if (image) {
      try {
        image = new URL(image, baseUrl).toString();
      } catch {
        image = null;
      }
    }

    events.push({
      title,
      start_date: startDate,
      start_time: normalizeTime(iconValue("fa-clock")),
      location: iconValue("fa-map-marker-alt"),
      image,
      external_url: absolute(link.attr("href"), baseUrl),
      source_url: absolute(link.attr("href"), baseUrl),
    });
  });

  return events;
}
