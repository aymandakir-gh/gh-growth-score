# W7·Security Findings — gh-growth-score — 2026-06-11

Filed by: W7·Security (automated OWASP audit)

> **Status (2026-06-16): both findings RESOLVED ahead of the v1.0.0 launch.**
> Tracked as GitHub issues [#3](https://github.com/aymandakir-gh/gh-growth-score/issues/3)
> (A04) and [#4](https://github.com/aymandakir-gh/gh-growth-score/issues/4) (A09).

---

## 🟠 MEDIUM — A04: No rate limiting on POST /api/lead  ✅ RESOLVED

**File:** `app/api/lead/route.ts`
**OWASP:** A04 Insecure Design
**Issue (GitHub):** #3

**Issue:**
`POST /api/lead` had no rate limiting. Any actor could flood the endpoint with
arbitrary email submissions, generating noise in gh-leads-core and PostHog, and
potentially abusing the upstream `gh-leads-core` quota.

**Resolution:**
Added `lib/rate-limit.ts` — an in-memory sliding-window `InMemoryRateLimiter`
(10 requests / minute / IP). It is applied at the very top of the route (before
body parsing) keyed on the client IP from `x-forwarded-for` (Vercel-forwarded),
returning HTTP 429 when exceeded. Best-effort per-instance protection — a shared
store is intentionally avoided to keep the OSS build zero-backend.

Covered by 14 tests (limiter unit tests + route 429 tests). Fixed in the commit
that closed #3.

---

## 🟡 LOW — A09: /api/lead logs email PII in dev fallback  ✅ RESOLVED

**File:** `app/api/lead/route.ts`
**OWASP:** A09 Security Logging Failures
**Issue (GitHub):** #4

**Issue:**
An earlier `main` revision logged the full `{ email, overallScore, company,
firstName }` object in the dev fallback, leaking PII (email, name) to server
logs — a GDPR/CCPA concern.

**Resolution:**
The dev fallback now logs the score only:
```ts
console.log("[gh-growth-score] Lead (not stored) — score:", overallScore);
```
Locked with a regression test ("does NOT log email or name to the console") that
spies on `console.log`/`console.warn` and asserts no PII appears in any logged
argument.

---

*Audit performed by W7·Security agent. Deploy safe: YES. No 🔴 blockers found.*
*Both findings closed 2026-06-16 (issues #3, #4) for the v1.0.0 launch.*
