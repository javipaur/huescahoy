import { load } from "cheerio";
import type { ScrapeEvent } from "../types";
import { normalizeTime } from "./util";
import { mapLabelCategory } from "./category";

const BASE = "https://turismosomontano.es";

const MONTHS_ES: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
};

function dayDate(name: string, weekStart: Date): string | null {
  const m = name.match(/(\d{1,2})\s+([A-Za-zÁÉÍÓÚáéíóúñ]+)/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = MONTHS_ES[m[2].toLowerCase()];
  if (month === undefined) return null;
  const year = weekStart.getFullYear();
  let date = new Date(year, month, day);
  const minTime = weekStart.getTime() - 2 * 24 * 60 * 60 * 1000;
  if (date.getTime() < minTime) {
    date = new Date(year + 1, month, day);
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function dateFromWeekLink(href: string | null | undefined): string | null {
  const m = href?.match(/eventosdiarios\/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (!m) return null;
  return `${m[1]}-${String(Number(m[2])).padStart(2, "0")}-${String(Number(m[3])).padStart(2, "0")}`;
}

function liParts(liText: string, linkText: string): { title: string; category: string | null; time: string | null } {
  const text = liText.replace(/\s+/g, " ").trim();
  const timeMatch = text.match(/^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})\s*/);
  const rest = timeMatch ? text.slice(timeMatch[0].length) : text;
  const time = timeMatch ? normalizeTime(timeMatch[1]) : null;
  const catMatch = rest.match(/::\s*(.+)$/);
  const category = catMatch ? mapLabelCategory(catMatch[1].trim()) : null;
  const titlePart = catMatch ? rest.slice(0, catMatch.index).trim() : rest.trim();
  return { title: titlePart || linkText, category, time };
}

export function parseSomontano(html: string, weekStart: Date): ScrapeEvent[] {
  const $ = load(html);
  const events: ScrapeEvent[] = [];

  $(".jev_listrow").each((_, rowEl) => {
    const row = $(rowEl);
    const weekEl = row.prevAll(".ev_link_weekday").first();
    const date =
      dateFromWeekLink(weekEl.attr("href")) ??
      dayDate(weekEl.find(".jev_daysnames").text().replace(/\s+/g, " ").trim(), weekStart);
    if (!date) return;

    row.find("li.ev_td_li").each((_, liEl) => {
      const li = $(liEl);
      const link = li.find("a.ev_link_row");
      const titleAttr = (link.attr("title") ?? "").trim();
      const linkText = link.text().trim();
      const href = link.attr("href");
      const { title, category, time } = liParts(li.text(), titleAttr || linkText);
      if (!title) return;
      const url = href ? (href.startsWith("http") ? href : BASE + href) : null;
      events.push({
        title,
        start_date: date,
        start_time: time,
        category,
        external_url: url,
        source_url: url,
      });
    });
  });

  return events;
}
