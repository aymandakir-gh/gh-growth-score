# PLAN — gh-growth-score

> **v1.1.0 — the growth loop (2026-06-16).** Make the tool market itself, while
> staying **zero-backend & privacy-first** (no DB, no server-stored results, no
> PII leaving the browser). Plan below; the original v1.0 gap analysis follows.

## v1.1.0 plan

### 1. Compact, URL-safe result codec (no PII)
`encodeResultForURL` currently does `btoa(JSON.stringify({a,s,t}))` — not
URL-safe (`+ / =`), bulky, and not edge-safe. Replace with a versioned digit
format:

```
token = "1." + <15 digits>      e.g.  "1.342013402230114"
```

- The 15 digits are the answers (0–4) in fixed `QUESTIONS` order. That is the
  **entire payload** — no email/name/company, no timestamp, no free text. Not
  PII. Opening the link recomputes the exact score/breakdown via
  `scoreSubmission` (the scoring engine is the single source of truth).
- Decode validates version + length + digit range; invalid → `null`. Legacy
  base64-JSON tokens still decode (backward compatible). Pure string ops →
  works on the Edge runtime (the OG route needs that).
- Documented in `datasets/` and the README.

### 2. Ungate shared views + dynamic OG metadata
Today a `?r=` recipient still hits the email gate before seeing anything — that
kills the loop. `app/page.tsx` becomes a **server component** with
`generateMetadata({ searchParams })` that, for a shared token, sets a dynamic
`og:image` (→ the OG route) and a score-aware title; the interactive quiz moves
to `components/HomeClient.tsx`. Shared views render the **full breakdown with no
gate** (payload has no PII), plus a "take your own audit" CTA — that is the loop.
`metadataBase` set from `NEXT_PUBLIC_SITE_URL` (fallback to the prod URL).

### 3. Dynamic OG / share-card image route
`app/api/og/route.tsx` (Edge, `next/og` `ImageResponse`) renders a branded card
(score, 5 AARRR mini-bars, label) from the token. `next/og` can't be imported in
vitest (needs Next's bundler), so all data logic lives in a pure, unit-tested
`lib/share-model.ts` (`buildShareModel(token)`); the route is a thin JSX layer.
Image validity is checked end-to-end (Playwright fetch against `next start`:
200 + `image/png` + non-empty). A `?v=report` variant is the downloadable image.

### 4. Downloadable PNG report
A client-side "Download report" button fetches the OG `?v=report` image and
saves it as a PNG (Blob + anchor). Stateless render of the URL token — no DB, no
PII. Exercised end-to-end.

### 5. Per-stage recommendations + industry benchmark
- `datasets/benchmarks.md` — a documented median-per-stage table. No licensed
  source is bundled, so the figures are **honestly synthesized placeholders**,
  clearly labelled with provenance + how to replace them.
- `lib/benchmarks.ts` — the table + `compareToBenchmark(stageScores)` ("your
  score vs median", delta, above/below). Pure, unit-tested.
- `lib/recommendations.ts` — `getStageRecommendation(stage, score)` returning
  tailored advice per score band (critical / needs-work / good / strong). Pure,
  unit-tested.
- Rendered in `ResultsDashboard` (benchmark deltas + tailored recommendations).

### 6. Quality bar: axe-clean a11y + Lighthouse ≥90
- Playwright + `@axe-core/playwright` scan of the quiz + results; fix to clean.
- Lighthouse against `next start`; commit the report under `docs/lighthouse/`
  and report the **real** numbers (target ≥90 perf/a11y/best-practices/SEO).

### Verification (every slice)
`npm run build` · `npm test` (full suite) · Playwright e2e (share round-trip +
OG image + export + axe) · re-run `npm run screenshot`. CI stays green on main.
Deploy stays one command (`npx vercel --prod`); not run here (no VERCEL_TOKEN).

---

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
