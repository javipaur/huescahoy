import { NextRequest } from "next/server";
import dns from "node:dns/promises";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(_request: NextRequest) {
  const url = process.env.DATABASE_URL ?? "";
  let host: string | null = null;
  try {
    host = new URL(url).hostname;
  } catch {
    // URL mal formada: seguimos y reportamos
  }

  const report: Record<string, unknown> = {
    dbConfigured: Boolean(url),
    host,
  };

  if (host) {
    try {
      const lookup = await Promise.race([
        dns.lookup(host),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("lookup timeout")), 5000)
        ),
      ]);
      report.dns = { ok: true, address: standalone(lookup).address };
    } catch (err) {
      report.dns = { ok: false, error: err instanceof Error ? err.message : String(err) };
      return Response.json({
        ok: false,
        ...report,
        error: "DNS lookup failed for DB host",
      });
    }
  }

  try {
    const { Pool } = await import("pg");
    const pool = new Pool({
      connectionString: url || undefined,
      connectionTimeoutMillis: 4000,
      query_timeout: 4000,
      max: 1,
    });
    const res = await pool.query("SELECT 1 AS ok");
    await pool.end();
    return Response.json({ ok: true, ...report, select: res.rows[0] });
  } catch (err) {
    return Response.json({
      ok: false,
      ...report,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

function standalone(value: unknown): { address: string } {
  if (typeof value === "object" && value !== null && "address" in value) {
    return value as { address: string };
  }
  return { address: String(value) };
}