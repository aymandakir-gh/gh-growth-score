/**
 * OBS-1 Graceful-Degrade Tests (W6·QA — CEO Run 30)
 *
 * Verifies gh-growth-score observability init degrades gracefully when env
 * keys are absent (OSS / no-key scenario):
 *
 *   - sentry.client.config: Sentry.init NOT called when NEXT_PUBLIC_SENTRY_DSN absent
 *   - sentry.server.config: Sentry.init NOT called when NEXT_PUBLIC_SENTRY_DSN absent
 *   - app/api/lead/route.ts: PostHog NOT instantiated when NEXT_PUBLIC_POSTHOG_KEY absent
 *   - app/api/lead/route.ts: `lead_captured` fires exactly once per POST when key IS set
 *   - app/api/lead/route.ts: PostHog error never blocks the HTTP response
 *
 * Environment: node (vitest.config.ts default)
 * Run: npm test
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

function makeLeadRequest(overrides?: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "obs@example.com",
      overallScore: 72,
      ...overrides,
    }),
  });
}

// ─── Sentry client config — graceful degrade ─────────────────────────────────

describe("sentry.client.config — graceful degrade when DSN absent", () => {
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("does NOT call Sentry.init when NEXT_PUBLIC_SENTRY_DSN is absent", async () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "");
    const initSpy = vi.fn();
    vi.doMock("@sentry/nextjs", () => ({ init: initSpy }));
    await import("../../sentry.client.config");
    expect(initSpy).not.toHaveBeenCalled();
  });

  it("does not throw when NEXT_PUBLIC_SENTRY_DSN is absent", async () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "");
    vi.doMock("@sentry/nextjs", () => ({ init: vi.fn() }));
    await expect(import("../../sentry.client.config")).resolves.toBeDefined();
  });

  it("calls Sentry.init exactly once when NEXT_PUBLIC_SENTRY_DSN is set", async () => {
    vi.stubEnv(
      "NEXT_PUBLIC_SENTRY_DSN",
      "https://example@o0.ingest.sentry.io/0"
    );
    const initSpy = vi.fn();
    vi.doMock("@sentry/nextjs", () => ({ init: initSpy }));
    await import("../../sentry.client.config");
    expect(initSpy).toHaveBeenCalledOnce();
    expect(initSpy).toHaveBeenCalledWith(
      expect.objectContaining({ dsn: "https://example@o0.ingest.sentry.io/0" })
    );
  });
});

// ─── Sentry server config — graceful degrade ─────────────────────────────────

describe("sentry.server.config — graceful degrade when DSN absent", () => {
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("does NOT call Sentry.init when NEXT_PUBLIC_SENTRY_DSN is absent", async () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "");
    const initSpy = vi.fn();
    vi.doMock("@sentry/nextjs", () => ({ init: initSpy }));
    await import("../../sentry.server.config");
    expect(initSpy).not.toHaveBeenCalled();
  });

  it("does not throw when NEXT_PUBLIC_SENTRY_DSN is absent", async () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "");
    vi.doMock("@sentry/nextjs", () => ({ init: vi.fn() }));
    await expect(import("../../sentry.server.config")).resolves.toBeDefined();
  });
});

// ─── PostHog route — captureLeadCaptured graceful degrade ────────────────────

describe("app/api/lead/route — PostHog graceful degrade", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("LEADS_API_URL", ""); // dev fallback: no upstream proxy
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("does NOT instantiate PostHog when NEXT_PUBLIC_POSTHOG_KEY is absent", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "");
    const PostHogCtor = vi.fn();
    vi.doMock("posthog-node", () => ({ PostHog: PostHogCtor }));
    const { POST } = await import("../../app/api/lead/route");
    await POST(makeLeadRequest());
    expect(PostHogCtor).not.toHaveBeenCalled();
  });

  it("returns 200 ok:true when NEXT_PUBLIC_POSTHOG_KEY is absent (no crash)", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "");
    vi.doMock("posthog-node", () => ({ PostHog: vi.fn() }));
    const { POST } = await import("../../app/api/lead/route");
    const res = await POST(makeLeadRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it("fires PostHog.capture exactly once per POST when key is set", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test_key_1234");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "https://eu.i.posthog.com");
    const captureMock = vi.fn();
    const shutdownMock = vi.fn().mockResolvedValue(undefined);
    const PostHogCtor = vi.fn().mockImplementation(() => ({
      capture: captureMock,
      shutdown: shutdownMock,
    }));
    vi.doMock("posthog-node", () => ({ PostHog: PostHogCtor }));
    const { POST } = await import("../../app/api/lead/route");
    await POST(makeLeadRequest());
    // Exactly one PostHog client created, exactly one event captured
    expect(PostHogCtor).toHaveBeenCalledOnce();
    expect(captureMock).toHaveBeenCalledOnce();
    expect(captureMock).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "lead_captured",
        distinctId: "obs@example.com",
        properties: expect.objectContaining({ source: "gh-growth-score" }),
      })
    );
  });

  it("returns 200 ok:true when PostHog constructor throws (error isolation)", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test_key_1234");
    vi.doMock("posthog-node", () => ({
      PostHog: vi.fn().mockImplementation(() => {
        throw new Error("PostHog init failure — network unreachable");
      }),
    }));
    const { POST } = await import("../../app/api/lead/route");
    const res = await POST(makeLeadRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it("returns 200 ok:true when PostHog.capture throws (error isolation)", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test_key_1234");
    vi.doMock("posthog-node", () => ({
      PostHog: vi.fn().mockImplementation(() => ({
        capture: vi.fn().mockImplementation(() => {
          throw new Error("capture error");
        }),
        shutdown: vi.fn().mockResolvedValue(undefined),
      })),
    }));
    const { POST } = await import("../../app/api/lead/route");
    const res = await POST(makeLeadRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  it("returns 200 ok:true when PostHog.shutdown rejects (error isolation)", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test_key_1234");
    vi.doMock("posthog-node", () => ({
      PostHog: vi.fn().mockImplementation(() => ({
        capture: vi.fn(),
        shutdown: vi.fn().mockRejectedValue(new Error("flush timeout")),
      })),
    }));
    const { POST } = await import("../../app/api/lead/route");
    const res = await POST(makeLeadRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });
});
