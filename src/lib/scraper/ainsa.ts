import { load } from "cheerio";
import type { ScrapeEvent } from "../types";
import { normalizeTime } from "./util";
import { mapAinsaCategory } from "./category";

function parseInfoItem(text: string): { date: string; time: string | null } {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const m = cleaned.match(/(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (!m) return { date: "", time: null };
  const time = m[4] ? normalizeTime(`${m[4]}:${m[5]}`) : null;
  return { date: `${m[3]}-${m[2]}-${m[1]}`, time };
}

export function parseAinsa(html: string, url: string): ScrapeEvent[] {
  const $ = load(html);
  const title = $(".post__title, .entry-title, h1").first().text().trim();
  if (!title) return [];

  const dateItems = $("ul.post__info li.post__info-item--date");
  const start = parseInfoItem(dateItems.eq(0).find(".post__info-item-text").text());
  if (!start.date) return [];

  const endItem = dateItems.eq(1);
  const end = endItem.length ? parseInfoItem(endItem.find(".post__info-item-text").text()) : null;

  const locItem = $("ul.post__info li.post__info-item--location");
  const location =
    locItem.find(".post__info-item-title a").first().text().trim() ||
    locItem.find(".post__info-item-title").first().text().trim() ||
    null;

  const description =
    $(".entry-content, .post__content").first().text().replace(/\s+/g, " ").trim() || null;

  const image =
    $('meta[property="og:image"]').attr("content") ||
    $(".post__thumbnail img, .wp-post-image").first().attr("src") ||
    null;

  const pageClass =
    `${$("article.lsvr_event, article.post").first().attr("class") ?? ""} ${$("body").attr("class") ?? ""}`;
  const catSlug = pageClass.match(/lsvr_event_cat-([a-z0-9-]+)/i)?.[1] ?? null;

  const urlAttr = $('link[rel="canonical"]').attr("href") || url;

  return [
    {
      title,
      start_date: start.date,
      start_time: start.time,
      end_date: end && end.date !== start.date ? end.date : null,
      end_time: end && end.date === start.date ? end.time : null,
      location,
      description,
      image,
      external_url: urlAttr,
      source_url: urlAttr,
      category: mapAinsaCategory(catSlug),
    },
  ];
}
