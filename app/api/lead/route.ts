import { NextRequest, NextResponse } from "next/server";
import { PostHog } from "posthog-node";
import { leadRateLimiter, clientIp } from "@/lib/rate-limit";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/lead
// Server-side proxy to gh-leads-core. Keeps LEADS_API_URL server-only
// (never exposed to the browser) and translates the frontend payload into
// the gh-leads-core schema.
//
// Required env var:
//   LEADS_API_URL=https://<your-gh-leads-core-host>
//
// Analytics env vars (optional — degrades gracefully when absent):
//   NEXT_PUBLIC_POSTHOG_KEY=
//   NEXT_PUBLIC_POSTHOG_HOST=
//
// If LEADS_API_URL is unset the route logs and returns ok:true so the UI
// flow is never blocked in local dev / staging without the backend.
// ─────────────────────────────────────────────────────────────────────────────

interface LeadPayload {
  email: string;
  overallScore: number;
  company?: string;
  firstName?: string;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Fire a server-side PostHog `lead_captured` event.
 * Uses posthog-node with flushAt:1 + flushInterval:0 for serverless.
 * Graceful degrade: no-op when NEXT_PUBLIC_POSTHOG_KEY is not set.
 */
async function captureLeadCaptured(
  email: string,
  score: number,
  company?: string
): Promise<void> {
  const phKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!phKey) return;

  try {
    const ph = new PostHog(phKey, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
      // Serverless-safe: flush immediately, don't batch
      flushAt: 1,
      flushInterval: 0,
    });

    ph.capture({
      distinctId: email,
      event: "lead_captured",
      properties: {
        score,
        source: "gh-growth-score",
        ...(company ? { company } : {}),
      },
    });

    await ph.shutdown();
  } catch (err) {
    // Analytics failure must never block the user response
    console.error(
      "[gh-growth-score] PostHog capture error:",
      (err as Error).message
    );
  }
}

export async function POST(req: NextRequest) {
  // Rate limit early (OWASP A04) — before parsing or any upstream work — so
  // malformed-body floods are throttled too.
  if (!leadRateLimiter.check(clientIp(req))) {
    return NextResponse.json(
      { ok: false, error: "Rate limit exceeded. Please try again in a minute." },
      { status: 429 }
    );
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // Reject non-object bodies (e.g. literal `null`, arrays, numbers) before
  // destructuring — `JSON.parse("null")` succeeds but would throw on destructure.
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { ok: false, error: "Request body must be a JSON object" },
      { status: 400 }
    );
  }

  const { email, overallScore, company, firstName } = body as LeadPayload;

  // Validation
  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { ok: false, error: "email is required" },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "Invalid email address" },
      { status: 400 }
    );
  }

  if (
    typeof overallScore !== "number" ||
    overallScore < 0 ||
    overallScore > 100
  ) {
    return NextResponse.json(
      { ok: false, error: "overallScore must be a number 0–100" },
      { status: 400 }
    );
  }

  const leadsApiUrl = process.env.LEADS_API_URL;

  if (!leadsApiUrl) {
    // Dev fallback: no backend configured — log score only (no PII)
    console.warn(
      "[gh-growth-score] LEADS_API_URL not set — skipping lead storage (dev mode)"
    );
    console.log("[gh-growth-score] Lead (not stored) — score:", overallScore);
    // Still fire analytics in dev so we capture lead intent
    await captureLeadCaptured(email, Math.round(overallScore), company);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Forward to gh-leads-core with the correct schema
  try {
    const upstream = await fetch(`${leadsApiUrl}/api/lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        source: "gh-growth-score",
        name: firstName,
        score: Math.round(overallScore),
        consent: true,
        metadata: {
          ...(company ? { company } : {}),
        },
      }),
      signal: AbortSignal.timeout(8000),
    });

    const data = (await upstream.json()) as {
      ok: boolean;
      id?: string;
      error?: string;
    };

    if (!upstream.ok || !data.ok) {
      console.error(
        "[gh-growth-score] gh-leads-core error:",
        data.error ?? upstream.status
      );
      // Don't block the user — return ok so the results screen still unlocks
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // Fire analytics after confirmed lead storage
    await captureLeadCaptured(email, Math.round(overallScore), company);

    return NextResponse.json({ ok: true, id: data.id }, { status: 200 });
  } catch (err) {
    // Network/timeout — never block the user experience
    console.error(
      "[gh-growth-score] leads API unreachable:",
      (err as Error).message
    );
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
