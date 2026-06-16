# STATUS — gh-growth-score

_Living status log. Most recent on top._

## 2026-06-16 — v1.0.0 launch ✅

**Released v1.0.0.** All launch-goal criteria met and verified. See `PLAN.md`
for the original gap analysis.

### Verification (final gate — all green)
- `npm run lint` → no ESLint warnings or errors
- `npm test` → **127/127 passing** (5 files)
- `npm run build` → compiles + type-checks, 5 routes
- `npm run screenshot` → regenerates `docs/screenshot.png` (reproducible)

### What shipped
- **Test suite restored to green (was red).** The `vitest ^4.1.0` security bump
  (CVE-2026-47429) pulled Vite 8 (rolldown/oxc) and broke the suite. Fixed the
  jest-dom vitest entrypoint, oxc JSX transform (dropped the incompatible
  `@vitejs/plugin-react`), `globals: true` for RTL auto-cleanup, per-file jsdom
  env, and a `scrollIntoView` jsdom stub. Rewrote the stale `i18n.test.ts` to the
  real flat-key API.
- **Both "open issues" (OWASP findings) closed:**
  - **A04** ([#3](https://github.com/aymandakir-gh/gh-growth-score/issues/3)) —
    added an in-memory sliding-window rate limiter (10 req/min/IP) to
    `POST /api/lead` (`lib/rate-limit.ts`), 429 on exceed. 14 tests.
  - **A09** ([#4](https://github.com/aymandakir-gh/gh-growth-score/issues/4)) —
    confirmed score-only logging in the dev fallback; locked with a no-PII
    regression test.
  - Also hardened: non-object JSON bodies now return 400 instead of throwing.
- **Email gate decision: KEEP, env-configured, optional.** Wired to the existing
  server-side `LEADS_API_URL` proxy; graceful degradation means the OSS build
  works with zero backend. Documented in the README.
- **CI:** `.github/workflows/ci.yml` runs install → lint → test → build on push
  and PR. Added `.eslintrc.json` (so `next lint` doesn't hang).
- **Turnkey deploy:** `vercel.json` reduced to `{ "framework": "nextjs" }` —
  removed the missing-secret env binding that would break `vercel --prod`.
  README has a Deploy section + the one command.
- **Real screenshot:** committed `scripts/screenshot.mjs` (Playwright) captures
  `docs/screenshot.png`; README references it (placeholder removed).
- **README:** one-liner, live-demo slot, real screenshot, one-line run,
  "how the AARRR score works" section.
- **Version:** bumped 0.1.0 → 1.0.0; tagged `v1.0.0`.

### Decisions (for the record)
- **"2 open issues" = the 2 OWASP findings** in
  `.github/SECURITY-FINDINGS-2026-06-11.md` — the repo had no GitHub issues, so
  the findings were filed as issues #3 / #4 and closed by the resolving commits.
- **No `VERCEL_TOKEN`** was present in the environment, so the live deploy was
  not run; the one-command deploy is documented instead.
