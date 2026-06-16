# STATUS — gh-growth-score

_Living status log for the v1.0.0 launch. Most recent on top._

## 2026-06-16 — v1.0 launch run (in progress)

**Goal:** clean v1.0 — both issues closed, email-gate decision documented,
build + full test suite green in CI, turnkey Vercel deploy, real committed
screenshot, README polished, tagged `v1.0.0`. See `PLAN.md` for the full gap
analysis.

### Done
- **Test suite restored to green: 112/112 passing.** The `vitest ^4.1.0`
  security bump (CVE-2026-47429) had left the suite red. Fixed jest-dom vitest
  entrypoint, oxc JSX transform (Vite 8 / rolldown), `globals: true` for RTL
  auto-cleanup, per-file jsdom env, `scrollIntoView` jsdom stub. Rewrote the
  stale `i18n.test.ts` to match the real flat-key API.
- **`app/api/lead/route.ts`**: rejects non-object JSON bodies with 400 (was an
  unhandled throw on a literal `null` body).
- **`next build` passes** — compiles + type-checks, 5 routes generated.
- Wrote `PLAN.md` (gap analysis).

### In progress / next
- Resolve OWASP A04 (rate limiting on `/api/lead`) + confirm A09 (PII logging,
  already fixed on `main`); file + close as GitHub issues.
- Email-gate decision → KEEP, env-configured via optional `LEADS_API_URL`
  (documented in README).
- ESLint config + `.github/workflows/ci.yml` (install/lint/test/build).
- `vercel.json` turnkey fix + README Deploy section.
- Playwright `docs/screenshot.png` capture → replace README placeholder.
- README polish, bump to 1.0.0, tag `v1.0.0`.

### Decisions
- **"2 open issues" = the 2 OWASP findings** in
  `.github/SECURITY-FINDINGS-2026-06-11.md` (the repo has no GitHub issues).
- **Email gate: KEEP**, wired to the optional server-side `LEADS_API_URL`
  proxy; graceful degradation means the OSS build works with zero backend.
