// Migra los datos de la base SQLite local (data/huescahoy.db) a PostgreSQL.
//
// Uso:
//   DATABASE_URL="postgresql://usuario:pass@host:5432/bd" npm run db:migrate
//
// Aplica scripts/schema.sql (idempotente) y copia las tablas que aún estén
// vacías en Postgres, conservando los ids y ajustando las secuencias.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import pg from "pg";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const schemaSql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Falta la variable DATABASE_URL");
  process.exit(1);
}

const sqlitePath = path.join(rootDir, "data", "huescahoy.db");
if (!fs.existsSync(sqlitePath)) {
  console.error(`No se encuentra la base SQLite: ${sqlitePath}`);
  process.exit(1);
}

const sqlite = new Database(sqlitePath, { readonly: true });
const client = new pg.Client({ connectionString: databaseUrl });

async function copyTable(table, rows) {
  for (const row of rows) {
    const cols = Object.keys(row);
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
    const values = cols.map((c) => row[c] ?? null);
    await client.query(
      `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${placeholders})`,
      values
    );
  }
}

async function run() {
  await client.connect();
  console.log("Aplicando esquema...");
  await client.query(schemaSql);

  const tables = [
    "categories",
    "events",
    "sources",
    "scraper_runs",
    "sessions",
    "suggestions",
    "planes",
    "geocodes",
  ];

  for (const table of tables) {
    const count = (
      await client.query(`SELECT COUNT(*)::int AS n FROM ${table}`)
    ).rows[0].n;
    if (count > 0) {
      console.log(`* ${table}: ya tiene ${count} filas en Postgres, se omite`);
      continue;
    }

    const rows = sqlite.prepare(`SELECT * FROM ${table}`).all();
    if (rows.length === 0) {
      console.log(`* ${table}: sin filas en SQLite`);
      continue;
    }

    await client.query("BEGIN");
    try {
      await copyTable(table, rows);
      const hasId = await client.query(
        `SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1 AND column_name = 'id'`,
        [table]
      );
      if (hasId.rows.length > 0) {
        await client.query(
          `SELECT setval(pg_get_serial_sequence($1, 'id'), GREATEST((SELECT MAX(id) FROM ${table}), 1))`,
          [table]
        );
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    }
    console.log(`* ${table}: ${rows.length} filas copiadas`);
  }

  await client.end();
  console.log("Migración completada.");
}

run().catch((err) => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
