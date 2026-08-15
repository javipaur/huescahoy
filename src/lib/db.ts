import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type {
  Category,
  CategoryInput,
  CategoryWithCount,
  EventInput,
  EventItem,
  Plan,
  PlanInput,
  ScrapeEvent,
  ScraperRun,
  Source,
  SourceInput,
  Suggestion,
  SuggestionInput,
  SuggestionKind,
  SuggestionStatus,
} from "./types";

const dataDir = path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, "huescahoy.db");

function createDb(): Database.Database {
  const db = new Database(dbPath);
  db.pragma("foreign_keys = ON");
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA busy_timeout = 5000");
  db.exec("PRAGMA synchronous = NORMAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'calendar',
      color TEXT NOT NULL DEFAULT '#e8452c',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      start_time TEXT,
      end_time TEXT,
      location TEXT,
      address TEXT,
      price TEXT,
      description TEXT,
      image TEXT,
      external_url TEXT,
      source TEXT NOT NULL DEFAULT 'manual',
      source_url TEXT UNIQUE,
      featured INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'published',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      kind TEXT NOT NULL DEFAULT 'rss',
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      last_run TEXT,
      last_status TEXT,
      last_error TEXT,
      last_found INTEGER NOT NULL DEFAULT 0,
      last_new INTEGER NOT NULL DEFAULT 0,
      last_updated INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS scraper_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      finished_at TEXT,
      source_id INTEGER,
      source_name TEXT,
      events_found INTEGER NOT NULL DEFAULT 0,
      events_new INTEGER NOT NULL DEFAULT 0,
      events_updated INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      error TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS suggestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kind TEXT NOT NULL DEFAULT 'mejora',
      title TEXT NOT NULL,
      detail TEXT,
      contact TEXT,
      status TEXT NOT NULL DEFAULT 'nuevo',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS planes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      summary TEXT,
      body TEXT NOT NULL,
      image TEXT,
      published INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS geocodes (
      location TEXT PRIMARY KEY,
      lat REAL,
      lng REAL,
      not_found INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_events_start ON events(start_date);
    CREATE INDEX IF NOT EXISTS idx_events_category ON events(category_id);
    CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
    CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);
    CREATE INDEX IF NOT EXISTS idx_planes_published ON planes(published);
  `);

  const eventColumns = db.prepare("PRAGMA table_info(events)").all() as Array<{ name: string }>;
  const eventNames = new Set(eventColumns.map((c) => c.name));
  if (!eventNames.has("lat")) {
    db.exec("ALTER TABLE events ADD COLUMN lat REAL");
  }
  if (!eventNames.has("lng")) {
    db.exec("ALTER TABLE events ADD COLUMN lng REAL");
  }
  return db;
}

declare global {
  var __huescahoyDb: Database.Database | undefined;
}

const db = global.__huescahoyDb ?? (global.__huescahoyDb = createDb());

function toPlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function syncSleep(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function withRetry(fn: () => void): void {
  let lastError: unknown;
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      fn();
      return;
    } catch (err) {
      lastError = err;
      const isLock = err instanceof Error && err.message.includes("locked");
      if (!isLock) throw err;
      syncSleep(50);
    }
  }
  throw lastError;
}

export function todayStr(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type GeocodeResult = {
  lat: number;
  lng: number;
  notFound: boolean;
};

export function getGeocodeCache(location: string): GeocodeResult | null {
  const row = db
    .prepare("SELECT lat, lng, not_found AS notFound FROM geocodes WHERE location = ?")
    .get(location) as { lat: number | null; lng: number | null; notFound: number } | undefined;
  if (!row) return null;
  if (row.notFound === 1 || row.lat == null || row.lng == null) {
    return { lat: 0, lng: 0, notFound: true };
  }
  return { lat: row.lat, lng: row.lng, notFound: false };
}

export function setGeocodeCache(
  location: string,
  lat: number | null,
  lng: number | null
): void {
  db.prepare(
    `INSERT INTO geocodes (location, lat, lng, not_found, updated_at) VALUES (?, ?, ?, ?, datetime('now'))
     ON CONFLICT(location) DO UPDATE SET lat = excluded.lat, lng = excluded.lng,
       not_found = excluded.not_found, updated_at = datetime('now')`
  ).run(location, lat, lng, lat == null || lng == null ? 1 : 0);
}

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizedTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function seedIfEmpty(): void {
  withRetry(() => {
    db.exec("BEGIN IMMEDIATE");
    let inTransaction = true;
    try {
      const row = db
        .prepare("SELECT COUNT(*) AS total FROM categories")
        .get() as { total: number };
      if (row.total > 0) {
        db.exec("COMMIT");
        return;
      }

      const insertCategory = db.prepare(
        "INSERT INTO categories (slug, name, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)"
      );
      const insertPlan = db.prepare(
        `INSERT INTO planes (slug, title, summary, body, image, published, sort_order)
         VALUES (?, ?, ?, ?, NULL, 1, ?)`
      );

      const categories: [string, string, string, string][] = [
        ["conciertos", "Conciertos", "music", "#e8452c"],
        ["teatro", "Teatro", "theater", "#7c3aed"],
        ["exposiciones", "Exposiciones", "image", "#0ea5e9"],
        ["deporte", "Deporte", "dumbbell", "#16a34a"],
        ["infantil", "Infantil", "baby", "#f59e0b"],
        ["cine", "Cine", "clapperboard", "#db2777"],
        ["ferias", "Ferias y mercados", "shopping-bag", "#0d9488"],
        ["fiestas", "Fiestas populares", "party-popper", "#ea580c"],
        ["cultura", "Cultura", "landmark", "#6366f1"],
      ];

      for (let i = 0; i < categories.length; i++) {
        const [slug, name, icon, color] = categories[i];
        insertCategory.run(slug, name, icon, color, i + 1);
      }

      const demoPlans: Array<{
        title: string;
        summary: string;
        body: string;
        order: number;
      }> = [
        {
          title: "Un día completo por el Casco Antiguo de Huesca",
          summary:
            "Una ruta a pie por las plazas, iglesias y rincones con más encanto del centro.",
          body:
            "Empieza el día en la plaza de la Catedral con un café en una de sus terrazas. La catedral abre por la mañana y merece la pena ver su retablo mayor y las vistas desde el campanario.\n\nDespués, pasea por la calle del Parque hasta el Museo de Huesca, donde se guarda el sarcófago de doña Sancha. La entrada es barata y se ve en una hora.\n\nA mediodía, cruza hacia el Coso Bajo: es la hora del vermú y las tapas. Elige dos o tres bares y comparte.\n\nPor la tarde, sube hasta el cerro de San Jorge para ver la ciudad desde arriba y volver bajando por las escaleras de la catedral.\n\nSi te queda energía, acaba el día con un paseo por el parque Miguel Servet al atardecer.",
          order: 1,
        },
        {
          title: "Planes en familia: un fin de semana en Huesca",
          summary:
            "Parques, museos y actividades pensadas para ir con niñas y niños.",
          body:
            "El parque Miguel Servet es el gran patio de juegos de Huesca: amplio, arbolado y con una zona de juegos donde las niñas y niños corren a sus anchas.\n\nEl Museo de Huesca organiza talleres infantiles algunos sábados; consulta la agenda del museo antes de ir.\n\nA media mañana, un paseo por la muralla y el cerro de San Jorge permite ver la ciudad de un vistazo sin cansar demasiado las piernas pequeñas.\n\nPara comer, los menús de mediodía en el centro son familiares y económicos.\n\nPor la tarde, si hay función en la programación, los espectáculos infantiles del Teatro Olimpia y el Palacio de Congresos suelen estar pensados para estas edades. Tienes todos los estrenos en la agenda de HuescaHoy.",
          order: 2,
        },
      ];

      for (const p of demoPlans) {
        insertPlan.run(slugify(p.title), p.title, p.summary, p.body, p.order);
      }

      db.exec("COMMIT");
      inTransaction = false;
    } catch (err) {
      if (inTransaction) {
        try {
          db.exec("ROLLBACK");
        } catch {
          // ignore rollback errors, keep original error
        }
      }
      throw err;
    }
  });
}

seedIfEmpty();

// ---------- Row helpers ----------

const EVENT_COLUMNS =
  "id, slug, title, category_id AS categoryId, start_date AS startDate, end_date AS endDate, start_time AS startTime, end_time AS endTime, location, address, price, description, image, external_url AS externalUrl, source, source_url AS sourceUrl, featured, status, lat, lng, created_at AS createdAt, updated_at AS updatedAt";

function rowToEvent(row: unknown): EventItem {
  return toPlain(row as EventItem);
}

// ---------- Public queries ----------

export type EventFilter = {
  category?: string;
  from?: string;
  to?: string;
  q?: string;
  upcoming?: boolean;
  featured?: boolean;
  limit?: number;
  includeHidden?: boolean;
};

export function getEvents(filter: EventFilter = {}): EventItem[] {
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (!filter.includeHidden) {
    conditions.push("e.status = 'published'");
  }
  if (filter.category) {
    conditions.push("c.slug = ?");
    params.push(filter.category);
  }
  if (filter.featured) {
    conditions.push("e.featured = 1");
  }
  if (filter.upcoming) {
    conditions.push("(e.start_date >= ? OR (e.end_date IS NOT NULL AND e.end_date >= ?))");
    params.push(todayStr(), todayStr());
  }
  if (filter.from) {
    conditions.push("(e.end_date IS NOT NULL AND e.end_date >= ?) OR e.end_date IS NULL AND e.start_date >= ?");
    params.push(filter.from, filter.from);
  }
  if (filter.to) {
    conditions.push("e.start_date <= ?");
    params.push(filter.to);
  }
  if (filter.q) {
    conditions.push("(e.title LIKE ? OR e.description LIKE ? OR e.location LIKE ?)");
    params.push(`%${filter.q}%`, `%${filter.q}%`, `%${filter.q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  let sql = `SELECT e.${EVENT_COLUMNS.replace(/, /g, ", e.")} FROM events e LEFT JOIN categories c ON c.id = e.category_id ${where} ORDER BY e.start_date ASC, e.start_time ASC`;
  if (filter.limit) sql += ` LIMIT ${Math.max(1, Math.min(filter.limit, 200))}`;

  return (db.prepare(sql).all(...params) as EventItem[]).map(rowToEvent);
}

export function getEventBySlug(slug: string): EventItem | null {
  const row = db.prepare(`SELECT ${EVENT_COLUMNS} FROM events WHERE slug = ?`).get(slug);
  return row ? rowToEvent(row) : null;
}

export function getEventById(id: number): EventItem | null {
  const row = db.prepare(`SELECT ${EVENT_COLUMNS} FROM events WHERE id = ?`).get(id);
  return row ? rowToEvent(row) : null;
}

export function getCategoryBySlug(slug: string): Category | null {
  const row = db.prepare("SELECT * FROM categories WHERE slug = ?").get(slug);
  return row ? toPlain(row as Category) : null;
}

export function getCategoryById(id: number): Category | null {
  const row = db.prepare("SELECT * FROM categories WHERE id = ?").get(id);
  return row ? toPlain(row as Category) : null;
}

export function getCategoriesWithCounts(): CategoryWithCount[] {
  const rows = db
    .prepare(
      `SELECT c.id, c.slug, c.name, c.icon, c.color, c.sort_order, COUNT(e.id) AS event_count
       FROM categories c
       LEFT JOIN events e ON e.category_id = c.id AND e.status = 'published' AND (e.start_date >= ? OR (e.end_date IS NOT NULL AND e.end_date >= ?))
       GROUP BY c.id
       ORDER BY c.sort_order, c.name`
    )
    .all(todayStr(), todayStr()) as CategoryWithCount[];
  return rows.map(toPlain);
}

export function getFeaturedEvents(limit = 3): EventItem[] {
  return getEvents({ featured: true, upcoming: true, limit });
}

export function getUpcomingEvents(limit = 6): EventItem[] {
  return getEvents({ upcoming: true, limit });
}

export function getStats() {
  const published = db
    .prepare(
      "SELECT COUNT(*) AS total FROM events WHERE status = 'published' AND (start_date >= ? OR (end_date IS NOT NULL AND end_date >= ?))"
    )
    .get(todayStr(), todayStr()) as { total: number };
  const upcoming = db
    .prepare(
      "SELECT COUNT(*) AS total FROM events WHERE status = 'published' AND start_date BETWEEN ? AND ?"
    )
    .get(todayStr(), todayStr(7)) as { total: number };
  const categories = db
    .prepare("SELECT COUNT(*) AS total FROM categories")
    .get() as { total: number };
  const sources = db
    .prepare("SELECT COUNT(*) AS total FROM sources WHERE enabled = 1")
    .get() as { total: number };
  return {
    upcoming: published.total,
    week: upcoming.total,
    categories: categories.total,
    sources: sources.total,
  };
}

// ---------- Admin queries ----------

export function getCategoriesAdmin(): Category[] {
  const rows = db
    .prepare("SELECT id, slug, name, icon, color, sort_order FROM categories ORDER BY sort_order, name")
    .all() as Category[];
  return rows.map(toPlain);
}

export function getSources(): Source[] {
  const rows = db
    .prepare(
      `SELECT id, name, url, kind, category_id AS categoryId, enabled,
              last_run AS lastRun, last_status AS lastStatus, last_error AS lastError,
              last_found AS lastFound, last_new AS lastNew, last_updated AS lastUpdated,
              created_at AS createdAt
       FROM sources ORDER BY name`
    )
    .all() as Source[];
  return rows.map(toPlain);
}

export function getScraperRuns(limit = 20): ScraperRun[] {
  const rows = db
    .prepare(
      `SELECT id, started_at AS startedAt, finished_at AS finishedAt, source_id AS sourceId,
              source_name AS sourceName, events_found AS eventsFound, events_new AS eventsNew,
              events_updated AS eventsUpdated, status, error
       FROM scraper_runs ORDER BY id DESC LIMIT ?`
    )
    .all(limit) as ScraperRun[];
  return rows.map(toPlain);
}

// ---------- Categories ----------

export function createCategory(input: CategoryInput): void {
  db.prepare(
    "INSERT INTO categories (slug, name, icon, color, sort_order) VALUES (?, ?, ?, ?, ?)"
  ).run(input.slug, input.name, input.icon, input.color, input.sort_order);
}

export function updateCategory(id: number, input: Partial<CategoryInput>): void {
  const current = db.prepare("SELECT * FROM categories WHERE id = ?").get(id) as Category | undefined;
  if (!current) return;
  db.prepare(
    "UPDATE categories SET slug = ?, name = ?, icon = ?, color = ?, sort_order = ? WHERE id = ?"
  ).run(
    input.slug ?? current.slug,
    input.name ?? current.name,
    input.icon ?? current.icon,
    input.color ?? current.color,
    input.sort_order ?? current.sort_order,
    id
  );
}

export function deleteCategory(id: number): void {
  db.prepare("DELETE FROM categories WHERE id = ?").run(id);
}

// ---------- Events ----------

export function createEvent(input: EventInput): void {
  db.prepare(
    `INSERT INTO events (slug, title, category_id, start_date, end_date, start_time, end_time, location, address, price, description, image, external_url, featured, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    input.slug,
    input.title,
    input.category_id,
    input.start_date,
    input.end_date,
    input.start_time,
    input.end_time,
    input.location,
    input.address,
    input.price,
    input.description,
    input.image,
    input.external_url,
    input.featured,
    input.status
  );
}

export function updateEvent(id: number, input: Partial<EventInput>): void {
  const current = db.prepare("SELECT * FROM events WHERE id = ?").get(id) as EventItem | undefined;
  if (!current) return;
  db.prepare(
    `UPDATE events SET slug = ?, title = ?, category_id = ?, start_date = ?, end_date = ?, start_time = ?, end_time = ?,
     location = ?, address = ?, price = ?, description = ?, image = ?, external_url = ?, featured = ?, status = ?,
     updated_at = datetime('now') WHERE id = ?`
  ).run(
    input.slug ?? current.slug,
    input.title ?? current.title,
    input.category_id ?? current.categoryId,
    input.start_date ?? current.startDate,
    input.end_date ?? current.endDate,
    input.start_time ?? current.startTime,
    input.end_time ?? current.endTime,
    input.location ?? current.location,
    input.address ?? current.address,
    input.price ?? current.price,
    input.description ?? current.description,
    input.image ?? current.image,
    input.external_url ?? current.externalUrl,
    input.featured ?? current.featured,
    input.status ?? current.status,
    id
  );
}

export function deleteEvent(id: number): void {
  db.prepare("DELETE FROM events WHERE id = ?").run(id);
}

export function toggleEventStatus(id: number): void {
  db.prepare(
    `UPDATE events SET status =
       CASE
         WHEN status = 'published' THEN 'hidden'
         WHEN status = 'pending' THEN 'published'
         ELSE 'published'
       END,
       updated_at = datetime('now') WHERE id = ?`
  ).run(id);
}

export function toggleEventFeatured(id: number): void {
  db.prepare(
    "UPDATE events SET featured = CASE WHEN featured = 1 THEN 0 ELSE 1 END, updated_at = datetime('now') WHERE id = ?"
  ).run(id);
}

export function upsertScrapedEvent(
  event: ScrapeEvent,
  sourceName: string,
  categoryId: number | null
): "new" | "updated" | "skipped" {
  const dedupeKey =
    event.source_url && event.source_url.trim().length > 0
      ? event.source_url.trim()
      : `huescahoy:${slugify(event.title)}:${event.start_date}`;

  const existing = db
    .prepare("SELECT id, title, start_date, image, category_id FROM events WHERE source_url = ?")
    .get(dedupeKey) as
    | { id: number; title: string; start_date: string; image: string | null; category_id: number | null }
    | undefined;

  if (existing) {
    const titleChanged = existing.title !== event.title;
    const dateChanged = existing.start_date !== event.start_date;
    const hasNewImage = Boolean(event.image) && !existing.image;
    const categoryChanged = existing.category_id !== categoryId;
    if (!titleChanged && !dateChanged && !hasNewImage && !categoryChanged) return "skipped";
    db.prepare(
      `UPDATE events SET title = ?, start_date = ?, end_date = ?, start_time = ?, end_time = ?,
       location = ?, address = ?, price = ?, description = ?, image = ?, external_url = ?,
       category_id = COALESCE(?, category_id), source = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(
      event.title,
      event.start_date,
      event.end_date ?? null,
      event.start_time ?? null,
      event.end_time ?? null,
      event.location ?? null,
      event.address ?? null,
      event.price ?? null,
      event.description ?? null,
      event.image ?? null,
      event.external_url ?? null,
      categoryId,
      sourceName,
      existing.id
    );
    return "updated";
  }

  const duplicate = findCrossSourceDuplicate(event);
  if (duplicate) {
    const current = db
      .prepare(
        "SELECT end_date AS endDate, end_time AS endTime, location, address, price, description, image, external_url AS externalUrl, category_id AS categoryId FROM events WHERE id = ?"
      )
      .get(duplicate.id) as {
      endDate: string | null;
      endTime: string | null;
      location: string | null;
      address: string | null;
      price: string | null;
      description: string | null;
      image: string | null;
      externalUrl: string | null;
      categoryId: number | null;
    };

    const gaps: Array<{ column: string; value: string }> = [];
    if (event.end_date && !current.endDate) gaps.push({ column: "end_date", value: event.end_date });
    if (event.end_time && !current.endTime) gaps.push({ column: "end_time", value: event.end_time });
    if (event.location && !current.location) gaps.push({ column: "location", value: event.location });
    if (event.address && !current.address) gaps.push({ column: "address", value: event.address });
    if (event.price && !current.price) gaps.push({ column: "price", value: event.price });
    if (event.description && !current.description) gaps.push({ column: "description", value: event.description });
    if (event.image && !current.image) gaps.push({ column: "image", value: event.image });
    if (event.external_url && !current.externalUrl) gaps.push({ column: "external_url", value: event.external_url });

    const fillCategory = categoryId != null && current.categoryId == null;
    if (gaps.length === 0 && !fillCategory) return "skipped";

    let sets = gaps.map((g) => `${g.column} = ?`).join(", ");
    if (fillCategory) sets += (sets.length > 0 ? ", " : "") + "category_id = ?";
    db.prepare(
      `UPDATE events SET ${sets}, updated_at = datetime('now') WHERE id = ?`
    ).run(
      ...gaps.map((g) => g.value),
      ...(fillCategory ? [categoryId] : []),
      duplicate.id
    );
    return "updated";
  }

  db.prepare(
    `INSERT INTO events (slug, title, category_id, start_date, end_date, start_time, end_time, location, address, price, description, image, external_url, source, source_url, featured, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'published')`
  ).run(
    `${slugify(event.title)}-${crypto.randomBytes(4).toString("hex")}`,
    event.title,
    categoryId,
    event.start_date,
    event.end_date ?? null,
    event.start_time ?? null,
    event.end_time ?? null,
    event.location ?? null,
    event.address ?? null,
    event.price ?? null,
    event.description ?? null,
    event.image ?? null,
    event.external_url ?? null,
    sourceName,
    dedupeKey
  );
  return "new";
}

function findCrossSourceDuplicate(event: ScrapeEvent): { id: number } | undefined {
  const key = normalizedTitle(event.title);
  const candidates = db
    .prepare("SELECT id, title FROM events WHERE start_date = ?")
    .all(event.start_date) as { id: number; title: string }[];
  return candidates.find((candidate) => normalizedTitle(candidate.title) === key);
}

// ---------- Sources ----------

export function createSource(input: SourceInput): void {
  db.prepare(
    "INSERT INTO sources (name, url, kind, category_id, enabled) VALUES (?, ?, ?, ?, ?)"
  ).run(input.name, input.url, input.kind, input.category_id, input.enabled);
}

export function updateSource(id: number, input: Partial<SourceInput>): void {
  const current = db.prepare("SELECT * FROM sources WHERE id = ?").get(id) as Source | undefined;
  if (!current) return;
  db.prepare(
    "UPDATE sources SET name = ?, url = ?, kind = ?, category_id = ?, enabled = ? WHERE id = ?"
  ).run(
    input.name ?? current.name,
    input.url ?? current.url,
    input.kind ?? current.kind,
    input.category_id ?? current.categoryId,
    input.enabled ?? current.enabled,
    id
  );
}

export function deleteSource(id: number): void {
  db.prepare("DELETE FROM sources WHERE id = ?").run(id);
}

export function toggleSource(id: number): void {
  db.prepare(
    "UPDATE sources SET enabled = CASE WHEN enabled = 1 THEN 0 ELSE 1 END WHERE id = ?"
  ).run(id);
}

export function markSourceResult(
  id: number,
  result: { status: "ok" | "error"; found: number; created: number; updated: number; error?: string }
): void {
  db.prepare(
    `UPDATE sources SET last_run = datetime('now'), last_status = ?, last_found = ?, last_new = ?, last_updated = ?, last_error = ? WHERE id = ?`
  ).run(
    result.status,
    result.found,
    result.created,
    result.updated,
    result.error ?? null,
    id
  );
}

export function recordScraperRun(
  run: {
    sourceId: number | null;
    sourceName: string | null;
    found: number;
    created: number;
    updated: number;
    status: "ok" | "error";
    error?: string;
  }
): void {
  db.prepare(
    `INSERT INTO scraper_runs (source_id, source_name, events_found, events_new, events_updated, status, error, finished_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`
  ).run(
    run.sourceId,
    run.sourceName,
    run.found,
    run.created,
    run.updated,
    run.status,
    run.error ?? null
  );
}

// ---------- Sessions ----------

export function createSession(token: string): void {
  db.prepare("INSERT INTO sessions (token) VALUES (?)").run(token);
}

export function deleteSession(token: string): void {
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

export function sessionExists(token: string): boolean {
  const row = db.prepare("SELECT token FROM sessions WHERE token = ?").get(token) as { token: string } | undefined;
  return row !== undefined;
}

// ---------- Suggestions ----------

export function getSuggestions(limit = 100): Suggestion[] {
  const rows = db
    .prepare(
      `SELECT id, kind, title, detail, contact, status, created_at AS createdAt
       FROM suggestions
       ORDER BY CASE status WHEN 'nuevo' THEN 0 WHEN 'visto' THEN 1 ELSE 2 END, id DESC
       LIMIT ?`
    )
    .all(limit) as Suggestion[];
  return rows.map(toPlain);
}

export function getSuggestionCounts(): { total: number; pending: number } {
  const total = db
    .prepare("SELECT COUNT(*) AS total FROM suggestions")
    .get() as { total: number };
  const pending = db
    .prepare("SELECT COUNT(*) AS total FROM suggestions WHERE status = 'nuevo'")
    .get() as { total: number };
  return { total: total.total, pending: pending.total };
}

export function createSuggestion(input: SuggestionInput): void {
  db.prepare(
    "INSERT INTO suggestions (kind, title, detail, contact) VALUES (?, ?, ?, ?)"
  ).run(input.kind, input.title, input.detail ?? null, input.contact ?? null);
}

export function setSuggestionStatus(id: number, status: SuggestionStatus): void {
  db.prepare("UPDATE suggestions SET status = ? WHERE id = ?").run(status, id);
}

export function deleteSuggestion(id: number): void {
  db.prepare("DELETE FROM suggestions WHERE id = ?").run(id);
}

export function recentSuggestionCount(): number {
  const row = db
    .prepare(
      "SELECT COUNT(*) AS total FROM suggestions WHERE created_at >= datetime('now', '-10 minutes')"
    )
    .get() as { total: number };
  return row.total;
}

export function recentPendingEventCount(): number {
  const row = db
    .prepare(
      "SELECT COUNT(*) AS total FROM events WHERE status = 'pending' AND created_at >= datetime('now', '-15 minutes')"
    )
    .get() as { total: number };
  return row.total;
}

export function isSuggestionKind(value: string): value is SuggestionKind {
  return value === "problema" || value === "mejora" || value === "idea";
}

// ---------- Planes ----------

const PLAN_COLUMNS =
  "id, slug, title, summary, body, image, published, sort_order AS sortOrder, created_at AS createdAt, updated_at AS updatedAt";

export function getPlans(includeHidden = false): Plan[] {
  const rows = includeHidden
    ? (db
        .prepare(
          `SELECT ${PLAN_COLUMNS} FROM planes ORDER BY sort_order, id DESC`
        )
        .all() as Plan[])
    : (db
        .prepare(
          `SELECT ${PLAN_COLUMNS} FROM planes WHERE published = 1 ORDER BY sort_order, id DESC`
        )
        .all() as Plan[]);
  return rows.map(toPlain);
}

export function getPlanBySlug(slug: string): Plan | null {
  const row = db
    .prepare(`SELECT ${PLAN_COLUMNS} FROM planes WHERE slug = ?`)
    .get(slug);
  return row ? toPlain(row as Plan) : null;
}

export function getPlanById(id: number): Plan | null {
  const row = db.prepare(`SELECT ${PLAN_COLUMNS} FROM planes WHERE id = ?`).get(id);
  return row ? toPlain(row as Plan) : null;
}

export function createPlan(input: PlanInput): void {
  db.prepare(
    `INSERT INTO planes (slug, title, summary, body, image, published, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    input.slug,
    input.title,
    input.summary,
    input.body,
    input.image,
    input.published,
    input.sort_order
  );
}

export function updatePlan(id: number, input: Partial<PlanInput>): void {
  const current = db.prepare("SELECT * FROM planes WHERE id = ?").get(id) as Plan | undefined;
  if (!current) return;
  db.prepare(
    `UPDATE planes SET slug = ?, title = ?, summary = ?, body = ?, image = ?, published = ?, sort_order = ?,
     updated_at = datetime('now') WHERE id = ?`
  ).run(
    input.slug ?? current.slug,
    input.title ?? current.title,
    input.summary ?? current.summary,
    input.body ?? current.body,
    input.image ?? current.image,
    input.published ?? current.published,
    input.sort_order ?? current.sortOrder,
    id
  );
}

export function deletePlan(id: number): void {
  db.prepare("DELETE FROM planes WHERE id = ?").run(id);
}

export function togglePlanPublished(id: number): void {
  db.prepare(
    "UPDATE planes SET published = CASE WHEN published = 1 THEN 0 ELSE 1 END, updated_at = datetime('now') WHERE id = ?"
  ).run(id);
}
