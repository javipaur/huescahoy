import axios from "axios";
import type { RestaurantInput } from "../types";

const CKAN_API = "https://opendata.aragon.es/datos/catalogo/api/3/action/package_show";
const PACKAGE_ID = "cafeterias-y-restaurantes-en-la-comunidad-autonoma-de-aragon";

const HUESCA_COMARCA_MARKERS = [
  "hoya de huesca",
  "plana de uesca",
  "hoya",
  "alto galllego",
  "jacetania",
  "sob rarbe",
  "sobrarbe",
  "ribagorza",
  "cinco villas",
  "monegros",
  "somontano",
  "bajo cin",
  "cinca medio",
];

const HUESCA_TOWN_MARKERS = [
  "huesca",
  "jaca",
  "ainsa",
  "barbastro",
  "monzón",
  "monzon",
  "fraga",
  "sabiñánigo",
  "sabinanigo",
  "huesca",
  "benasque",
  "boltaña",
  "boltana",
  "lorve",
  "plan",
  "campo",
  "graus",
  "sarriera",
  "sariñena",
  "sarinena",
  "bielsa",
  "torla",
  "broto",
  "hecho",
  "anso",
  "ejea",
  "tamarite",
];

type OpenDataRow = Record<string, unknown>;

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function asString(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function cleanName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

function inHuesca(row: OpenDataRow): boolean {
  const comarca = (row.comarca ?? row.municipio ?? "").toString().toLowerCase();
  const municipio = (row.municipio ?? "").toString().toLowerCase();
  const anyText = `${comarca} ${municipio}`.toLowerCase();

  if (HUESCA_COMARCA_MARKERS.some((m) => anyText.includes(cleanName(m)))) return true;
  if (HUESCA_TOWN_MARKERS.some((m) => anyText.includes(cleanName(m)))) return true;
  if (municipio.includes("huesca")) return true;
  return false;
}

async function getDataUrl(): Promise<string | null> {
  const res = await axios.get(CKAN_API, {
    params: { id: PACKAGE_ID },
    timeout: 20000,
  });
  const resources = res.data?.result?.resources as Array<{ id?: string; format?: string; url?: string }> | undefined;
  if (!resources) return null;
  const json = resources.find((r) => (r.format ?? "").toUpperCase().includes("JSON"));
  const csv = resources.find((r) => (r.format ?? "").toUpperCase().includes("CSV"));
  return json?.url ?? csv?.url ?? resources[0]?.url ?? null;
}

export async function fetchOpenDataRestaurants(): Promise<RestaurantInput[]> {
  const dataUrl = await getDataUrl();
  if (!dataUrl) return [];

  const res = await axios.get<unknown>(dataUrl, {
    timeout: 60000,
    headers: {
      "User-Agent": "HuescaHoy/0.1 (+https://huescahoy.es) restaurantes de Huesca",
      Accept: "application/json",
    },
    responseType: "json",
  });

  let rows: OpenDataRow[] = [];
  if (Array.isArray(res.data)) {
    rows = res.data as OpenDataRow[];
  } else if (res.data && Array.isArray((res.data as { data?: unknown }).data)) {
    rows = (res.data as { data: OpenDataRow[] }).data;
  } else if (res.data && Array.isArray((res.data as { results?: unknown }).results)) {
    rows = (res.data as { results: OpenDataRow[] }).results;
  }

  const results: RestaurantInput[] = [];
  for (const row of rows) {
    if (!inHuesca(row)) continue;
    const name = asString(row.nombre ?? row.name ?? row.nombre_comercial);
    if (!name) continue;
    const slug = slugify(name);
    const address = asString(row.direccion ?? row.ubicacion);
    const web = asString(row.web ?? row.website ?? row.url);
    const phone = asString(row.telefono ?? row.phone);
    const cuisine = (asString(row.categoria) ?? asString(row.tipo) ?? asString(row.actividad))?.toLowerCase() ?? null;

    results.push({
      name,
      slug: `${slug}-${Math.random().toString(36).slice(2, 8)}`,
      description: asString(row.descripcion ?? row.description ?? row.complemento),
      cuisine_type: cuisine?.includes("caf") ? "Bar / Cafetería" : cuisine?.includes("rest") ? "Restaurante" : "Restaurante",
      price_range: asString(row.precio ?? row.rango_precio),
      address,
      phone,
      email: asString(row.email ?? row.correo),
      website: web,
      image: null,
      lat: null,
      lng: null,
      rating: null,
      source: "opendata-aragon",
      source_url: `opendata:${row.registro ?? row.id ?? name}`,
      status: "published",
    });
  }

  return results;
}