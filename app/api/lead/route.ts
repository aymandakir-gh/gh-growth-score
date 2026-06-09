import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/lead
// Server-side proxy to gh-leads-core. Keeps LEADS_API_URL server-only
// (never exposed to the browser) and translates the frontend payload into
// the gh-leads-core schema.
//
// Required env var:
//   LEADS_API_URL=https://<your-gh-leads-core-host>
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

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
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

  if (typeof overallScore !== "number" || overallScore < 0 || overallScore > 100) {
    return NextResponse.json(
      { ok: false, error: "overallScore must be a number 0–100" },
      { status: 400 }
    );
  }

  const leadsApiUrl = process.env.LEADS_API_URL;

  if (!leadsApiUrl) {
    // Dev fallback: no backend configured — log and succeed silently
    console.warn("[gh-growth-score] LEADS_API_URL not set — skipping lead storage (dev mode)");
    console.log("[gh-growth-score] Lead (not stored):", { email, overallScore, company, firstName });
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

    const data = await upstream.json() as { ok: boolean; id?: string; error?: string };

    if (!upstream.ok || !data.ok) {
      console.error("[gh-growth-score] gh-leads-core error:", data.error ?? upstream.status);
      // Don't block the user — return ok so the results screen still unlocks
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    return NextResponse.json({ ok: true, id: data.id }, { status: 200 });
  } catch (err) {
    // Network/timeout — never block the user experience
    console.error("[gh-growth-score] leads API unreachable:", (err as Error).message);
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
