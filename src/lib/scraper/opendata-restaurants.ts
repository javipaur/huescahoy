import axios from "axios";
import type { RestaurantInput } from "../types";

const CKAN_API = "https://opendata.aragon.es/aod/api/3/action/package_show";
const PACKAGE_ID = "cafeterias-y-restaurantes-en-la-comunidad-autonoma-de-aragon";

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
  return text.length > 0 && text !== "0" ? text : null;
}

function cuisineFrom(row: OpenDataRow): string | null {
  const sigla = String(row.actividad_sigla ?? "").toUpperCase();
  if (sigla.includes("C")) return "Bar / Cafetería";
  if (sigla.includes("R")) return "Restaurante";
  const categoria = asString(row.categoria)?.toLowerCase() ?? "";
  if (categoria.includes("tenedor")) return "Restaurante";
  if (categoria.includes("taza")) return "Bar / Cafetería";
  return null;
}

function inHuesca(row: OpenDataRow): boolean {
  const provincia = String(row.actividad_provincia ?? "").toUpperCase();
  if (provincia === "HU") return true;
  const comarca = asString(row.nombre_comarca)?.toLowerCase() ?? "";
  return comarca.length > 0 && /hoya|huesca|gallé?llego|jacetania|sobrarbe|ribagorza|cinco villas|monegros|somontano|bajo cin|bajo cinca|cinca medio/i.test(comarca);
}

async function getDataUrl(): Promise<string | null> {
  const res = await axios.get(CKAN_API, {
    params: { id: PACKAGE_ID },
    timeout: 20000,
  });
  const resources = res.data?.result?.resources as Array<{ format?: string; url?: string }> | undefined;
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
    if (String(row.estado ?? "").toUpperCase() === "B") continue;
    if (!inHuesca(row)) continue;
    const name = asString(row.nombre_establecimiento ?? row.nombre ?? row.name ?? row.nombre_comercial);
    if (!name) continue;
    const slug = slugify(name);
    const signatura = asString(row.signatura);
    const localidad = asString(row.localidad_establecimiento ?? row.municipio);
    const direccion = asString(row.direccion_establecimiento ?? row.direccion ?? row.ubicacion);
    const direccionWeb = asString(row.direccion_web ?? row.web ?? row.website);
    const telefono = asString(row.telefono_establecimiento ?? row.telefono ?? row.phone);
    const email = asString(row.e_mail ?? row.email ?? row.correo);
    const comarca = asString(row.nombre_comarca);
    const categoria = asString(row.categoria);

    const address = [direccion, localidad].filter(Boolean).join(", ") || null;
    const description = [comarca ? `Localidad: ${localidad ?? "Huesca"}` : null, categoria ? `Clasificación: ${categoria}` : null]
      .filter(Boolean)
      .join(".\n");

    results.push({
      name,
      slug: `${slug}-${Math.random().toString(36).slice(2, 8)}`,
      description: description || null,
      cuisine_type: cuisineFrom(row),
      price_range: null,
      address,
      phone: telefono,
      email,
      website: direccionWeb,
      image: null,
      lat: null,
      lng: null,
      rating: null,
      source: "opendata-aragon",
      source_url: signatura ?? `opendata:${row.registro ?? row.id ?? name}`,
      status: "published",
    });
  }

  return results;
}