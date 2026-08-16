import type { EventItem } from "@/lib/types";

export type EventZone = "ciudad" | "provincia" | "fuera" | null;

export const HUESCA_CENTER = { lat: 42.1396, lng: -0.4089 };

const CITY_RADIUS_KM = 11;

const PROVINCE_SOURCE_KEYS = ["somontano", "monegros", "fraga", "ainsa"];

const CITY_SOURCE_KEYS = ["huesca", "radar", "cierra por fuera"];

const OUTSIDE_MARKERS = [
  "provincia de zaragoza",
  "provincia de teruel",
  "zaragoza",
  "teruel",
  "tarazona",
  "carinena",
  "calatayud",
  "daroca",
  "epila",
];

const TOWN_MARKERS = [
  "barbastro",
  "jaca",
  "ainsa",
  "torreciudad",
  "quicena",
  "sangarren",
  "robres",
  "chalamera",
  "sijena",
  "laspaules",
  "alberuela",
  "binefar",
  "fraga",
  "monzon",
  "graus",
  "benasque",
  "sabinanigo",
  "sallent",
  "broto",
  "boltaña",
  "ayerbe",
];

const CITY_VENUES = [
  "auditorio carlos saura",
  "el matadero",
  "plaza navarra",
  "plaza de la catedral",
  "coso alto",
  "calle canellas",
  "av. del parque",
  "danzantes",
  "casal joven",
  "centro cívico",
];

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function zoneFor(
  event: Pick<EventItem, "lat" | "lng" | "location" | "source">
): EventZone {
  const location = (event.location ?? "").trim();
  const norm = normalize(location);
  const source = normalize(event.source);

  if (norm && OUTSIDE_MARKERS.some((marker) => norm.includes(marker))) return "fuera";

  if (event.lat != null && event.lng != null) {
    const dLat = (event.lat - HUESCA_CENTER.lat) * 111;
    const dLng =
      (event.lng - HUESCA_CENTER.lng) *
      111 *
      Math.cos((HUESCA_CENTER.lat * Math.PI) / 180);
    const dist = Math.hypot(dLat, dLng);
    return dist <= CITY_RADIUS_KM ? "ciudad" : "provincia";
  }

  if (PROVINCE_SOURCE_KEYS.some((key) => source.includes(key))) return "provincia";
  if (CITY_SOURCE_KEYS.some((key) => source.includes(key))) return "ciudad";

  if (norm) {
    if (TOWN_MARKERS.some((marker) => norm.includes(marker))) return "provincia";
    if (norm.includes("huesca") || CITY_VENUES.some((venue) => norm.includes(venue))) {
      return "ciudad";
    }
  }

  return null;
}

export function zoneLabel(zone: EventZone): string | null {
  if (zone === "ciudad") return "Huesca";
  if (zone === "provincia") return "Provincia";
  if (zone === "fuera") return "Aragón";
  return null;
}
