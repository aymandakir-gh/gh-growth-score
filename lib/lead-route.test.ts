/**
 * POST /api/lead — route tests (23 tests)
 *
 * Tests the Next.js route handler at app/api/lead/route.ts.
 * Written by W6·QA run 9; restored in run 10 after sandbox push-block
 * prevented the original file from being committed.
 *
 * Environment: node (vitest.config.ts default)
 * Run: npm test
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// Dynamic import after mocking fetch
async function importRoute() {
  const mod = await import("../app/api/lead/route");
  return mod.POST;
}

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ─── Body validation ──────────────────────────────────────────────────────────

describe("POST /api/lead — body validation", () => {
  beforeEach(() => {
    vi.stubEnv("LEADS_API_URL", "");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 400 for invalid (non-JSON) body", async () => {
    const POST = await importRoute();
    const req = new NextRequest("http://localhost/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not valid json >>>",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.ok).toBe(false);
  });

  it("returns 400 for missing body (null body)", async () => {
    const POST = await importRoute();
    const req = new NextRequest("http://localhost/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "null",
    });
    // null parses as JSON but cast will miss email
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when email is missing", async () => {
    const POST = await importRoute();
    const res = await POST(makeRequest({ overallScore: 72 }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/email/i);
  });

  it("returns 400 when email is an empty string", async () => {
    const POST = await importRoute();
    const res = await POST(makeRequest({ email: "", overallScore: 72 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when email is not a string (number)", async () => {
    const POST = await importRoute();
    const res = await POST(makeRequest({ email: 12345, overallScore: 72 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when email format is invalid (no @)", async () => {
    const POST = await importRoute();
    const res = await POST(makeRequest({ email: "notanemail", overallScore: 72 }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/invalid email/i);
  });

  it("returns 400 for a SQL-injection-style email string", async () => {
    const POST = await importRoute();
    const res = await POST(
      makeRequest({ email: "' OR 1=1; --", overallScore: 50 }),
    );
    expect(res.status).toBe(400);
  });
});

// ─── Score validation ─────────────────────────────────────────────────────────

describe("POST /api/lead — score validation", () => {
  beforeEach(() => {
    vi.stubEnv("LEADS_API_URL", "");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 400 when overallScore is missing", async () => {
    const POST = await importRoute();
    const res = await POST(makeRequest({ email: "user@example.com" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/overallScore/i);
  });

  it("returns 400 when overallScore is a string", async () => {
    const POST = await importRoute();
    const res = await POST(makeRequest({ email: "user@example.com", overallScore: "72" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when overallScore is below 0", async () => {
    const POST = await importRoute();
    const res = await POST(makeRequest({ email: "user@example.com", overallScore: -1 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when overallScore is above 100", async () => {
    const POST = await importRoute();
    const res = await POST(makeRequest({ email: "user@example.com", overallScore: 101 }));
    expect(res.status).toBe(400);
  });

  it("accepts boundary score of 0", async () => {
    const POST = await importRoute();
    const res = await POST(makeRequest({ email: "user@example.com", overallScore: 0 }));
    expect(res.status).toBe(200);
  });

  it("accepts boundary score of 100", async () => {
    const POST = await importRoute();
    const res = await POST(makeRequest({ email: "user@example.com", overallScore: 100 }));
    expect(res.status).toBe(200);
  });
});

// ─── Dev fallback (no LEADS_API_URL) ─────────────────────────────────────────

describe("POST /api/lead — dev fallback (LEADS_API_URL unset)", () => {
  beforeEach(() => {
    vi.stubEnv("LEADS_API_URL", "");
    vi.spyOn(global, "fetch");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns 200 ok:true when LEADS_API_URL is not set", async () => {
    const POST = await importRoute();
    const res = await POST(makeRequest({ email: "user@example.com", overallScore: 72 }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it("does NOT call fetch when LEADS_API_URL is not set", async () => {
    const POST = await importRoute();
    await POST(makeRequest({ email: "user@example.com", overallScore: 72 }));
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("accepts optional fields (firstName, company) without error", async () => {
    const POST = await importRoute();
    const res = await POST(
      makeRequest({
        email: "user@example.com",
        overallScore: 55,
        firstName: "Alex",
        company: "Acme",
      }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });
});

// ─── Upstream proxy (LEADS_API_URL set) ──────────────────────────────────────

describe("POST /api/lead — upstream proxy", () => {
  beforeEach(() => {
    vi.stubEnv("LEADS_API_URL", "https://leads.example.com");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns 200 ok:true on successful upstream response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, id: "lead_123" }),
      }),
    );
    const POST = await importRoute();
    const res = await POST(makeRequest({ email: "user@example.com", overallScore: 72 }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it("forwards the correct schema to gh-leads-core", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const POST = await importRoute();
    await POST(
      makeRequest({ email: "user@example.com", overallScore: 72.7, company: "Acme" }),
    );
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://leads.example.com/api/lead");
    const sent = JSON.parse(init.body as string);
    expect(sent.email).toBe("user@example.com");
    expect(sent.source).toBe("gh-growth-score");
    expect(sent.score).toBe(73); // Math.round(72.7)
    expect(sent.consent).toBe(true);
    expect(sent.metadata.company).toBe("Acme");
  });

  it("fails open (returns ok:true) when upstream returns 500", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ ok: false, error: "Internal server error" }),
      }),
    );
    const POST = await importRoute();
    const res = await POST(makeRequest({ email: "user@example.com", overallScore: 72 }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it("fails open (returns ok:true) when upstream fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));
    const POST = await importRoute();
    const res = await POST(makeRequest({ email: "user@example.com", overallScore: 72 }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it("fails open when fetch is aborted (AbortError)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(
        Object.assign(new Error("The operation was aborted"), { name: "AbortError" }),
      ),
    );
    const POST = await importRoute();
    const res = await POST(makeRequest({ email: "user@example.com", overallScore: 72 }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it("includes company in metadata when provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const POST = await importRoute();
    await POST(
      makeRequest({ email: "user@example.com", overallScore: 50, company: "Initech" }),
    );
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const sent = JSON.parse(init.body as string);
    expect(sent.metadata.company).toBe("Initech");
  });

  it("omits company from metadata when not provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const POST = await importRoute();
    await POST(makeRequest({ email: "user@example.com", overallScore: 50 }));
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const sent = JSON.parse(init.body as string);
    expect(sent.metadata).not.toHaveProperty("company");
  });
});
