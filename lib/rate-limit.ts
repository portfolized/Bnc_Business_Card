// Lightweight in-memory rate limiter (fixed window) to blunt floods / brute
// force / basic DDoS on sensitive endpoints. Per server process — fine for a
// single instance; for multi-instance/serverless scale, back this with Redis.

type Entry = { count: number; reset: number };

const buckets = new Map<string, Entry>();

export type RateResult = { ok: boolean; retryAfter: number };

/**
 * Returns { ok: false } once `limit` requests for `key` have occurred within
 * `windowMs`. retryAfter is seconds until the window resets.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || entry.reset <= now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    // Opportunistic cleanup so the map doesn't grow unbounded.
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (v.reset <= now) buckets.delete(k);
    }
    return { ok: true, retryAfter: 0 };
  }

  entry.count += 1;
  if (entry.count > limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((entry.reset - now) / 1000)) };
  }
  return { ok: true, retryAfter: 0 };
}

/** Best-effort client IP from request headers (behind proxies). */
export function ipFromHeaders(h: Headers): string {
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return h.get("x-real-ip") || "local";
}
