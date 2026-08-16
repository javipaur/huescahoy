import axios from "axios";
import { getGeocodeCache, setGeocodeCache } from "./db";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "HuescaHoy/0.1 (+https://huescahoy.es) agenda de eventos";
const ARAGON_VIEWBOX = "-2.4,43.0,0.9,39.5";

const GENERIC_VENUES = [
  "sala polivalente",
  "espacio escenico exterior",
  "espacio escenico",
  "espacio exterior cubierto",
  "espacio exterior",
];

let lastRequest = 0;
let inflight: Promise<{ lat: number; lng: number } | null> | null = null;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function queryNominatim(location: string): Promise<{ lat: number; lng: number } | null> {
  const minGap = 1100;
  const wait = lastRequest + minGap - Date.now();
  if (wait > 0) await sleep(wait);

  try {
    const res = await axios.get(NOMINATIM_URL, {
      timeout: 8000,
      params: {
        q: location,
        format: "json",
        limit: 1,
        countrycodes: "es",
        bounded: 1,
        viewbox: ARAGON_VIEWBOX,
        "accept-language": "es",
      },
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
    });
    const first = res.data?.[0];
    if (first && typeof first.lat === "string" && typeof first.lon === "string") {
      return { lat: Number(first.lat), lng: Number(first.lon) };
    }
    return null;
  } catch {
    return null;
  } finally {
    lastRequest = Date.now();
  }
}

export async function geocodeLocation(
  location: string | null | undefined
): Promise<{ lat: number; lng: number } | null> {
  if (!location || !location.trim()) return null;
  const key = location.trim().replace(/\s+/g, " ");
  const norm = key
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (GENERIC_VENUES.some((v) => norm.includes(v))) return null;

  const cached = await getGeocodeCache(key);
  if (cached) return cached.notFound ? null : { lat: cached.lat, lng: cached.lng };

  if (inflight) {
    const result = await inflight;
    if (result) return result;
    return queryAndCache(key);
  }

  inflight = queryAndCache(key);
  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

async function queryAndCache(
  key: string
): Promise<{ lat: number; lng: number } | null> {
  const result = await queryNominatim(key);
  await setGeocodeCache(key, result?.lat ?? null, result?.lng ?? null);
  return result;
}
