import { Pool } from "pg";
import crypto from "node:crypto";
import { isEventPast } from "./event-jsonld";
import type {
  Category,
  CategoryInput,
  CategoryWithCount,
  EventInput,
  EventItem,
  FeaturedPick,
  FeaturedPickInput,
  Plan,
  PlanInput,
  RestaurantFilter,
  RestaurantInput,
  RestaurantItem,
  RouteFilter,
  RouteInput,
  RouteItem,
  RouteStage,
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
    source TEXT NOT NULL DEFAULT 'manual',
    source_url TEXT UNIQUE,
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
    categories TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
  );
  ALTER TABLE planes ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual';
  ALTER TABLE planes ADD COLUMN IF NOT EXISTS source_url TEXT;

  ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS categories TEXT NOT NULL DEFAULT '[]';

  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
  );

  CREATE TABLE IF NOT EXISTS push_meta (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS featured_picks (
    id SERIAL PRIMARY KEY,
    label TEXT NOT NULL DEFAULT 'El plan del finde',
    title TEXT NOT NULL,
    tagline TEXT,
    reason TEXT,
    link_type TEXT NOT NULL DEFAULT 'evento' CHECK (link_type IN ('evento', 'plan')),
    target_slug TEXT NOT NULL,
    image_url TEXT,
    active INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS'),
    updated_at TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
  );

  CREATE INDEX IF NOT EXISTS idx_events_start ON events(start_date);
  CREATE INDEX IF NOT EXISTS idx_events_category ON events(category_id);
  CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
  CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);
  CREATE INDEX IF NOT EXISTS idx_planes_published ON planes(published);

  CREATE TABLE IF NOT EXISTS restaurants (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    cuisine_type TEXT,
    price_range TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    image TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    rating DOUBLE PRECISION,
    source TEXT NOT NULL DEFAULT 'manual',
    source_url TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'published',
    created_at TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS'),
    updated_at TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
  );

  CREATE TABLE IF NOT EXISTS routes (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    summary TEXT,
    image TEXT,
    distance_km REAL,
    elevation_m INTEGER,
    difficulty TEXT,
    route_type TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    external_url TEXT,
    gpx_url TEXT,
    stages_count INTEGER NOT NULL DEFAULT 0,
    source TEXT NOT NULL DEFAULT 'manual',
    source_url TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'published',
    created_at TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS'),
    updated_at TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD HH24:MI:SS')
  );

  CREATE TABLE IF NOT EXISTS route_stages (
    id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(id) ON DELETE CASCADE,
    stage_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    distance_km REAL,
    elevation_gain INTEGER,
    elevation_loss INTEGER,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS rate_limits (
    key VARCHAR(255) NOT NULL,
    window_start BIGINT NOT NULL,
    count INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (key, window_start)
  );

  CREATE INDEX IF NOT EXISTS idx_restaurants_source ON restaurants(source);
  CREATE INDEX IF NOT EXISTS idx_restaurants_status ON restaurants(status);
  CREATE INDEX IF NOT EXISTS idx_routes_source ON routes(source);
  CREATE INDEX IF NOT EXISTS idx_routes_status ON routes(status);
  CREATE INDEX IF NOT EXISTS idx_routes_type ON routes(route_type);
  CREATE INDEX IF NOT EXISTS idx_route_stages_route ON route_stages(route_id);
`;

let pool: Pool | null = null;
let ready: Promise<void> | null = null;

export function getPool(): Pool {
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
      try {
        await getPool().query(SCHEMA_SQL);
        await seedIfEmpty();
        await seedDefaultSources();
      } catch (err) {
        ready = null;
        throw err;
      }
    })();
  }
  return ready;
}

export function initAppDb(): Promise<void> {
  return init();
}

function toPlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const SITE_TIME_ZONE = "Europe/Madrid";

export function todayStr(offsetDays = 0): string {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: SITE_TIME_ZONE }));
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

const DEFAULT_SOURCES: SourceInput[] = [
  {
    name: "Restaurantes y cafeterías de Aragón (Open Data)",
    url: "https://opendata.aragon.es/aod/api/3/action/package_show?id=cafeterias-y-restaurantes-en-la-comunidad-autonoma-de-aragon",
    kind: "opendata-restaurants",
    category_id: null,
    enabled: 1,
  },
  {
    name: "Rutas y actividades de la Diputación de Huesca",
    url: "https://datosabiertos.dphuesca.es/dataset/a82f0a3b-53d3-4b79-a9f1-49de958e4955",
    kind: "dph-planes",
    category_id: null,
    enabled: 1,
  },
  {
    name: "Agenda Huesca (Instagram)",
    url: "https://www.instagram.com/stories/highlights/18353343727241524/?hl=es",
    kind: "instagram",
    category_id: null,
    enabled: 1,
  },
];

async function seedDefaultSources(): Promise<void> {
  for (const input of DEFAULT_SOURCES) {
    const existing = await getPool().query(
      "SELECT id FROM sources WHERE kind = $1 LIMIT 1",
      [input.kind]
    );
    if ((existing.rowCount ?? 0) > 0) continue;
    await getPool().query(
      "INSERT INTO sources (name, url, kind, category_id, enabled) VALUES ($1, $2, $3, $4, $5)",
      [input.name, input.url, input.kind, input.category_id, input.enabled]
    );
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
  ongoing?: boolean;
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
  if (filter.ongoing) {
    conditions.push(
      `(e.start_date < $${params.length + 1} AND e.end_date IS NOT NULL AND e.end_date >= $${params.length + 1})`
    );
    params.push(todayStr());
  }
  if (filter.from) {
    conditions.push(
      `((e.end_date IS NOT NULL AND e.end_date >= $${params.length + 1}) OR (e.end_date IS NULL AND e.start_date >= $${params.length + 1}))`
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
  const ongoingLast = Boolean(filter.upcoming || filter.from);
  let sql = `SELECT e.${EVENT_COLUMNS.replace(/, /g, ", e.")} FROM events e LEFT JOIN categories c ON c.id = e.category_id ${where} ORDER BY ${
    ongoingLast ? `(CASE WHEN e.start_date < $${params.length + 1} THEN 1 ELSE 0 END), ` : ""
  }e.start_date ASC, e.start_time ASC`;
  if (ongoingLast) {
    params.push(todayStr());
  }
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
  const restaurants = await getPool().query(
    `SELECT COUNT(*)::int AS total FROM restaurants WHERE status = 'published'`
  );
  const routes = await getPool().query(
    `SELECT COUNT(*)::int AS total FROM routes WHERE status = 'published'`
  );
  return {
    upcoming: published.rows[0].total,
    week: upcoming.rows[0].total,
    categories: categories.rows[0].total,
    sources: sources.rows[0].total,
    restaurants: restaurants.rows[0].total,
    routes: routes.rows[0].total,
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

export async function archivePastEvents(days = 7): Promise<number> {
  await init();
  const cutoff = todayStr(-days);
  const res = await getPool().query(
    `UPDATE events SET status = 'hidden', updated_at = ${NOW_SQL}
     WHERE status = 'published' AND COALESCE(end_date, start_date) < $1`,
    [cutoff]
  );
  return res.rowCount ?? 0;
}

export async function setEventImage(id: number, image: string): Promise<void> {
  await init();
  await getPool().query(
    `UPDATE events SET image = $1, updated_at = ${NOW_SQL} WHERE id = $2`,
    [image, id]
  );
}

export async function upsertScrapedEvent(
  event: ScrapeEvent,
  sourceName: string,
  categoryId: number | null
): Promise<{ status: "new" | "updated" | "skipped"; id: number | null }> {
  await init();
  const dedupeKey =
    event.source_url && event.source_url.trim().length > 0
      ? event.source_url.trim()
      : `huescahoy:${slugify(event.title)}:${event.start_date}`;

  const existing = (
    await getPool().query(
      "SELECT id, title, start_date, image, category_id, lat, lng FROM events WHERE source_url = $1",
      [dedupeKey]
    )
  ).rows[0] as
    | { id: number; title: string; start_date: string; image: string | null; category_id: number | null; lat: number | null; lng: number | null }
    | undefined;

  if (existing) {
    const titleChanged = existing.title !== event.title;
    const dateChanged = existing.start_date !== event.start_date;
    const hasNewImage = Boolean(event.image) && !existing.image;
    const categoryChanged = existing.category_id !== categoryId;
    if (!titleChanged && !dateChanged && !hasNewImage && !categoryChanged)
      return { status: "skipped", id: existing.id };
    await getPool().query(
      `UPDATE events SET title = $1, start_date = $2, end_date = $3, start_time = $4, end_time = $5,
       location = $6, address = $7, price = $8, description = $9, image = $10, external_url = $11,
       category_id = COALESCE($12, category_id), source = $13,
       lat = COALESCE($14, lat), lng = COALESCE($15, lng), updated_at = ${NOW_SQL} WHERE id = $16`,
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
        event.latitude ?? null,
        event.longitude ?? null,
        existing.id,
      ]
    );
    return { status: "updated", id: existing.id };
  }

  const duplicate = await findCrossSourceDuplicate(event);
  if (duplicate) {
    const current = (
      await getPool().query(
        "SELECT end_date AS \"endDate\", end_time AS \"endTime\", location, address, price, description, image, external_url AS \"externalUrl\", category_id AS \"categoryId\", lat, lng FROM events WHERE id = $1",
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
      lat: number | null;
      lng: number | null;
    };

    const gaps: Array<{ column: string; value: string | number }> = [];
    if (event.end_date && !current.endDate) gaps.push({ column: "end_date", value: event.end_date });
    if (event.end_time && !current.endTime) gaps.push({ column: "end_time", value: event.end_time });
    if (event.location && !current.location) gaps.push({ column: "location", value: event.location });
    if (event.address && !current.address) gaps.push({ column: "address", value: event.address });
    if (event.price && !current.price) gaps.push({ column: "price", value: event.price });
    if (event.description && !current.description) gaps.push({ column: "description", value: event.description });
    if (event.image && !current.image) gaps.push({ column: "image", value: event.image });
    if (event.external_url && !current.externalUrl) gaps.push({ column: "external_url", value: event.external_url });
    if (event.latitude != null && current.lat == null) gaps.push({ column: "lat", value: event.latitude });
    if (event.longitude != null && current.lng == null) gaps.push({ column: "lng", value: event.longitude });
    if (event.latitude != null && current.lat == null) gaps.push({ column: "lat", value: event.latitude });
    if (event.longitude != null && current.lng == null) gaps.push({ column: "lng", value: event.longitude });

    const fillCategory = categoryId != null && current.categoryId == null;
    if (gaps.length === 0 && !fillCategory) return { status: "skipped", id: duplicate.id };

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
    return { status: "updated", id: duplicate.id };
  }

  const inserted = await getPool().query(
    `INSERT INTO events (slug, title, category_id, start_date, end_date, start_time, end_time, location, address, price, description, image, external_url, source, source_url, featured, status, lat, lng)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 0, 'published', $16, $17) RETURNING id`,
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
      event.latitude ?? null,
      event.longitude ?? null,
    ]
  );
  return { status: "new", id: inserted.rows[0]?.id ?? null };
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
  "id, slug, title, summary, body, image, published, sort_order AS \"sortOrder\", source, source_url AS \"sourceUrl\", created_at AS \"createdAt\", updated_at AS \"updatedAt\"";

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

export async function upsertPlan(input: PlanInput & { source: string; source_url: string | null }): Promise<{ status: "new" | "updated" | "skipped"; id: number | null }> {
  await init();
  const dedupeKey = input.source_url ?? `manual:${input.slug}`;
  const existing = (
    await getPool().query("SELECT id FROM planes WHERE source_url = $1", [dedupeKey])
  ).rows[0] as { id: number } | undefined;

  if (existing) {
    const res = await getPool().query(
      `UPDATE planes SET title = $1, summary = $2, body = $3, image = $4, published = $5, sort_order = $6,
       updated_at = ${NOW_SQL} WHERE id = $7 RETURNING id`,
      [
        input.title,
        input.summary,
        input.body,
        input.image,
        input.published,
        input.sort_order,
        existing.id,
      ]
    );
    return { status: "updated", id: res.rows[0]?.id ?? existing.id };
  }

  const inserted = await getPool().query(
    `INSERT INTO planes (slug, title, summary, body, image, published, sort_order, source, source_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
    [
      input.slug,
      input.title,
      input.summary,
      input.body,
      input.image,
      input.published,
      input.sort_order,
      input.source,
      dedupeKey,
    ]
  );
  return { status: "new", id: inserted.rows[0]?.id ?? null };
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
  categories?: string[];
}): Promise<void> {
  await init();
  const categories = JSON.stringify(input.categories ?? []);
  await getPool().query(
    `INSERT INTO push_subscriptions (endpoint, keys_p256dh, keys_auth, user_agent, categories)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT(endpoint) DO UPDATE SET keys_p256dh = EXCLUDED.keys_p256dh,
       keys_auth = EXCLUDED.keys_auth, user_agent = EXCLUDED.user_agent,
       categories = EXCLUDED.categories`,
    [input.endpoint, input.keysP256dh, input.keysAuth, input.userAgent, categories]
  );
}

export async function setPushCategories(endpoint: string, categories: string[]): Promise<boolean> {
  await init();
  const res = await getPool().query(
    "UPDATE push_subscriptions SET categories = $1 WHERE endpoint = $2",
    [JSON.stringify(categories), endpoint]
  );
  return (res.rowCount ?? 0) > 0;
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

export async function getPushSubscriptionsByCategories(
  slugs: string[]
): Promise<PushSubscriptionRow[]> {
  await init();
  if (slugs.length === 0) return [];
  const res = await getPool().query(
    `SELECT id, endpoint, keys_p256dh AS "keysP256dh", keys_auth AS "keysAuth",
       user_agent AS "userAgent", created_at AS "createdAt"
     FROM push_subscriptions
     WHERE categories = '[]' OR categories::jsonb ?| $1::text[]
     ORDER BY id DESC`,
    [slugs]
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

// ---------- Newsletter ----------

export async function addNewsletterSubscriber(
  email: string
): Promise<"new" | "existing"> {
  await init();
  const res = await getPool().query(
    `INSERT INTO newsletter_subscribers (email) VALUES ($1)
     ON CONFLICT (email) DO NOTHING RETURNING id`,
    [email]
  );
  return res.rows.length ? "new" : "existing";
}

export type NewsletterSubscriber = {
  id: number;
  email: string;
  createdAt: string;
};

export async function getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  await init();
  const res = await getPool().query(
    `SELECT id, email, created_at AS "createdAt" FROM newsletter_subscribers ORDER BY id DESC`
  );
  return res.rows.map(toPlain);
}

// ---------- Featured pick (El plan del finde) ----------

const FEATURED_PICK_COLUMNS =
  `id, label, title, tagline, reason, link_type AS "linkType", target_slug AS "targetSlug",
   image_url AS "imageUrl", active, created_at AS "createdAt", updated_at AS "updatedAt"`;

export async function getActiveFeaturedPick(): Promise<FeaturedPick | null> {
  await init();
  const res = await getPool().query(
    `SELECT ${FEATURED_PICK_COLUMNS} FROM featured_picks WHERE active = 1 ORDER BY id DESC LIMIT 1`
  );
  if (!res.rows.length) return null;
  const pick = toPlain(res.rows[0] as FeaturedPick);
  if (pick.linkType === "evento") {
    const event = await getEventBySlug(pick.targetSlug);
    if (!event || isEventPast(event, todayStr())) return null;
  }
  return pick;
}

export async function saveFeaturedPick(input: FeaturedPickInput): Promise<void> {
  await init();
  const existing = await getPool().query(
    `SELECT id FROM featured_picks WHERE active = 1 ORDER BY id DESC LIMIT 1`
  );
  if (existing.rows.length) {
    await getPool().query(
      `UPDATE featured_picks SET label = $1, title = $2, tagline = $3, reason = $4,
         link_type = $5, target_slug = $6, image_url = $7, active = $8, updated_at = ${NOW_SQL}
       WHERE id = $9`,
      [
        input.label,
        input.title,
        input.tagline,
        input.reason,
        input.link_type,
        input.target_slug,
        input.image_url,
        input.active,
        existing.rows[0].id,
      ]
    );
  } else {
    await getPool().query(
      `INSERT INTO featured_picks (label, title, tagline, reason, link_type, target_slug, image_url, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        input.label,
        input.title,
        input.tagline,
        input.reason,
        input.link_type,
        input.target_slug,
        input.image_url,
        input.active,
      ]
    );
  }
}

// ============================================================
// ---------- Restaurants ----------
// ============================================================

const RESTAURANT_COLUMNS =
  `id, slug, name, description, cuisine_type AS "cuisineType", price_range AS "priceRange",
   address, phone, email, website, image, lat, lng, rating, source,
   source_url AS "sourceUrl", status, created_at AS "createdAt", updated_at AS "updatedAt"`;

function rowToRestaurant(row: unknown): RestaurantItem {
  return toPlain(row as RestaurantItem);
}

export async function getRestaurants(filter: RestaurantFilter = {}): Promise<RestaurantItem[]> {
  await init();
  const conditions: string[] = ["r.status = 'published'"];
  const params: (string | number)[] = [];

  if (filter.q) {
    conditions.push(
      `(r.name LIKE $${params.length + 1} OR r.description LIKE $${params.length + 2} OR r.address LIKE $${params.length + 3})`
    );
    params.push(`%${filter.q}%`, `%${filter.q}%`, `%${filter.q}%`);
  }
  if (filter.cuisineType) {
    conditions.push(`r.cuisine_type = $${params.length + 1}`);
    params.push(filter.cuisineType);
  }
  if (filter.priceRange) {
    conditions.push(`r.price_range = $${params.length + 1}`);
    params.push(filter.priceRange);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  let sql = `SELECT ${RESTAURANT_COLUMNS} FROM restaurants r ${where} ORDER BY r.name ASC`;
  if (filter.limit) {
    const limit = Math.max(1, Math.min(filter.limit, 500));
    params.push(limit);
    sql += ` LIMIT $${params.length}`;
  }

  const res = await getPool().query(sql, params);
  return (res.rows as RestaurantItem[]).map(rowToRestaurant);
}

export async function getRestaurantBySlug(slug: string): Promise<RestaurantItem | null> {
  await init();
  const res = await getPool().query(`SELECT ${RESTAURANT_COLUMNS} FROM restaurants WHERE slug = $1`, [slug]);
  return res.rows.length ? rowToRestaurant(res.rows[0]) : null;
}

export async function getRestaurantById(id: number): Promise<RestaurantItem | null> {
  await init();
  const res = await getPool().query(`SELECT ${RESTAURANT_COLUMNS} FROM restaurants WHERE id = $1`, [id]);
  return res.rows.length ? rowToRestaurant(res.rows[0]) : null;
}

export async function getRestaurantsAdmin(): Promise<RestaurantItem[]> {
  await init();
  const res = await getPool().query(
    `SELECT ${RESTAURANT_COLUMNS} FROM restaurants ORDER BY name ASC`
  );
  return (res.rows as RestaurantItem[]).map(rowToRestaurant);
}

export async function createRestaurant(input: RestaurantInput): Promise<void> {
  await init();
  await getPool().query(
    `INSERT INTO restaurants (slug, name, description, cuisine_type, price_range, address, phone, email, website, image, lat, lng, rating, source, source_url, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
    [
      input.slug, input.name, input.description, input.cuisine_type, input.price_range,
      input.address, input.phone, input.email, input.website, input.image,
      input.lat, input.lng, input.rating, input.source, input.source_url, input.status,
    ]
  );
}

export async function updateRestaurant(id: number, input: Partial<RestaurantInput>): Promise<void> {
  await init();
  const current = await getRestaurantById(id);
  if (!current) return;
  await getPool().query(
    `UPDATE restaurants SET slug = $1, name = $2, description = $3, cuisine_type = $4, price_range = $5,
     address = $6, phone = $7, email = $8, website = $9, image = $10, lat = $11, lng = $12,
     rating = $13, status = $14, updated_at = ${NOW_SQL} WHERE id = $15`,
    [
      input.slug ?? current.slug,
      input.name ?? current.name,
      input.description ?? current.description,
      input.cuisine_type ?? current.cuisineType,
      input.price_range ?? current.priceRange,
      input.address ?? current.address,
      input.phone ?? current.phone,
      input.email ?? current.email,
      input.website ?? current.website,
      input.image ?? current.image,
      input.lat ?? current.lat,
      input.lng ?? current.lng,
      input.rating ?? current.rating,
      input.status ?? current.status,
      id,
    ]
  );
}

export async function deleteRestaurant(id: number): Promise<void> {
  await init();
  await getPool().query("DELETE FROM restaurants WHERE id = $1", [id]);
}

export async function upsertRestaurant(input: RestaurantInput): Promise<{ status: "new" | "updated" | "skipped"; id: number | null }> {
  await init();
  const dedupeKey = input.source_url ?? `manual:${input.slug}`;

  const existing = (
    await getPool().query("SELECT id, name, image, source FROM restaurants WHERE source_url = $1", [dedupeKey])
  ).rows[0] as { id: number; name: string; image: string | null; source: string } | undefined;

  if (existing) {
    const hasNewImage = Boolean(input.image) && !existing.image;
    if (!hasNewImage) return { status: "skipped", id: existing.id };
    await getPool().query(
      `UPDATE restaurants SET image = $1, updated_at = ${NOW_SQL} WHERE id = $2`,
      [input.image, existing.id]
    );
    return { status: "updated", id: existing.id };
  }

  const inserted = await getPool().query(
    `INSERT INTO restaurants (slug, name, description, cuisine_type, price_range, address, phone, email, website, image, lat, lng, rating, source, source_url, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING id`,
    [
      input.slug, input.name, input.description, input.cuisine_type, input.price_range,
      input.address, input.phone, input.email, input.website, input.image,
      input.lat, input.lng, input.rating, input.source, dedupeKey, input.status,
    ]
  );
  return { status: "new", id: inserted.rows[0]?.id ?? null };
}

// ============================================================
// ---------- Routes ----------
// ============================================================

const ROUTE_COLUMNS =
  `id, slug, title, description, summary, image, distance_km AS "distanceKm",
   elevation_m AS "elevationM", difficulty, route_type AS "routeType",
   lat, lng, external_url AS "externalUrl", gpx_url AS "gpxUrl",
   stages_count AS "stagesCount", source, source_url AS "sourceUrl", status,
   created_at AS "createdAt", updated_at AS "updatedAt"`;

function rowToRoute(row: unknown): RouteItem {
  return toPlain(row as RouteItem);
}

export async function getRoutes(filter: RouteFilter = {}): Promise<RouteItem[]> {
  await init();
  const conditions: string[] = ["r.status = 'published'"];
  const params: (string | number)[] = [];

  if (filter.q) {
    conditions.push(
      `(r.title LIKE $${params.length + 1} OR r.description LIKE $${params.length + 2} OR r.summary LIKE $${params.length + 3})`
    );
    params.push(`%${filter.q}%`, `%${filter.q}%`, `%${filter.q}%`);
  }
  if (filter.routeType) {
    conditions.push(`r.route_type = $${params.length + 1}`);
    params.push(filter.routeType);
  }
  if (filter.difficulty) {
    conditions.push(`r.difficulty = $${params.length + 1}`);
    params.push(filter.difficulty);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  let sql = `SELECT ${ROUTE_COLUMNS} FROM routes r ${where} ORDER BY r.title ASC`;
  if (filter.limit) {
    const limit = Math.max(1, Math.min(filter.limit, 500));
    params.push(limit);
    sql += ` LIMIT $${params.length}`;
  }

  const res = await getPool().query(sql, params);
  return (res.rows as RouteItem[]).map(rowToRoute);
}

export async function getRouteBySlug(slug: string): Promise<RouteItem | null> {
  await init();
  const res = await getPool().query(`SELECT ${ROUTE_COLUMNS} FROM routes WHERE slug = $1`, [slug]);
  return res.rows.length ? rowToRoute(res.rows[0]) : null;
}

export async function getRouteById(id: number): Promise<RouteItem | null> {
  await init();
  const res = await getPool().query(`SELECT ${ROUTE_COLUMNS} FROM routes WHERE id = $1`, [id]);
  return res.rows.length ? rowToRoute(res.rows[0]) : null;
}

export async function getRoutesAdmin(): Promise<RouteItem[]> {
  await init();
  const res = await getPool().query(
    `SELECT ${ROUTE_COLUMNS} FROM routes ORDER BY title ASC`
  );
  return (res.rows as RouteItem[]).map(rowToRoute);
}

export async function createRoute(input: RouteInput): Promise<void> {
  await init();
  await getPool().query(
    `INSERT INTO routes (slug, title, description, summary, image, distance_km, elevation_m, difficulty, route_type, lat, lng, external_url, gpx_url, stages_count, source, source_url, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
    [
      input.slug, input.title, input.description, input.summary, input.image,
      input.distance_km, input.elevation_m, input.difficulty, input.route_type,
      input.lat, input.lng, input.external_url, input.gpx_url, input.stages_count,
      input.source, input.source_url, input.status,
    ]
  );
}

export async function updateRoute(id: number, input: Partial<RouteInput>): Promise<void> {
  await init();
  const current = await getRouteById(id);
  if (!current) return;
  await getPool().query(
    `UPDATE routes SET slug = $1, title = $2, description = $3, summary = $4, image = $5,
     distance_km = $6, elevation_m = $7, difficulty = $8, route_type = $9, lat = $10, lng = $11,
     external_url = $12, gpx_url = $13, stages_count = $14, status = $15, updated_at = ${NOW_SQL} WHERE id = $16`,
    [
      input.slug ?? current.slug,
      input.title ?? current.title,
      input.description ?? current.description,
      input.summary ?? current.summary,
      input.image ?? current.image,
      input.distance_km ?? current.distanceKm,
      input.elevation_m ?? current.elevationM,
      input.difficulty ?? current.difficulty,
      input.route_type ?? current.routeType,
      input.lat ?? current.lat,
      input.lng ?? current.lng,
      input.external_url ?? current.externalUrl,
      input.gpx_url ?? current.gpxUrl,
      input.stages_count ?? current.stagesCount,
      input.status ?? current.status,
      id,
    ]
  );
}

export async function deleteRoute(id: number): Promise<void> {
  await init();
  await getPool().query("DELETE FROM routes WHERE id = $1", [id]);
}

export async function upsertRoute(input: RouteInput): Promise<{ status: "new" | "updated" | "skipped"; id: number | null }> {
  await init();
  const dedupeKey = input.source_url ?? `manual:${input.slug}`;

  const existing = (
    await getPool().query("SELECT id, title, image, source FROM routes WHERE source_url = $1", [dedupeKey])
  ).rows[0] as { id: number; title: string; image: string | null; source: string } | undefined;

  if (existing) {
    const hasNewImage = Boolean(input.image) && !existing.image;
    if (!hasNewImage) return { status: "skipped", id: existing.id };
    await getPool().query(
      `UPDATE routes SET image = $1, updated_at = ${NOW_SQL} WHERE id = $2`,
      [input.image, existing.id]
    );
    return { status: "updated", id: existing.id };
  }

  const inserted = await getPool().query(
    `INSERT INTO routes (slug, title, description, summary, image, distance_km, elevation_m, difficulty, route_type, lat, lng, external_url, gpx_url, stages_count, source, source_url, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING id`,
    [
      input.slug, input.title, input.description, input.summary, input.image,
      input.distance_km, input.elevation_m, input.difficulty, input.route_type,
      input.lat, input.lng, input.external_url, input.gpx_url, input.stages_count,
      input.source, dedupeKey, input.status,
    ]
  );
  return { status: "new", id: inserted.rows[0]?.id ?? null };
}

// ---------- Route stages ----------

export async function getRouteStages(routeId: number): Promise<RouteStage[]> {
  await init();
  const res = await getPool().query(
    `SELECT id, route_id AS "routeId", stage_number AS "stageNumber", title, description,
     distance_km AS "distanceKm", elevation_gain AS "elevationGain", elevation_loss AS "elevationLoss",
     lat, lng, sort_order AS "sortOrder"
     FROM route_stages WHERE route_id = $1 ORDER BY sort_order, stage_number`,
    [routeId]
  );
  return (res.rows as RouteStage[]).map(toPlain);
}

export async function replaceRouteStages(routeId: number, stages: Omit<RouteStage, "id" | "routeId">[]): Promise<void> {
  await init();
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM route_stages WHERE route_id = $1", [routeId]);
    for (let i = 0; i < stages.length; i++) {
      const s = stages[i];
      await client.query(
        `INSERT INTO route_stages (route_id, stage_number, title, description, distance_km, elevation_gain, elevation_loss, lat, lng, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [routeId, s.stageNumber, s.title, s.description, s.distanceKm, s.elevationGain, s.elevationLoss, s.lat, s.lng, i]
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    try { await client.query("ROLLBACK"); } catch { /* ignore */ }
    throw err;
  } finally {
    client.release();
  }
}
