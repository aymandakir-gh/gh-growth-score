import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/lead
// Captures email + score for the detailed report gate.
// Currently a stub: validates input and logs to server console.
// Real CRM wiring (HubSpot / Intercom / Supabase) is wired here later.
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

  // Stub: log capture
  // TODO: replace with real CRM integration
  console.log("[gh-growth-score] Lead captured:", {
    email,
    overallScore,
    company: company ?? null,
    firstName: firstName ?? null,
    capturedAt: new Date().toISOString(),
    source: req.headers.get("referer") ?? "direct",
  });

  return NextResponse.json(
    {
      ok: true,
      message: "Lead captured successfully",
    },
    { status: 200 }
  );
}
