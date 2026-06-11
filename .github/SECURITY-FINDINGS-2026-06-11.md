# W7·Security Findings — gh-growth-score — 2026-06-11

Filed by: W7·Security (automated OWASP audit)

---

## 🟠 MEDIUM — A04: No rate limiting on POST /api/lead

**File:** `app/api/lead/route.ts`
**OWASP:** A04 Insecure Design

**Issue:**
`POST /api/lead` has no rate limiting. Any actor can flood the endpoint with arbitrary email submissions, generating noise in gh-leads-core and PostHog, and potentially abusing the upstream `gh-leads-core` quota.

`POST /api/scan` in gh-ai-rank-tracker implements an in-memory sliding-window limiter (10 req/min/IP) — the same pattern should be applied here.

**Remediation:**
1. Import or replicate `InMemoryRateLimiter` from gh-ai-rank-tracker (or abstract to a shared package).
2. Apply: `if (!limiter.check(ip)) return NextResponse.json({ ok: false, error: 'Rate limit exceeded' }, { status: 429 });`
3. IP derived from `x-forwarded-for` (Vercel forwards this).

**Priority:** Ship before public traffic — currently no load protection.

---

## 🟡 LOW — A09: /api/lead logs email PII in dev fallback (main branch)

**File:** `app/api/lead/route.ts` (main branch only)
**OWASP:** A09 Security Logging Failures

**Issue:**
In `main`, the dev fallback logs the full `{ email, overallScore, company, firstName }` object:
```ts
console.log("[gh-growth-score] Lead (not stored):", { email, overallScore, company, firstName });
```
This leaks PII (email, name) to server logs — a compliance issue under GDPR/CCPA.

**Status:** ✅ **Already fixed in `w6/tests-20260610-0910` branch** — that branch logs `overallScore` only. Merge that branch to close this finding.

**Remediation:** Merge `w6/tests-20260610-0910` → main.

---

*Audit performed by W7·Security agent. Deploy safe: YES. No 🔴 blockers found.*
