import axios from "axios";
import type { ScrapeEvent } from "../types";
import { cleanDescription } from "./util";

const API_BASE = "https://web.huescalamagia.es";
const APP_ID = "1015514";
const AGENDA_SECTION = "20599588";
const PER_PAGE = 24;

type MagiaItem = {
  id?: string | number;
  title?: string;
  date?: string;
  startDate?: string;
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
  sortDate?: string;
};

type MagiaResponse = {
  items?: MagiaItem[];
  next_page?: number | null;
  stat?: string;
};

function isoDay(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

function isoTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = value.match(/T(\d{2}):(\d{2})/);
  return match && match[1] !== "00" ? `${match[1]}:${match[2]}` : null;
}

function cleanAddress(address: string | undefined): string | null {
  if (!address) return null;
  const cleaned = address.replace(/\s+/g, " ").trim();
  return cleaned.length > 0 ? cleaned : null;
}

function toCoord(value: string | number | undefined): number | null {
  if (value == null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) && num !== 0 ? num : null;
}

function endedBeforeToday(item: MagiaItem): boolean {
  const end = isoDay(item.endDate ?? item.sortDate ?? item.date);
  if (!end) return false;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
    today.getDate()
  ).padStart(2, "0")}`;
  return end < todayStr;
}

export function parseHuescaLaMagiaEvents(data: MagiaResponse): ScrapeEvent[] {
  const items = Array.isArray(data?.items) ? data.items : [];
  const events: ScrapeEvent[] = [];

  for (const item of items) {
    const title = item.title?.replace(/\s+/g, " ").trim();
    const start = isoDay(item.sortDate ?? item.date ?? item.startDate);
    if (!title || !start) continue;
    if (endedBeforeToday(item)) continue;

    const allDay = Boolean(item.allDay);
    events.push({
      title,
      start_date: start,
      end_date: isoDay(item.endDate),
      start_time: allDay ? null : isoTime(item.date ?? item.startDate),
      end_time: allDay ? null : isoTime(item.endDate),
      location: cleanAddress(item.address),
      description: cleanDescription(item.summary || item.content || ""),
      image: item.xLargeThumbnail || item.thumbnail || item.originalThumbnail || null,
      external_url: item.url || null,
      source_url: item.url || `huescalamagia-agenda:${item.id}`,
      latitude: toCoord(item.latitude),
      longitude: toCoord(item.longitude),
    });
  }

  return events;
}

export async function fetchHuescaLaMagiaEvents(): Promise<ScrapeEvent[]> {
  const results: ScrapeEvent[] = [];
  let page = 1;
  let breakLoop = false;

  while (!breakLoop) {
    try {
      const res = await axios.get<MagiaResponse>(
        `${API_BASE}/front/get_items/${APP_ID}/${AGENDA_SECTION}/?page=${page}&per_page=${PER_PAGE}`,
        {
          timeout: 20000,
          headers: {
            "User-Agent": "HuescaHoy/0.1 (+https://huescahoy.es) agenda de HuescaLaMagia",
            Accept: "application/json",
          },
        }
      );
      const data = res.data;
      results.push(...parseHuescaLaMagiaEvents(data));
      const next =
        typeof data.next_page === "number"
          ? data.next_page
          : data.next_page != null
            ? Number(data.next_page)
            : null;
      if (!next || next <= page || data.items?.length === 0) breakLoop = true;
      else page = next;
    } catch {
      breakLoop = true;
    }
  }

  return results;
}