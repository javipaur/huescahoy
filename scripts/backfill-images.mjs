import { Pool } from "pg";
import axios from "axios";
import { load } from "cheerio";

const TIMEOUT_MS = 8000;
const CONCURRENCY = 5;
const UA =
  "HuescaHoy/0.1 (+https://huescahoy.es) agenda de eventos de Huesca";

function extractOgImage(html, baseUrl) {
  const $ = load(html);
  const metas = [
    $('meta[property="og:image"]').attr("content"),
    $('meta[property="og:image:url"]').attr("content"),
    $('meta[name="twitter:image"]').attr("content"),
    $('meta[name="twitter:image:src"]').attr("content"),
  ];
  let candidate = metas.find((c) => c && c.trim().length > 0)?.trim() ?? null;

  if (!candidate) {
    $("img[src]").each((_, el) => {
      const src = $(el).attr("src")?.trim();
      if (!src || src.startsWith("data:")) return;
      if (/\.svg(\?|#|$)/i.test(src)) return;
      const width = Number($(el).attr("width"));
      if (Number.isFinite(width) && width > 0 && width < 200) return;
      candidate = src;
      return false;
    });
  }

  if (!candidate) return null;
  try {
    const url = new URL(candidate, baseUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

async function fetchText(url) {
  const res = await axios.get(url, {
    timeout: TIMEOUT_MS,
    responseType: "text",
    maxRedirects: 5,
    headers: { "User-Agent": UA, Accept: "text/html,*/*;q=0.8" },
  });
  return res.data;
}

const today = new Date().toISOString().slice(0, 10);
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const { rows } = await pool.query(
  `SELECT id, title, source_url FROM events
   WHERE status = 'published'
     AND COALESCE(end_date, start_date) >= $1
     AND (image IS NULL OR image = '')
     AND source_url IS NOT NULL AND source_url <> ''
   ORDER BY start_date ASC`,
  [today]
);

console.log(`Eventos sin imagen con página origen: ${rows.length}`);

let ok = 0;
let fail = 0;
let i = 0;

async function worker() {
  while (i < rows.length) {
    const row = rows[i++];
    try {
      const html = await fetchText(row.source_url);
      const image = extractOgImage(html, row.source_url);
      if (image) {
        await pool.query("UPDATE events SET image = $1 WHERE id = $2", [
          image,
          row.id,
        ]);
        ok++;
        console.log(`OK  ${row.id} ${row.title.slice(0, 60)}`);
      } else {
        fail++;
        console.log(`--  ${row.id} sin og:image ${row.title.slice(0, 50)}`);
      }
    } catch (err) {
      fail++;
      console.log(
        `ERR ${row.id} ${String(err?.message ?? err).slice(0, 70)}`
      );
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
await pool.end();
console.log(`\nCompletado: ${ok} imágenes añadidas, ${fail} sin resultado.`);
