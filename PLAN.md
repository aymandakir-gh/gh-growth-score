# PLAN — gh-growth-score → v1.0.0

_Gap analysis: current state vs. the v1.0 launch goal. Written 2026-06-16._

This is an existing, ~complete AARRR growth-diagnostic Next.js app. The plan
below is **finish work**, not a rebuild. Each item lists the gap and the fix.

## Where the repo stood at the start

- Next.js 14 (App Router) + TypeScript + Tailwind, pure-component UI.
- Scoring engine (`lib/scoring.ts`) is the single source of truth: 15 questions
  (3 × 5 AARRR stages), weighted 0–100 scoring, bottleneck ranking, ICE
  experiment selection, URL share encode/decode. 41 unit tests cover it.
- 9-language i18n system (`lib/i18n.ts`, flat dot-keyed dictionaries) with an
  accessible `LanguageSelector`. Not mentioned in the original README.
- Observability already wired (Sentry + PostHog, graceful-degrade without keys).
- Email gate (`EmailGate.tsx`) posts to `/api/lead`, which proxies to an
  optional `LEADS_API_URL` backend and degrades gracefully when unset.
- `vercel.json` present; `.env.example` present; MIT license.

## Gaps found vs. the goal

### 1. Test suite was RED (not green) ✅ fixed
The `vitest ^4.1.0` security bump (commit `1fa96dd`, CVE-2026-47429) broke the
test setup. Vitest 4 bundles Vite 8 (rolldown/oxc), which changed several
behaviours. Fixes applied:
- `vitest.setup.ts`: import `@testing-library/jest-dom/vitest` (not the bare
  entry, which needs a global `expect`).
- `vitest.config.ts`: dropped `@vitejs/plugin-react` (only supports Vite ≤7);
  JSX now transformed by `oxc.jsx: { runtime: "automatic" }`, overriding the
  app tsconfig's `jsx: "preserve"`. Added `globals: true` (so
  `@testing-library/react` auto-cleanup registers). Removed
  `environmentMatchGlobs` (removed in Vitest 4).
- `LanguageSelector.test.tsx`: opt into jsdom via `@vitest-environment` docblock.
- `vitest.setup.ts`: stub `Element.prototype.scrollIntoView` (jsdom gap).
- `lib/__tests__/i18n.test.ts`: rewritten — it tested an aspirational nested
  `UITranslations` API with `zh-CN`/`pt-BR` codes that this codebase never
  shipped. Now tests the real flat-key API (`zh`/`pt-br`, 9 locales, key parity).
- `app/api/lead/route.ts`: reject non-object JSON bodies (e.g. literal `null`)
  with 400 instead of throwing — closes a real validation gap a test asserts.

Result: **112/112 tests pass**; `next build` compiles & type-checks clean.

### 2. The "2 open issues" = OWASP findings ⏳
There are **no GitHub issues** on the repo (`gh issue list` is empty). The two
trackable open items are the OWASP findings in
`.github/SECURITY-FINDINGS-2026-06-11.md`:
- **A04 (MEDIUM)** — no rate limiting on `POST /api/lead`. **Still open.** →
  add an in-memory sliding-window limiter (per-IP via `x-forwarded-for`, 429).
- **A09 (LOW)** — PII (email/name) logged in the dev fallback. **Already fixed
  on `main`** (route logs `overallScore` only). → confirm + mark resolved.

Both will be filed as GitHub issues and closed with referencing commits.

### 3. Email-gate decision — KEEP (env-configured) ⏳
Decision: **keep** the email gate, wired to the existing optional
`LEADS_API_URL` server-side proxy. No secrets are committed; with no backend the
gate still unlocks (graceful degradation) so the tool works zero-backend. This
is the best of both: lead capture when configured, fully functional OSS build
when not. Document the decision explicitly in the README.

### 4. CI + lint ⏳
No CI workflow and no ESLint config (so `next lint` would hang on interactive
setup). → add `.eslintrc.json` (+ eslint deps) and
`.github/workflows/ci.yml` (install → lint → test → build on push/PR).

### 5. Turnkey deploy ⏳
`vercel.json` references a Vercel secret `@gh-leads-core-url` in its `env` block.
That **breaks a one-click / `vercel --prod` deploy** when the secret doesn't
exist. → remove the env binding (LEADS_API_URL is optional; set it in project
settings if wanted). Keep/clarify the README Deploy section + one command.

### 6. Real screenshot ⏳
README references `./screenshot-placeholder.png`, which **does not exist** (broken
image). → add a committed Playwright script that boots the app and captures
`docs/screenshot.png`; run it; commit the PNG; reference it in the README.

### 7. README polish ⏳
Has a one-liner & quick start. → add a live-demo link slot, the real screenshot,
and a "how the AARRR score works" section; fix the broken image reference.

### 8. Release ⏳
Bump `package.json` 0.1.0 → 1.0.0; keep STATUS.md current; tag `v1.0.0` once all
of the above hold and build + tests + screenshot are verified.

## Verification gates (run before claiming any slice done)
- `npm test` → 112 passing
- `npm run build` → compiles + type-checks
- `node scripts/screenshot.mjs` (or `npm run screenshot`) → writes docs/screenshot.png
