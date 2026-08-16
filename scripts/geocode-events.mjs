import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadEnv() {
  const file = path.join(root, ".env.local");
  const env = {};
  if (!fs.existsSync(file)) return env;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/i);
    if (!match) continue;
    env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = loadEnv();
const DATABASE_URL = env.DATABASE_URL || process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL no encontrada en .env.local");
  process.exit(1);
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "HuescaHoy/0.1 (+https://huescahoy.javierpalacio.es) geocodificacion";
const ARAGON_VIEWBOX = "-2.4,43.0,0.9,39.5";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let lastRequest = 0;

async function queryNominatim(query) {
  const wait = lastRequest + 1100 - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequest = Date.now();
  try {
    const params = new URLSearchParams({
      q: query,
      format: "json",
      limit: "1",
      countrycodes: "es",
      bounded: "1",
      viewbox: ARAGON_VIEWBOX,
      "accept-language": "es",
    });
    const res = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const first = Array.isArray(data) ? data[0] : null;
    if (first && typeof first.lat === "string" && typeof first.lon === "string") {
      return { lat: Number(first.lat), lng: Number(first.lon) };
    }
    return null;
  } catch {
    return null;
  }
}

const pool = new pg.Pool({ connectionString: DATABASE_URL, max: 2 });

async function getCached(location) {
  const res = await pool.query(
    "SELECT lat, lng, not_found FROM geocodes WHERE location = $1",
    [location]
  );
  if (res.rows.length === 0) return null;
  const row = res.rows[0];
  return row.not_found ? { notFound: true } : { lat: row.lat, lng: row.lng };
}

async function setCached(location, lat, lng, notFound) {
  await pool.query(
    `INSERT INTO geocodes (location, lat, lng, not_found, updated_at)
     VALUES ($1, $2, $3, $4, to_char(now(), 'YYYY-MM-DD HH24:MI:SS'))
     ON CONFLICT (location) DO UPDATE SET
       lat = EXCLUDED.lat, lng = EXCLUDED.lng, not_found = EXCLUDED.not_found,
       updated_at = to_char(now(), 'YYYY-MM-DD HH24:MI:SS')`,
    [location, lat, lng, notFound ? 1 : 0]
  );
}

const GENERIC_VENUES = [
  "espacio escenico exterior",
  "espacio escenico",
  "espacio exterior cubierto",
  "espacio exterior",
  "sala polivalente",
  "pabellon polivalente",
];

const VENUE_QUERIES = [
  ["matadero", "Centro Cultural El Matadero, Huesca"],
  ["saura", "Auditorio Carlos Saura, Huesca"],
  ["danzantes", "Avenida de los Danzantes, Huesca"],
  ["coso alto", "Teatro Olimpia, Huesca"],
  ["olimpia", "Teatro Olimpia, Huesca"],
  ["sijena", "Monasterio de Sijena, Villanueva de Sijena"],
  ["chalamera", "Plaza Ramón J. Sender, Chalamera"],
  ["brotalia", "Brotalia, Ayerbe"],
];

const VENUE_COORDS = {
  "auditorio carlos saura": { lat: 42.1322118, lng: -0.4023396 },
};

function candidateQueries(location) {
  const key = location.trim().replace(/\s+/g, " ");
  const norm = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const out = [key];

  const stripped = key
    .replace(/^(C\.\s+|C\/\s+|Av\.\s+|Avda\.\s+|Avenida\s+|Pl\.\s+|Pza\.\s+|Cl\.\s+)/i, "")
    .replace(/\b\d{5}\b/g, "")
    .replace(/[,\s]+/g, " ")
    .trim();
  if (stripped && stripped !== key) out.push(stripped);

  if (!norm.includes("huesca")) {
    out.push(`${key}, Huesca`);
    if (stripped && stripped !== key) out.push(`${stripped}, Huesca`);
  }

  for (const [needle, query] of VENUE_QUERIES) {
    if (norm.includes(needle)) out.push(query);
  }
  return [...new Set(out)];
}

async function geocode(location) {
  const key = location.trim().replace(/\s+/g, " ");
  const norm = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (GENERIC_VENUES.some((venue) => norm.includes(venue))) return null;

  const cached = await getCached(key);
  if (cached && !cached.notFound) return { lat: cached.lat, lng: cached.lng };

  if (VENUE_COORDS[norm]) {
    await setCached(key, VENUE_COORDS[norm].lat, VENUE_COORDS[norm].lng, false);
    return VENUE_COORDS[norm];
  }

  let result = null;
  for (const query of candidateQueries(location)) {
    result = await queryNominatim(query);
    if (result) break;
  }

  if (cached?.notFound && result) {
    await setCached(key, result.lat, result.lng, false);
  }
  if (!cached && result) {
    await setCached(key, result.lat, result.lng, false);
  }
  if (!cached && !result) {
    await setCached(key, null, null, true);
  }
  return result;
}

async function main() {
  const events = await pool.query(
    `SELECT id, title, location FROM events
     WHERE lat IS NULL AND lng IS NULL
       AND location IS NOT NULL AND location <> ''`
  );

  console.log(`Eventos sin coordenadas: ${events.rows.length}`);

  let ok = 0;
  let fail = 0;
  const started = Date.now();

  for (const event of events.rows) {
    const result = await geocode(event.location);
    if (result) {
      await pool.query("UPDATE events SET lat = $1, lng = $2 WHERE id = $3", [
        result.lat,
        result.lng,
        event.id,
      ]);
      ok++;
      console.log(`  ok   ${event.id} "${event.title}" -> ${result.lat}, ${result.lng}`);
    } else {
      fail++;
      console.log(`  fail ${event.id} "${event.title}" (${event.location})`);
    }
  }

  console.log(`Hecho: ${ok} geocodificados, ${fail} sin resultado (${Date.now() - started} ms)`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
