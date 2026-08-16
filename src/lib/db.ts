import { Pool } from "pg";
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

const NOW_SQL = "to_char(now(), 'YYYY-MM-DD HH24:MI:SS')";

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'calendar',
    color TEXT NOT NULL DEFAULT '#e8452c',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
  );

  CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
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
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    created_at TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS'),
    updated_at TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
  );

  CREATE TABLE IF NOT EXISTS sources (
    id SERIAL PRIMARY KEY,
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
    created_at TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
  );

  CREATE TABLE IF NOT EXISTS scraper_runs (
    id SERIAL PRIMARY KEY,
    started_at TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS'),
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
    created_at TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
  );

  CREATE TABLE IF NOT EXISTS suggestions (
    id SERIAL PRIMARY KEY,
    kind TEXT NOT NULL DEFAULT 'mejora',
    title TEXT NOT NULL,
    detail TEXT,
    contact TEXT,
    status TEXT NOT NULL DEFAULT 'nuevo',
    created_at TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
  );

  CREATE TABLE IF NOT EXISTS planes (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    summary TEXT,
    body TEXT NOT NULL,
    image TEXT,
    published INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS'),
    updated_at TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
  );

  CREATE TABLE IF NOT EXISTS geocodes (
    location TEXT PRIMARY KEY,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    not_found INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
  );

  CREATE TABLE IF NOT EXISTS push_subscriptions (
    id SERIAL PRIMARY KEY,
    endpoint TEXT NOT NULL UNIQUE,
    keys_p256dh TEXT NOT NULL,
    keys_auth TEXT NOT NULL,
    user_agent TEXT,
    created_at TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
  );

  CREATE TABLE IF NOT EXISTS push_meta (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_events_start ON events(start_date);
  CREATE INDEX IF NOT EXISTS idx_events_category ON events(category_id);
  CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
  CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);
  CREATE INDEX IF NOT EXISTS idx_planes_published ON planes(published);
`;

let pool: Pool | null = null;
let ready: Promise<void> | null = null;

function getPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL no está configurada en el entorno");
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      connectionTimeoutMillis: 5000,
      query_timeout: 15000,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

async function init(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await getPool().query(SCHEMA_SQL);
      await seedIfEmpty();
    })();
  }
  return ready;
}

function toPlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
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

async function seedIfEmpty(): Promise<void> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const row = await client.query("SELECT COUNT(*)::int AS total FROM categories");
    if (Number(row.rows[0].total) > 0) {
      await client.query("COMMIT");
      return;
    }

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
      await client.query(
        "INSERT INTO categories (slug, name, icon, color, sort_order) VALUES ($1, $2, $3, $4, $5)",
        [slug, name, icon, color, i + 1]
      );
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
      await client.query(
        `INSERT INTO planes (slug, title, summary, body, image, published, sort_order)
         VALUES ($1, $2, $3, $4, NULL, 1, $5)`,
        [slugify(p.title), p.title, p.summary, p.body, p.order]
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // ignora errores de rollback, mantén el error original
    }
    throw err;
  } finally {
    client.release();
  }
}

// ---------- Row helpers ----------

const EVENT_COLUMNS =
  "id, slug, title, category_id AS \"categoryId\", start_date AS \"startDate\", end_date AS \"endDate\", start_time AS \"startTime\", end_time AS \"endTime\", location, address, price, description, image, external_url AS \"externalUrl\", source, source_url AS \"sourceUrl\", featured, status, lat, lng, created_at AS \"createdAt\", updated_at AS \"updatedAt\"";

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

export async function getEvents(filter: EventFilter = {}): Promise<EventItem[]> {
  await init();
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (!filter.includeHidden) {
    conditions.push("e.status = 'published'");
  }
  if (filter.category) {
    conditions.push(`c.slug = $${params.length + 1}`);
    params.push(filter.category);
  }
  if (filter.featured) {
    conditions.push("e.featured = 1");
  }
  if (filter.upcoming) {
    conditions.push(
      `(e.start_date >= $${params.length + 1} OR (e.end_date IS NOT NULL AND e.end_date >= $${params.length + 1}))`
    );
    params.push(todayStr());
  }
  if (filter.from) {
    conditions.push(
      `(e.end_date IS NOT NULL AND e.end_date >= $${params.length + 1}) OR e.end_date IS NULL AND e.start_date >= $${params.length + 1}`
    );
    params.push(filter.from);
  }
  if (filter.to) {
    conditions.push(`e.start_date <= $${params.length + 1}`);
    params.push(filter.to);
  }
  if (filter.q) {
    conditions.push(
      `(e.title LIKE $${params.length + 1} OR e.description LIKE $${params.length + 2} OR e.location LIKE $${params.length + 3})`
    );
    params.push(`%${filter.q}%`, `%${filter.q}%`, `%${filter.q}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  let sql = `SELECT e.${EVENT_COLUMNS.replace(/, /g, ", e.")} FROM events e LEFT JOIN categories c ON c.id = e.category_id ${where} ORDER BY e.start_date ASC, e.start_time ASC`;
  if (filter.limit) {
    const limit = Math.max(1, Math.min(filter.limit, 200));
    params.push(limit);
    sql += ` LIMIT $${params.length}`;
  }

  const res = await getPool().query(sql, params);
  return (res.rows as EventItem[]).map(rowToEvent);
}

export async function getEventBySlug(slug: string): Promise<EventItem | null> {
  await init();
  const res = await getPool().query(`SELECT ${EVENT_COLUMNS} FROM events WHERE slug = $1`, [slug]);
  return res.rows.length ? rowToEvent(res.rows[0]) : null;
}

export async function getEventById(id: number): Promise<EventItem | null> {
  await init();
  const res = await getPool().query(`SELECT ${EVENT_COLUMNS} FROM events WHERE id = $1`, [id]);
  return res.rows.length ? rowToEvent(res.rows[0]) : null;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  await init();
  const res = await getPool().query("SELECT * FROM categories WHERE slug = $1", [slug]);
  return res.rows.length ? toPlain(res.rows[0] as Category) : null;
}

export async function getCategoryById(id: number): Promise<Category | null> {
  await init();
  const res = await getPool().query("SELECT * FROM categories WHERE id = $1", [id]);
  return res.rows.length ? toPlain(res.rows[0] as Category) : null;
}

export async function getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  await init();
  const res = await getPool().query(
    `SELECT c.id, c.slug, c.name, c.icon, c.color, c.sort_order, COUNT(e.id)::int AS event_count
     FROM categories c
     LEFT JOIN events e ON e.category_id = c.id AND e.status = 'published' AND (e.start_date >= $1 OR (e.end_date IS NOT NULL AND e.end_date >= $1))
     GROUP BY c.id
     ORDER BY c.sort_order, c.name`,
    [todayStr()]
  );
  return (res.rows as CategoryWithCount[]).map(toPlain);
}

export async function getFeaturedEvents(limit = 3): Promise<EventItem[]> {
  return getEvents({ featured: true, upcoming: true, limit });
}

export async function getUpcomingEvents(limit = 6): Promise<EventItem[]> {
  return getEvents({ upcoming: true, limit });
}

export async function getStats() {
  await init();
  const published = await getPool().query(
    `SELECT COUNT(*)::int AS total FROM events WHERE status = 'published' AND (start_date >= $1 OR (end_date IS NOT NULL AND end_date >= $1))`,
    [todayStr()]
  );
  const upcoming = await getPool().query(
    `SELECT COUNT(*)::int AS total FROM events WHERE status = 'published' AND start_date BETWEEN $1 AND $2`,
    [todayStr(), todayStr(7)]
  );
  const categories = await getPool().query(`SELECT COUNT(*)::int AS total FROM categories`);
  const sources = await getPool().query(
    `SELECT COUNT(*)::int AS total FROM sources WHERE enabled = 1`
  );
  return {
    upcoming: published.rows[0].total,
    week: upcoming.rows[0].total,
    categories: categories.rows[0].total,
    sources: sources.rows[0].total,
  };
}

// ---------- Admin queries ----------

export async function getCategoriesAdmin(): Promise<Category[]> {
  await init();
  const res = await getPool().query(
    "SELECT id, slug, name, icon, color, sort_order FROM categories ORDER BY sort_order, name"
  );
  return (res.rows as Category[]).map(toPlain);
}

export async function getSources(): Promise<Source[]> {
  await init();
  const res = await getPool().query(
    `SELECT id, name, url, kind, category_id AS "categoryId", enabled,
            last_run AS "lastRun", last_status AS "lastStatus", last_error AS "lastError",
            last_found AS "lastFound", last_new AS "lastNew", last_updated AS "lastUpdated",
            created_at AS "createdAt"
     FROM sources ORDER BY name`
  );
  return (res.rows as Source[]).map(toPlain);
}

export async function getScraperRuns(limit = 20): Promise<ScraperRun[]> {
  await init();
  const res = await getPool().query(
    `SELECT id, started_at AS "startedAt", finished_at AS "finishedAt", source_id AS "sourceId",
            source_name AS "sourceName", events_found AS "eventsFound", events_new AS "eventsNew",
            events_updated AS "eventsUpdated", status, error
     FROM scraper_runs ORDER BY id DESC LIMIT $1`,
    [limit]
  );
  return (res.rows as ScraperRun[]).map(toPlain);
}

// ---------- Categories ----------

export async function createCategory(input: CategoryInput): Promise<void> {
  await init();
  await getPool().query(
    "INSERT INTO categories (slug, name, icon, color, sort_order) VALUES ($1, $2, $3, $4, $5)",
    [input.slug, input.name, input.icon, input.color, input.sort_order]
  );
}

export async function updateCategory(id: number, input: Partial<CategoryInput>): Promise<void> {
  await init();
  const current = await getCategoryById(id);
  if (!current) return;
  await getPool().query(
    "UPDATE categories SET slug = $1, name = $2, icon = $3, color = $4, sort_order = $5 WHERE id = $6",
    [
      input.slug ?? current.slug,
      input.name ?? current.name,
      input.icon ?? current.icon,
      input.color ?? current.color,
      input.sort_order ?? current.sort_order,
      id,
    ]
  );
}

export async function deleteCategory(id: number): Promise<void> {
  await init();
  await getPool().query("DELETE FROM categories WHERE id = $1", [id]);
}

// ---------- Events ----------

export async function createEvent(input: EventInput): Promise<void> {
  await init();
  await getPool().query(
    `INSERT INTO events (slug, title, category_id, start_date, end_date, start_time, end_time, location, address, price, description, image, external_url, featured, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
    [
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
      input.status,
    ]
  );
}

export async function updateEvent(id: number, input: Partial<EventInput>): Promise<void> {
  await init();
  const current = await getEventById(id);
  if (!current) return;
  await getPool().query(
    `UPDATE events SET slug = $1, title = $2, category_id = $3, start_date = $4, end_date = $5, start_time = $6, end_time = $7,
     location = $8, address = $9, price = $10, description = $11, image = $12, external_url = $13, featured = $14, status = $15,
     updated_at = ${NOW_SQL} WHERE id = $16`,
    [
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
      id,
    ]
  );
}

export async function deleteEvent(id: number): Promise<void> {
  await init();
  await getPool().query("DELETE FROM events WHERE id = $1", [id]);
}

export async function toggleEventStatus(id: number): Promise<void> {
  await init();
  await getPool().query(
    `UPDATE events SET status =
       CASE
         WHEN status = 'published' THEN 'hidden'
         WHEN status = 'pending' THEN 'published'
         ELSE 'published'
       END,
       updated_at = ${NOW_SQL} WHERE id = $1`,
    [id]
  );
}

export async function toggleEventFeatured(id: number): Promise<void> {
  await init();
  await getPool().query(
    `UPDATE events SET featured = CASE WHEN featured = 1 THEN 0 ELSE 1 END, updated_at = ${NOW_SQL} WHERE id = $1`,
    [id]
  );
}

export async function upsertScrapedEvent(
  event: ScrapeEvent,
  sourceName: string,
  categoryId: number | null
): Promise<"new" | "updated" | "skipped"> {
  await init();
  const dedupeKey =
    event.source_url && event.source_url.trim().length > 0
      ? event.source_url.trim()
      : `huescahoy:${slugify(event.title)}:${event.start_date}`;

  const existing = (
    await getPool().query(
      "SELECT id, title, start_date, image, category_id FROM events WHERE source_url = $1",
      [dedupeKey]
    )
  ).rows[0] as
    | { id: number; title: string; start_date: string; image: string | null; category_id: number | null }
    | undefined;

  if (existing) {
    const titleChanged = existing.title !== event.title;
    const dateChanged = existing.start_date !== event.start_date;
    const hasNewImage = Boolean(event.image) && !existing.image;
    const categoryChanged = existing.category_id !== categoryId;
    if (!titleChanged && !dateChanged && !hasNewImage && !categoryChanged) return "skipped";
    await getPool().query(
      `UPDATE events SET title = $1, start_date = $2, end_date = $3, start_time = $4, end_time = $5,
       location = $6, address = $7, price = $8, description = $9, image = $10, external_url = $11,
       category_id = COALESCE($12, category_id), source = $13, updated_at = ${NOW_SQL} WHERE id = $14`,
      [
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
        existing.id,
      ]
    );
    return "updated";
  }

  const duplicate = await findCrossSourceDuplicate(event);
  if (duplicate) {
    const current = (
      await getPool().query(
        "SELECT end_date AS \"endDate\", end_time AS \"endTime\", location, address, price, description, image, external_url AS \"externalUrl\", category_id AS \"categoryId\" FROM events WHERE id = $1",
        [duplicate.id]
      )
    ).rows[0] as {
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

    const sets = gaps.map((_, i) => `${gaps[i].column} = $${i + 1}`).join(", ");
    const params: (string | number | null)[] = gaps.map((g) => g.value);
    let sql = `UPDATE events SET ${sets}${sets.length > 0 && fillCategory ? ", " : ""}`;
    if (fillCategory) {
      params.push(categoryId);
      sql += `category_id = $${params.length}`;
    }
    params.push(duplicate.id);
    sql += `, updated_at = ${NOW_SQL} WHERE id = $${params.length}`;
    await getPool().query(sql, params);
    return "updated";
  }

  await getPool().query(
    `INSERT INTO events (slug, title, category_id, start_date, end_date, start_time, end_time, location, address, price, description, image, external_url, source, source_url, featured, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 0, 'published')`,
    [
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
      dedupeKey,
    ]
  );
  return "new";
}

async function findCrossSourceDuplicate(event: ScrapeEvent): Promise<{ id: number } | undefined> {
  const key = normalizedTitle(event.title);
  const res = await getPool().query(
    "SELECT id, title FROM events WHERE start_date = $1",
    [event.start_date]
  );
  const candidates = res.rows as { id: number; title: string }[];
  return candidates.find((candidate) => normalizedTitle(candidate.title) === key);
}

// ---------- Sources ----------

export async function createSource(input: SourceInput): Promise<void> {
  await init();
  await getPool().query(
    "INSERT INTO sources (name, url, kind, category_id, enabled) VALUES ($1, $2, $3, $4, $5)",
    [input.name, input.url, input.kind, input.category_id, input.enabled]
  );
}

export async function updateSource(id: number, input: Partial<SourceInput>): Promise<void> {
  await init();
  const current = (
    await getPool().query("SELECT * FROM sources WHERE id = $1", [id])
  ).rows[0] as Source | undefined;
  if (!current) return;
  await getPool().query(
    "UPDATE sources SET name = $1, url = $2, kind = $3, category_id = $4, enabled = $5 WHERE id = $6",
    [
      input.name ?? current.name,
      input.url ?? current.url,
      input.kind ?? current.kind,
      input.category_id ?? current.categoryId,
      input.enabled ?? current.enabled,
      id,
    ]
  );
}

export async function deleteSource(id: number): Promise<void> {
  await init();
  await getPool().query("DELETE FROM sources WHERE id = $1", [id]);
}

export async function toggleSource(id: number): Promise<void> {
  await init();
  await getPool().query(
    "UPDATE sources SET enabled = CASE WHEN enabled = 1 THEN 0 ELSE 1 END WHERE id = $1",
    [id]
  );
}

export async function markSourceResult(
  id: number,
  result: { status: "ok" | "error"; found: number; created: number; updated: number; error?: string }
): Promise<void> {
  await init();
  await getPool().query(
    `UPDATE sources SET last_run = ${NOW_SQL}, last_status = $1, last_found = $2, last_new = $3, last_updated = $4, last_error = $5 WHERE id = $6`,
    [
      result.status,
      result.found,
      result.created,
      result.updated,
      result.error ?? null,
      id,
    ]
  );
}

export async function recordScraperRun(
  run: {
    sourceId: number | null;
    sourceName: string | null;
    found: number;
    created: number;
    updated: number;
    status: "ok" | "error";
    error?: string;
  }
): Promise<void> {
  await init();
  await getPool().query(
    `INSERT INTO scraper_runs (source_id, source_name, events_found, events_new, events_updated, status, error, finished_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, ${NOW_SQL})`,
    [
      run.sourceId,
      run.sourceName,
      run.found,
      run.created,
      run.updated,
      run.status,
      run.error ?? null,
    ]
  );
}

// ---------- Sessions ----------

export async function createSession(token: string): Promise<void> {
  await init();
  await getPool().query("INSERT INTO sessions (token) VALUES ($1)", [token]);
}

export async function deleteSession(token: string): Promise<void> {
  await init();
  await getPool().query("DELETE FROM sessions WHERE token = $1", [token]);
}

export async function sessionExists(token: string): Promise<boolean> {
  await init();
  const res = await getPool().query("SELECT token FROM sessions WHERE token = $1", [token]);
  return res.rows.length > 0;
}

// ---------- Suggestions ----------

export async function getSuggestions(limit = 100): Promise<Suggestion[]> {
  await init();
  const res = await getPool().query(
    `SELECT id, kind, title, detail, contact, status, created_at AS "createdAt"
     FROM suggestions
     ORDER BY CASE status WHEN 'nuevo' THEN 0 WHEN 'visto' THEN 1 ELSE 2 END, id DESC
     LIMIT $1`,
    [limit]
  );
  return (res.rows as Suggestion[]).map(toPlain);
}

export async function getSuggestionCounts(): Promise<{ total: number; pending: number }> {
  await init();
  const total = await getPool().query("SELECT COUNT(*)::int AS total FROM suggestions");
  const pending = await getPool().query(
    "SELECT COUNT(*)::int AS total FROM suggestions WHERE status = 'nuevo'"
  );
  return { total: total.rows[0].total, pending: pending.rows[0].total };
}

export async function createSuggestion(input: SuggestionInput): Promise<void> {
  await init();
  await getPool().query(
    "INSERT INTO suggestions (kind, title, detail, contact) VALUES ($1, $2, $3, $4)",
    [input.kind, input.title, input.detail ?? null, input.contact ?? null]
  );
}

export async function setSuggestionStatus(id: number, status: SuggestionStatus): Promise<void> {
  await init();
  await getPool().query("UPDATE suggestions SET status = $1 WHERE id = $2", [status, id]);
}

export async function deleteSuggestion(id: number): Promise<void> {
  await init();
  await getPool().query("DELETE FROM suggestions WHERE id = $1", [id]);
}

export async function recentSuggestionCount(): Promise<number> {
  await init();
  const res = await getPool().query(
    `SELECT COUNT(*)::int AS total FROM suggestions WHERE created_at >= to_char(now() - interval '10 minutes', 'YYYY-MM-DD HH24:MI:SS')`
  );
  return res.rows[0].total;
}

export async function recentPendingEventCount(): Promise<number> {
  await init();
  const res = await getPool().query(
    `SELECT COUNT(*)::int AS total FROM events WHERE status = 'pending' AND created_at >= to_char(now() - interval '15 minutes', 'YYYY-MM-DD HH24:MI:SS')`
  );
  return res.rows[0].total;
}

export function isSuggestionKind(value: string): value is SuggestionKind {
  return value === "problema" || value === "mejora" || value === "idea";
}

// ---------- Planes ----------

const PLAN_COLUMNS =
  "id, slug, title, summary, body, image, published, sort_order AS \"sortOrder\", created_at AS \"createdAt\", updated_at AS \"updatedAt\"";

export async function getPlans(includeHidden = false): Promise<Plan[]> {
  await init();
  const res = includeHidden
    ? await getPool().query(`SELECT ${PLAN_COLUMNS} FROM planes ORDER BY sort_order, id DESC`)
    : await getPool().query(
        `SELECT ${PLAN_COLUMNS} FROM planes WHERE published = 1 ORDER BY sort_order, id DESC`
      );
  return (res.rows as Plan[]).map(toPlain);
}

export async function getPlanBySlug(slug: string): Promise<Plan | null> {
  await init();
  const res = await getPool().query(`SELECT ${PLAN_COLUMNS} FROM planes WHERE slug = $1`, [slug]);
  return res.rows.length ? toPlain(res.rows[0] as Plan) : null;
}

export async function getPlanById(id: number): Promise<Plan | null> {
  await init();
  const res = await getPool().query(`SELECT ${PLAN_COLUMNS} FROM planes WHERE id = $1`, [id]);
  return res.rows.length ? toPlain(res.rows[0] as Plan) : null;
}

export async function createPlan(input: PlanInput): Promise<void> {
  await init();
  await getPool().query(
    `INSERT INTO planes (slug, title, summary, body, image, published, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      input.slug,
      input.title,
      input.summary,
      input.body,
      input.image,
      input.published,
      input.sort_order,
    ]
  );
}

export async function updatePlan(id: number, input: Partial<PlanInput>): Promise<void> {
  await init();
  const current = (
    await getPool().query(`SELECT ${PLAN_COLUMNS} FROM planes WHERE id = $1`, [id])
  ).rows[0] as Plan | undefined;
  if (!current) return;
  await getPool().query(
    `UPDATE planes SET slug = $1, title = $2, summary = $3, body = $4, image = $5, published = $6, sort_order = $7,
     updated_at = ${NOW_SQL} WHERE id = $8`,
    [
      input.slug ?? current.slug,
      input.title ?? current.title,
      input.summary ?? current.summary,
      input.body ?? current.body,
      input.image ?? current.image,
      input.published ?? current.published,
      input.sort_order ?? current.sortOrder,
      id,
    ]
  );
}

export async function deletePlan(id: number): Promise<void> {
  await init();
  await getPool().query("DELETE FROM planes WHERE id = $1", [id]);
}

export async function togglePlanPublished(id: number): Promise<void> {
  await init();
  await getPool().query(
    `UPDATE planes SET published = CASE WHEN published = 1 THEN 0 ELSE 1 END, updated_at = ${NOW_SQL} WHERE id = $1`,
    [id]
  );
}

// ---------- Geocode ----------

export async function getGeocodeCache(location: string): Promise<GeocodeResult | null> {
  await init();
  const res = await getPool().query(
    "SELECT lat, lng, not_found AS \"notFound\" FROM geocodes WHERE location = $1",
    [location]
  );
  const row = res.rows[0] as { lat: number | null; lng: number | null; notFound: number } | undefined;
  if (!row) return null;
  if (row.notFound === 1 || row.lat == null || row.lng == null) {
    return { lat: 0, lng: 0, notFound: true };
  }
  return { lat: row.lat, lng: row.lng, notFound: false };
}

export async function setGeocodeCache(
  location: string,
  lat: number | null,
  lng: number | null
): Promise<void> {
  await init();
  await getPool().query(
    `INSERT INTO geocodes (location, lat, lng, not_found, updated_at) VALUES ($1, $2, $3, $4, ${NOW_SQL})
     ON CONFLICT(location) DO UPDATE SET lat = EXCLUDED.lat, lng = EXCLUDED.lng,
       not_found = EXCLUDED.not_found, updated_at = ${NOW_SQL}`,
    [location, lat, lng, lat == null || lng == null ? 1 : 0]
  );
}

// ---------- Push subscriptions ----------

export type PushSubscriptionRow = {
  id: number;
  endpoint: string;
  keysP256dh: string;
  keysAuth: string;
  userAgent: string | null;
  createdAt: string;
};

export async function upsertPushSubscription(input: {
  endpoint: string;
  keysP256dh: string;
  keysAuth: string;
  userAgent: string | null;
}): Promise<void> {
  await init();
  await getPool().query(
    `INSERT INTO push_subscriptions (endpoint, keys_p256dh, keys_auth, user_agent)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT(endpoint) DO UPDATE SET keys_p256dh = EXCLUDED.keys_p256dh,
       keys_auth = EXCLUDED.keys_auth, user_agent = EXCLUDED.user_agent`,
    [input.endpoint, input.keysP256dh, input.keysAuth, input.userAgent]
  );
}

export async function deletePushSubscriptionByEndpoint(endpoint: string): Promise<void> {
  await init();
  await getPool().query("DELETE FROM push_subscriptions WHERE endpoint = $1", [endpoint]);
}

export async function getPushSubscriptions(): Promise<PushSubscriptionRow[]> {
  await init();
  const res = await getPool().query(
    `SELECT id, endpoint, keys_p256dh AS "keysP256dh", keys_auth AS "keysAuth",
       user_agent AS "userAgent", created_at AS "createdAt"
     FROM push_subscriptions ORDER BY id DESC`
  );
  return res.rows as PushSubscriptionRow[];
}

export async function countPushSubscriptions(): Promise<number> {
  await init();
  const res = await getPool().query("SELECT COUNT(*)::int AS total FROM push_subscriptions");
  return res.rows[0].total as number;
}

export async function getPushMeta(key: string): Promise<string | null> {
  await init();
  const res = await getPool().query("SELECT value FROM push_meta WHERE key = $1", [key]);
  return (res.rows[0]?.value as string | undefined) ?? null;
}

export async function setPushMeta(key: string, value: string): Promise<void> {
  await init();
  await getPool().query(
    `INSERT INTO push_meta (key, value) VALUES ($1, $2)
     ON CONFLICT(key) DO UPDATE SET value = EXCLUDED.value`,
    [key, value]
  );
}
