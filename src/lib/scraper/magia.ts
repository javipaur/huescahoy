import type { ScrapeEvent } from "../types";
import { cleanDescription } from "./util";

type MagiaItem = {
  title?: string;
  date?: string;
  endDate?: string | null;
  allDay?: number;
  address?: string;
  summary?: string;
  content?: string;
  thumbnail?: string;
  xLargeThumbnail?: string;
  originalThumbnail?: string;
  url?: string;
  latitude?: string | number;
  longitude?: string | number;
};

function isoDay(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

function isoTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = value.match(/T(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : null;
}

function cleanAddress(address: string | undefined): string | null {
  if (!address) return null;
  const cleaned = address
    .replace(/\s+HU\s+AR\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length > 0 ? cleaned : null;
}

function toCoord(value: string | number | undefined): number | null {
  if (value == null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) && num !== 0 ? num : null;
}

function endedBeforeToday(item: MagiaItem): boolean {
  const end = isoDay(item.endDate ?? item.date);
  if (!end) return false;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;
  return end < todayStr;
}

export function parseMagia(text: string): ScrapeEvent[] {
  let data: { items?: MagiaItem[] };
  try {
    data = JSON.parse(text);
  } catch {
    return [];
  }
  const items = Array.isArray(data?.items) ? data.items : [];

  const events: ScrapeEvent[] = [];
  for (const item of items) {
    const title = item.title?.replace(/\s+/g, " ").trim();
    const start = isoDay(item.date);
    if (!title || !start) continue;
    if (endedBeforeToday(item)) continue;

    const allDay = Boolean(item.allDay);
    events.push({
      title,
      start_date: start,
      end_date: isoDay(item.endDate),
      start_time: allDay ? null : isoTime(item.date),
      end_time: allDay ? null : isoTime(item.endDate),
      location: cleanAddress(item.address),
      description: cleanDescription(item.summary || item.content || ""),
      image:
        item.xLargeThumbnail ||
        item.thumbnail ||
        item.originalThumbnail ||
        null,
      external_url: item.url || null,
      source_url: item.url || null,
      latitude: toCoord(item.latitude),
      longitude: toCoord(item.longitude),
    });
  }

  return events;
}
