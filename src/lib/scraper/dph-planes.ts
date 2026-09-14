import axios from "axios";

const RUTAS_URL =
  "https://datosabiertos.dphuesca.es/dataset/a82f0a3b-53d3-4b79-a9f1-49de958e4955/resource/e8209c42-7248-4651-b206-3e028cf2846d/download/rutas.csv";
const ACTIVIDADES_URL =
  "https://datosabiertos.dphuesca.es/dataset/b33b5862-1622-463c-8ba0-41b830240c2e/resource/c7593ac0-5012-4471-8437-dcaf6eda9771/download";

type RawPlan = {
  slug: string;
  title: string;
  summary: string | null;
  body: string;
  image: string | null;
  published: number;
  sort_order: number;
  source: string;
  source_url: string | null;
};

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function decodeEntities(input: string): string {
  const entityMap: Record<string, string> = {
    aacute: "á",
    eacute: "é",
    iacute: "í",
    oacute: "ó",
    uacute: "ú",
    ntilde: "ñ",
    uuml: "ü",
    auml: "ä",
    ouml: "ö",
    agrave: "à",
    egrave: "è",
    ograve: "ò",
    ugrave: "ù",
    ccedil: "ç",
    nbsp: " ",
    amp: "&",
    quot: '"',
    lsquo: "‘",
    rsquo: "’",
    ldquo: "“",
    rdquo: "”",
    ndash: "–",
  };
  return input
    .replace(/&amp;/g, "&")
    .replace(/&([a-zA-Z]+);/g, (_, name) => entityMap[name.toLowerCase()] ?? `&${name};`)
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<p[^>]*>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n· ")
    .replace(/\r?\n\s*\n+/g, "\n\n")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]+>/g, "")
    .trim();
}

async function fetchText(url: string): Promise<string> {
  const res = await axios.get<string>(url, {
    timeout: 30000,
    headers: {
      "User-Agent": "HuescaHoy/0.1 (+https://huescahoy.es)",
      Accept: "*/*",
    },
  });
  return res.data;
}

async function fetchRutaPlans(): Promise<RawPlan[]> {
  const csv = await fetchText(RUTAS_URL);
  const lines = csv.split("\n").filter((l) => l.trim().length > 2 && !/^"Nombre"/.test(l));
  const plans: RawPlan[] = [];
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^"(.+?)","(.*?)","(.*?)"\s*$/);
    if (!match) continue;
    const [, nombre, itinerario, url] = match;
    if (!nombre || !url) continue;
    const name = nombre.trim();
    const itinerary = itinerario.trim();
    const slug = `${slugify(name)}-dph`;
    const stops = itinerary ? itinerary.split(/\s*-\s*/).filter(Boolean) : [];

    const body = [
      `${name}`,
      itinerary ? `\nItinerario: ${itinerary}` : null,
      stops.length > 2 ? `\nRuta: ${stops.join(" → ")}` : null,
      `\nMás info: ${url}`,
    ]
      .filter(Boolean)
      .join("\n");

    plans.push({
      slug,
      title: name,
      summary: itinerary || null,
      body,
      image: null,
      published: 1,
      source: "dph-rutas",
      source_url: url,
      sort_order: 100 + i,
    });
  }
  return plans;
}

async function fetchActividadPlans(): Promise<RawPlan[]> {
  const xml = await fetchText(ACTIVIDADES_URL);
  const blocks = xml.split(/<\/ActividadTuristica>/);
  const plans: RawPlan[] = [];
  let i = 0;

  for (const block of blocks) {
    const tipoRaw = block.match(/<Tipo[^>]*>([\s\S]*?)<\/Tipo>/)?.[1]?.trim() ?? "";
    const nombreRaw = block.match(/<Nombre[^>]*>([\s\S]*?)<\/Nombre>/)?.[1]?.trim() ?? "";
    const lugarRaw = block.match(/<Lugar[^>]*>([\s\S]*?)<\/Lugar>/)?.[1]?.trim() ?? "";
    const descripcionRaw = block.match(/<Descripcion[^>]*>([\s\S]*?)<\/Descripcion>/)?.[1]?.trim() ?? "";
    const url = block.match(/<URL[^>]*>([\s\S]*?)<\/URL>/)?.[1]?.trim() ?? "";

    const tipo = decodeEntities(tipoRaw);
    const nombre = decodeEntities(nombreRaw);
    const lugar = decodeEntities(lugarRaw);
    const descripcion = stripHtml(descripcionRaw);

    if (!nombre) continue;
    const body = decodeEntities(descripcion) || `${tipo} en ${lugar}. Más info: ${url}`;
    const slug = `${slugify(nombre)}-dph-act`;

    plans.push({
      slug,
      title: nombre,
      summary: [tipo, lugar].filter(Boolean).join(" · "),
      body,
      image: null,
      published: 1,
      source: "dph-actividades",
      source_url: url || null,
      sort_order: 200 + (i++),
    });
  }
  return plans;
}

export async function fetchDphPlanes(): Promise<RawPlan[]> {
  const [rutas, actividades] = await Promise.all([fetchRutaPlans(), fetchActividadPlans()]);
  return [...rutas, ...actividades];
}
