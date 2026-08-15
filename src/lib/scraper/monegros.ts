import { load } from "cheerio";
import type { ScrapeEvent } from "../types";
import { normalizeTime } from "./util";

const BASE = "https://turismolosmonegros.org";

export function parseMonegros(html: string): ScrapeEvent[] {
  const $ = load(html);
  const events: ScrapeEvent[] = [];

  $(".modulo25.bloques_fichas").each((_, el) => {
    const block = $(el);
    const title = block.find("h4").text().trim();
    if (!title) return;

    const fecha = block.find(".evento_detalle_fecha").text().trim();
    const m = fecha.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!m) return;
    const date = `${m[3]}-${m[2]}-${m[1]}`;

    const pueblo = block.find(".evento_detalle_pueblo").text().trim();
    const hora = normalizeTime(block.find(".evento_detalle_hora").text().trim());
    const img = block.find(".bloque_fichas_imagen img").attr("src");
    const image = img ? (img.startsWith("http") ? img : BASE + img) : null;

    const href = block.find("a").first().attr("href");
    const slug = href ? (href.split("/").filter(Boolean).pop() ?? "") : "";
    const url = slug ? `${BASE}/agenda/${slug.toLowerCase()}` : null;

    events.push({
      title,
      start_date: date,
      start_time: hora,
      location: pueblo || null,
      image,
      external_url: url,
      source_url: url,
    });
  });

  return events;
}
