// ─────────────────────────────────────────────────────────────────────────────
// In-memory sliding-window rate limiter.
//
// Best-effort per-instance protection for serverless routes (Vercel functions).
// State lives in the function instance's memory, so it is NOT shared across
// instances or regions — it throttles bursts hitting a single warm instance,
// which is enough to blunt naive floods of POST /api/lead. For hard,
// cross-instance guarantees use a shared store (Upstash/Redis); intentionally
// avoided here to keep the OSS build zero-backend.
// ─────────────────────────────────────────────────────────────────────────────

export class InMemoryRateLimiter {
  private readonly hits = new Map<string, number[]>();

  /**
   * @param limit     max requests allowed per key within the window
   * @param windowMs  sliding window size in milliseconds
   */
  constructor(
    private readonly limit: number,
    private readonly windowMs: number
  ) {}

  /**
   * Record a request for `key` and report whether it is allowed.
   * Returns true if under the limit (request allowed), false if the limit is
   * already reached (request should be rejected with 429).
   *
   * `now` is injectable for deterministic tests.
   */
  check(key: string, now: number = Date.now()): boolean {
    // Opportunistically evict every key whose window has fully elapsed, so the
    // Map stays bounded to currently-active keys instead of accumulating one
    // permanent entry per IP that ever called us (a slow leak on warm
    // instances). Cheap: the Map only ever holds active keys, so this is O(live
    // keys), not O(all keys ever seen).
    this.sweep(now);

    const cutoff = now - this.windowMs;
    const recent = (this.hits.get(key) ?? []).filter((t) => t > cutoff);

    if (recent.length >= this.limit) {
      // Keep the pruned list so the window keeps sliding forward.
      this.hits.set(key, recent);
      return false;
    }

    recent.push(now);
    this.hits.set(key, recent);
    return true;
  }

  /** How many requests remain for `key` in the current window. */
  remaining(key: string, now: number = Date.now()): number {
    const cutoff = now - this.windowMs;
    const recent = (this.hits.get(key) ?? []).filter((t) => t > cutoff);
    // Drop a key that has fully aged out rather than leaving an empty-array
    // entry behind (this method is read-only otherwise, but it must not leak).
    if (recent.length === 0) {
      this.hits.delete(key);
    } else {
      this.hits.set(key, recent);
    }
    return Math.max(0, this.limit - recent.length);
  }

  /**
   * Delete every key whose newest timestamp has aged out of the window, freeing
   * the entries of IPs that have gone quiet. Bounds the Map to active keys.
   */
  private sweep(now: number = Date.now()): void {
    const cutoff = now - this.windowMs;
    const stale: string[] = [];
    this.hits.forEach((timestamps, key) => {
      const newest = timestamps[timestamps.length - 1];
      if (newest === undefined || newest <= cutoff) {
        stale.push(key);
      }
    });
    for (const key of stale) {
      this.hits.delete(key);
    }
  }

  /** Number of keys currently tracked. Exposed so callers/tests can observe
   *  that the Map stays bounded (does not retain aged-out keys). */
  get size(): number {
    return this.hits.size;
  }

  /** Clear all recorded hits (used to isolate tests). */
  reset(): void {
    this.hits.clear();
  }
}

/**
 * Derive a best-effort client IP from a request's headers.
 * Vercel forwards the real client IP in `x-forwarded-for` (may be a
 * comma-separated list; the first entry is the client). Falls back to
 * `x-real-ip`, then a constant bucket so the limiter still functions.
 */
/**
 * Shared limiter for POST /api/lead — 10 requests / minute / IP (OWASP A04).
 * A module-level singleton so all requests to a warm instance share state, and
 * so tests can import and reset it (Next.js route files may not export it).
 */
export const leadRateLimiter = new InMemoryRateLimiter(10, 60_000);

export function clientIp(req: { headers: { get(name: string): string | null } }): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}
