import { load } from "cheerio";
import type { ScrapeEvent } from "../types";

const MONTHS: Record<string, number> = {
  ene: 0,
  feb: 1,
  mar: 2,
  abr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  ago: 7,
  sep: 8,
  sept: 8,
  oct: 9,
  nov: 10,
  dic: 11,
};

function monthIndex(word: string): number | null {
  const key = word.toLowerCase().slice(0, 4);
  return key.length >= 3 ? (MONTHS[key.slice(0, 3)] ?? null) : null;
}

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseRange(text: string): { start: Date; end: Date | null } | null {
  const parts = text.split("-").map((s) => s.trim());
  if (parts.length < 2) return null;
  const left = parts[0].match(/^(\d{1,2})(?:\s+(\w{3,}))?$/i);
  const right = parts[1].match(/^(\d{1,2})(?:\s+(\w{3,}))?$/i);
  if (!left || !right) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();

  let startMonth = left[2] ? monthIndex(left[2]) : null;
  let endMonth = right[2] ? monthIndex(right[2]) : null;
  if (startMonth === null) startMonth = endMonth;
  if (endMonth === null) endMonth = startMonth;
  if (startMonth === null || endMonth === null) return null;

  let start = new Date(year, startMonth, Number(left[1]));
  let end = right[1] ? new Date(year, endMonth, Number(right[1])) : null;

  if (end && end.getTime() < start.getTime()) {
    end = new Date(year + 1, endMonth, Number(right[1]));
  }
  if (start.getTime() < today.getTime() - 20 * 24 * 60 * 60 * 1000 && end) {
    start = new Date(end.getFullYear(), startMonth, Number(left[1]));
  }

  return { start, end };
}

export function parseAragon(html: string): ScrapeEvent[] {
  const $ = load(html);
  const events: ScrapeEvent[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  $("article.c-card").each((_, el) => {
    const card = $(el);
    const title = card.find(".c-card__title").text().trim();
    if (!title) return;

    const img = card.find(".c-card__image").attr("src") || null;
    const url =
      card.find("a.c-card__link").attr("href") || card.find("a.c-card__media").attr("href") || null;

    const datums = card
      .find(".c-card__datum")
      .map((_, d) => $(d).text().replace(/\s+/g, " ").trim())
      .get()
      .filter(Boolean);
    const rangeText = datums.find((d) => /^\d{1,2}\s/.test(d) || /-\s*\d/.test(d)) ?? null;
    const location = datums.find((d) => d !== rangeText) ?? null;

    if (!rangeText) return;
    const range = parseRange(rangeText);
    if (!range) return;

    let start = range.start;
    const end = range.end;
    if (start.getTime() < today.getTime()) {
      if (!end || end.getTime() < today.getTime()) return;
      start = today;
    }

    events.push({
      title,
      start_date: iso(start),
      end_date: end ? iso(end) : null,
      location,
      image: img,
      external_url: url,
      source_url: url,
    });
  });

  return events;
}
