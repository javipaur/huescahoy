import { NextRequest } from "next/server";
import dns from "node:dns/promises";
import { getRestaurants, initAppDb } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(_request: NextRequest) {
  const report: Record<string, unknown> = { dbConfigured: Boolean(process.env.DATABASE_URL) };

  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      report.host = url.hostname;
      const lookup = await Promise.race([
        dns.lookup(url.hostname),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("lookup timeout")), 5000)
        ),
      ]);
      report.dns = { ok: true, address: standalone(lookup).address };
    } catch (err) {
      report.dns = { ok: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  try {
    await initAppDb();
    const rows = await getRestaurants({ limit: 1 });
    return Response.json({ ok: true, ...report, viaAppDb: true, sampleRestaurants: rows.length });
  } catch (err) {
    return Response.json({
      ok: false,
      ...report,
      viaAppDb: false,
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