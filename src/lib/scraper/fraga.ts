import { load } from "cheerio";
import type { ScrapeEvent } from "../types";

const BASE = "https://www.fraga.org";

export function parseFraga(html: string): ScrapeEvent[] {
  const $ = load(html);
  const events: ScrapeEvent[] = [];

  $('.dia[data-eventos="true"]').each((_, el) => {
    const cell = $(el);
    const fecha = cell.attr("data-fecha");
    const m = fecha?.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!m) return;
    const date = `${m[3]}-${m[2]}-${m[1]}`;

    cell.find(".formatter.Eventos").each((_, e) => {
      const block = $(e);
      const title = block.find(".titulo").text().trim();
      if (!title) return;

      const description = block.find(".descripcion").text().replace(/\s+/g, " ").trim() || null;
      const href = block.find(".EnlaceDetalle").attr("href");
      const url = href ? (href.startsWith("http") ? href : BASE + href) : null;

      events.push({
        title,
        start_date: date,
        description,
        external_url: url,
        source_url: url,
      });
    });
  });

  return events;
}
