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
