import axios from "axios";
import type { RestaurantInput } from "../types";
import { cleanDescription } from "./util";

const API_BASE = "https://web.huescalamagia.es";
const APP_ID = "1015514";
const RESTAURANTS_SECTION = "39139552";
const BARS_SECTION = "39235810";
const PER_PAGE = 24;

type MagiaImage = { url?: string; large?: string } | string;
type MagiaItem = {
  id?: string | number;
  title?: string;
  summary?: string;
  content?: string;
  images?: MagiaImage[];
  thumbnail?: string;
  xLargeThumbnail?: string;
  originalThumbnail?: string;
  address?: string;
  latitude?: string | number;
  longitude?: string | number;
  phoneNumber?: string;
  email?: string;
  website?: string;
  url?: string;
};

type MagiaResponse = {
  items?: MagiaItem[];
  next_page?: number | null;
  stat?: string;
};

let lastIp: string | null = null;

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(sectionId: string, page: number): Promise<MagiaResponse> {
  const res = await axios.get<MagiaResponse>(
    `${API_BASE}/front/get_items/${APP_ID}/${sectionId}/?page=${page}&per_page=${PER_PAGE}`,
    {
      timeout: 20000,
      headers: {
        "User-Agent": "HuescaHoy/0.1 (+https://huescahoy.es) directorio de restaurantes de Huesca",
        Accept: "application/json",
      },
    }
  );
  return res.data;
}

function coord(value: string | number | undefined): number | null {
  if (value == null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) && num !== 0 ? num : null;
}

function pickImage(item: MagiaItem): string | null {
  if (item.images && item.images.length > 0) {
    const img = item.images[0];
    if (typeof img === "string") return img;
    return (img as { url?: string }).url ?? (img as { large?: string }).large ?? null;
  }
  return item.xLargeThumbnail || item.thumbnail || item.originalThumbnail || null;
}

function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function itemToRestaurant(item: MagiaItem, cuisineFallback: string, sourceName: string): RestaurantInput | null {
  const name = item.title?.replace(/\s+/g, " ").trim();
  if (!name) return null;
  const slug = normalizeName(name);
  if (!slug) return null;

  return {
    name,
    slug: `${slug}-${item.id ?? cryptoRandom()}`,
    description: cleanDescription(item.summary || item.content || ""),
    cuisine_type: cuisineFallback,
    price_range: null,
    address: item.address ? item.address.replace(/\s+/g, " ").trim() : null,
    phone: item.phoneNumber || null,
    email: item.email || null,
    website: item.website || item.url || null,
    image: pickImage(item),
    lat: coord(item.latitude),
    lng: coord(item.longitude),
    rating: null,
    source: sourceName,
    source_url: item.url || `huescalamagia:${item.id}`,
    status: "published",
  };
}

function cryptoRandom(): string {
  return Math.random().toString(36).slice(2, 8);
}

export async function fetchHuescaLaMagiaRestaurants(): Promise<RestaurantInput[]> {
  const results: RestaurantInput[] = [];

  for (const section of [
    { id: RESTAURANTS_SECTION, cuisine: "Restaurante", source: "huescalamagia-restaurantes" },
    { id: BARS_SECTION, cuisine: "Bar / Cafetería", source: "huescalamagia-bares" },
  ]) {
    let page = 1;
    let breakLoop = false;
    while (!breakLoop) {
      try {
        if (lastIp) await sleep(400);
        const data = await fetchPage(section.id, page);
        lastIp = "fetched";
        const items = Array.isArray(data?.items) ? data.items : [];
        for (const item of items) {
          const restaurant = itemToRestaurant(item, section.cuisine, section.source);
          if (restaurant) results.push(restaurant);
        }
        const next =
          typeof data.next_page === "number"
            ? data.next_page
            : data.next_page != null
              ? Number(data.next_page)
              : null;
        if (!next || next <= page || items.length === 0) breakLoop = true;
        else page = next;
      } catch {
        breakLoop = true;
      }
    }
  }

  return results;
}