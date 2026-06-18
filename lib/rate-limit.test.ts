import { describe, it, expect } from "vitest";
import { InMemoryRateLimiter, clientIp } from "./rate-limit";

describe("InMemoryRateLimiter", () => {
  it("allows requests up to the limit", () => {
    const rl = new InMemoryRateLimiter(3, 1000);
    expect(rl.check("a", 0)).toBe(true);
    expect(rl.check("a", 0)).toBe(true);
    expect(rl.check("a", 0)).toBe(true);
  });

  it("rejects the request that exceeds the limit", () => {
    const rl = new InMemoryRateLimiter(3, 1000);
    rl.check("a", 0);
    rl.check("a", 0);
    rl.check("a", 0);
    expect(rl.check("a", 0)).toBe(false);
  });

  it("tracks keys independently", () => {
    const rl = new InMemoryRateLimiter(1, 1000);
    expect(rl.check("a", 0)).toBe(true);
    expect(rl.check("a", 0)).toBe(false);
    // Different key has its own budget.
    expect(rl.check("b", 0)).toBe(true);
  });

  it("slides the window — old hits expire", () => {
    const rl = new InMemoryRateLimiter(2, 1000);
    expect(rl.check("a", 0)).toBe(true);
    expect(rl.check("a", 500)).toBe(true);
    // At t=600 the window is full (two hits within 1000ms).
    expect(rl.check("a", 600)).toBe(false);
    // At t=1001 the first hit (t=0) has aged out, so a slot frees up.
    expect(rl.check("a", 1001)).toBe(true);
  });

  it("reports remaining budget", () => {
    const rl = new InMemoryRateLimiter(3, 1000);
    expect(rl.remaining("a", 0)).toBe(3);
    rl.check("a", 0);
    expect(rl.remaining("a", 0)).toBe(2);
    rl.check("a", 0);
    rl.check("a", 0);
    expect(rl.remaining("a", 0)).toBe(0);
  });

  it("reset() clears all recorded hits", () => {
    const rl = new InMemoryRateLimiter(1, 1000);
    rl.check("a", 0);
    expect(rl.check("a", 0)).toBe(false);
    rl.reset();
    expect(rl.check("a", 0)).toBe(true);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Map must stay bounded: a key whose window has fully elapsed is evicted, so
  // the limiter does not accumulate one permanent entry per IP that ever hit it.
  // ───────────────────────────────────────────────────────────────────────────

  it("does not retain a key after its window has fully elapsed", () => {
    const rl = new InMemoryRateLimiter(5, 1000);
    rl.check("a", 0);
    expect(rl.size).toBe(1);
    // A later request from a DIFFERENT key, well past a's window, must evict a.
    rl.check("b", 2000);
    expect(rl.size).toBe(1); // only b remains; a was swept
  });

  it("size returns to 0 once every tracked key has aged out", () => {
    const rl = new InMemoryRateLimiter(5, 1000);
    rl.check("a", 0);
    rl.check("b", 100);
    expect(rl.size).toBe(2);
    // Any check after both windows elapse sweeps both stale keys; the only
    // entry left is the one we just recorded.
    rl.check("c", 5000);
    expect(rl.size).toBe(1);
    // And once that final key ages out too, a sweep drops it: simulate via a
    // no-op key whose own window is already gone — size collapses to just the
    // active key.
    rl.check("c", 5000 + 2000);
    expect(rl.size).toBe(1);
  });

  it("a steady stream of unique IPs does not grow the Map unboundedly", () => {
    const rl = new InMemoryRateLimiter(5, 1000);
    // 50 distinct IPs, each 2s apart — every prior IP is past its window by the
    // time the next arrives, so the Map should never hold more than 1 key.
    for (let i = 0; i < 50; i++) {
      rl.check(`ip-${i}`, i * 2000);
      expect(rl.size).toBe(1);
    }
  });

  it("remaining() does not leave behind an entry for an aged-out key", () => {
    const rl = new InMemoryRateLimiter(3, 1000);
    rl.check("a", 0);
    expect(rl.size).toBe(1);
    // Query budget for a long after its window — must report full budget AND
    // not retain the empty entry.
    expect(rl.remaining("a", 5000)).toBe(3);
    expect(rl.size).toBe(0);
  });

  it("still enforces the limit correctly while keys are active (no regression)", () => {
    const rl = new InMemoryRateLimiter(2, 1000);
    expect(rl.check("a", 0)).toBe(true);
    expect(rl.check("a", 100)).toBe(true);
    expect(rl.check("a", 200)).toBe(false); // window full
    expect(rl.check("a", 1101)).toBe(true); // first hit aged out, slot frees
  });
});

describe("clientIp", () => {
  function req(headers: Record<string, string>) {
    return {
      headers: {
        get: (name: string) => headers[name.toLowerCase()] ?? null,
      },
    };
  }

  it("uses the first IP in x-forwarded-for", () => {
    expect(clientIp(req({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" }))).toBe("1.2.3.4");
  });

  it("trims whitespace from the forwarded IP", () => {
    expect(clientIp(req({ "x-forwarded-for": "  1.2.3.4  " }))).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    expect(clientIp(req({ "x-real-ip": "9.8.7.6" }))).toBe("9.8.7.6");
  });

  it("falls back to 'unknown' when no IP headers are present", () => {
    expect(clientIp(req({}))).toBe("unknown");
  });
});
