import { getPool } from "./db";

type Bucket = { count: number; resetAt: number };

let memBuckets: Map<string, Bucket> | null = null;

function memRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  if (!memBuckets) memBuckets = new Map();
  const now = Date.now();
  const bucket = memBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    if (memBuckets.size > 10_000) {
      for (const [k, b] of memBuckets) {
        if (b.resetAt <= now) memBuckets.delete(k);
      }
    }
    memBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  if (bucket.count >= limit) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  bucket.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

export type RateLimitResult = {
  ok: boolean;
  retryAfterSec: number;
};

export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  let pool: ReturnType<typeof getPool> | null = null;
  try {
    pool = getPool();
  } catch {
    return memRateLimit(key, limit, windowMs);
  }
  if (!pool) return memRateLimit(key, limit, windowMs);

  const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
  const retryAfterSec = Math.ceil((windowStart + windowMs - Date.now()) / 1000);

  try {
    const existing = await pool.query<{ count: number }>(
      "SELECT count FROM rate_limits WHERE key = $1 AND window_start = $2",
      [key, windowStart]
    );

    const currentCount = existing.rows[0]?.count ?? 0;
    if (currentCount >= limit) {
      return { ok: false, retryAfterSec };
    }

    const result = await pool.query<{ count: number }>(
      `INSERT INTO rate_limits (key, window_start, count)
       VALUES ($1, $2, 1)
       ON CONFLICT (key, window_start) DO UPDATE SET count = rate_limits.count + 1
       RETURNING count`,
      [key, windowStart]
    );

    const newCount = result.rows[0]?.count ?? 1;
    if (newCount > limit) {
      return { ok: false, retryAfterSec };
    }

    return { ok: true, retryAfterSec: 0 };
  } catch {
    return memRateLimit(key, limit, windowMs);
  }
}

export function clientKey(headers: Headers, scope: string): string {
  const forwarded = headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "desconocida";
  return `${scope}:${ip}`;
}
