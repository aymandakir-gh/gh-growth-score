# STATUS — gh-growth-score

_Living status log. Most recent on top._

## 2026-06-16 — v1.4.0: client-side PDF export ✅

**Released v1.4.0** — the full report now exports as a real **PDF**, generated
entirely client-side (no backend, no PII leaves the browser). See `PRD.md`
(Slice 3).

### Verification (gate — all green)
- `npm run build` → compiles + type-checks
- `npm test` → **203/203** unit (+PDF: valid `%PDF-` header ×2 diagnostics ×3 profiles)
- `npm run e2e` → **20/20** Playwright (+PDF download AARRR + PLG)
- `npm run screenshot` → regenerated

### What shipped
- **`lib/pdf-report.ts`** — pure `buildReportPdf(diagnostic, result)` → PDF bytes
  via **jsPDF**: score, breakdown-vs-median bars, top experiments, the full
  action playbook, honest-benchmark footer, multi-page with page numbers. No DOM
  → unit-tested in node; runs in the browser.
- **`ShareCard`** — "Download PDF" button (jsPDF lazy-loaded on click); the PNG
  button is now labelled "Download PNG". Filenames: `…-<score>.pdf`.
- **Dependency** — added `jspdf` (MIT, pure-JS, client-side).

### Decisions
- **jsPDF** over print-to-PDF: deterministic, node-testable, zero-backend.
- PDF is built from the same `(diagnostic, result)` as the rest of the pipeline,
  so it stays in sync with both diagnostics + the playbook automatically.

## 2026-06-16 — v1.3.0: actionable playbook output ✅

**Released v1.3.0** — weak stages now come with a concrete, exportable playbook.
See `PRD.md` (Slice 2).

### Verification (gate — all green)
- `npm run build` → compiles + type-checks
- `npm test` → **197/197** unit (+playbook integrity/export, +i18n parity ×9)
- `npm run e2e` → **18/18** Playwright (+playbook render + .md export ×2)
- `npm run screenshot` → regenerated

### What shipped
- **`lib/playbook.ts`** — per-dimension, **band-aware** tactics. Each tactic has
  why · concrete steps · the metric to watch · effort · horizon. `getPlaybook`
  tailors to the score band; `buildPlaybookMarkdown` renders an exportable,
  **PII-free, timestamp-free** Markdown doc. Both diagnostics fully covered.
- **`datasets/playbooks.md`** — documented content table + provenance (editorial,
  synthesized from common growth practice, honestly labelled — not licensed).
- **`components/PlaybookSection.tsx`** — "Your action playbook" results section
  with **Copy** + **Download .md** export; folds into the PDF next slice.
- **i18n** — 6 new `playbook.*` keys translated across all 9 locales (parity test
  enforces completeness).

### Decisions
- Playbook is band-aware (foundational tactics for weak stages, advanced for
  healthy ones) and never empty for a known dimension.
- Export = clipboard + `.md` download now; PDF inclusion in Slice 3.

## 2026-06-16 — v1.2.0: shared engine + 2nd diagnostic (PLG) ✅

**Released v1.2.0** — the AARRR tool is now a **multi-diagnostic platform** on a
shared engine. Still zero-backend & privacy-first. See `PRD.md` (Slice 1).

### Verification (gate — all green)
- `npm run build` → compiles + type-checks
- `npm test` → **192/192** unit (was 155; +engine, +diagnostics, +PLG share-model)
- `npm run e2e` → **15/15** Playwright (AARRR loop + PLG selectable/share/OG + axe ×3)
- `npm run screenshot` → regenerated `docs/screenshot.png`

### What shipped
- **`lib/engine.ts`** — generic, pure, Edge-safe scoring core. A diagnostic is a
  `Diagnostic` descriptor (dimensions + questions + experiments); scoring,
  bottleneck ranking, ICE selection, and the share codec all operate on it.
- **`lib/scoring.ts` refactor** — AARRR is now `AARRR_DIAGNOSTIC` and every
  exported function **delegates to the engine**. Signatures/outputs unchanged;
  the 155 legacy tests + a new explicit parity test are the guard.
- **`lib/diagnostics/plg.ts`** — second diagnostic: **PLG Readiness** (5×3:
  Time-to-Value · Self-Serve · PQL · In-Product Virality · Expansion-Led
  Revenue) with experiments + recommendations.
- **`lib/diagnostics/index.ts`** — registry + **multi-diagnostic share codec**:
  AARRR keeps emitting `1.<digits>` (back-compat); others emit the
  self-describing `2.<id>.<digits>`. v1 + legacy base64 still decode. No PII.
- **Diagnostic-agnostic pipeline** — `share-model`, OG/report route, and page
  metadata now read the descriptor (name, colors, dimensions); benchmarks +
  recommendations generalized (`compareDiagnosticToBenchmark`,
  `getDimensionRecommendation`). PLG medians documented in `datasets/`.
- **Selectable UI** — landing has a diagnostic picker; `?d=plg` deep-links; the
  whole quiz/results/share/OG flow is descriptor-driven. AARRR i18n preserved
  via a label fallback (`lib/labels.ts`).

### Decisions
- **2nd diagnostic = PLG Readiness** — same 5×3 shape reuses the codec/OG/report
  pipeline cleanly; honestly authorable.
- **Token v2 = `2.<id>.<digits>`** — self-describing, URL-safe, no PII.
- Engine is the single implementation; AARRR rides on it (no duplicate logic).

## 2026-06-16 — v1.1.0: the growth loop ✅

**Released v1.1.0** — the tool now markets itself, still **zero-backend &
privacy-first**. All goal criteria met and verified. See `PLAN.md` (v1.1 plan).

### Verification (final gate — all green)
- `npm run build` → compiles + type-checks (routes: `/`, `/api/lead`, `/api/og`)
- `npm test` → **155/155** unit tests
- `npm run e2e` → **9/9** Playwright (share loop + OG + download + axe a11y)
- `npm run screenshot` → regenerated `docs/screenshot.png`
- Lighthouse (desktop): **Perf 100 · A11y 100 · Best-Practices 96 · SEO 100**

### What shipped
- **Compact, no-PII share codec** — `?r=1.<15 digits>` (version + one answer
  digit per question). No email/name/timestamp; recomputes the exact result.
  Legacy base64 tokens still decode. Edge-safe (dropped Buffer).
- **Ungated shared views** — opening a `?r=` link skips the email gate and shows
  the full breakdown + a "take your own audit" CTA. That's the loop.
- **Dynamic OG/share image** — `app/api/og` (next/og, Edge) renders a branded
  card (1200×630 social `og:image` + 1200×1500 `?v=report`). `page.tsx` is now a
  server component with `generateMetadata` setting a score-aware title + image.
- **Downloadable PNG report** — client-side fetch of the OG report image.
- **Benchmark + recommendations** — `lib/benchmarks.ts` ("you vs median",
  labelled synthesized placeholders in `datasets/benchmarks.md`) and
  `lib/recommendations.ts` (per-stage advice by band), surfaced in the dashboard.
- **a11y** — axe-clean (WCAG 2.0/2.1 A & AA) on landing + shared pages: raised
  dim text to AA contrast, added `prefers-reduced-motion`, share-input label,
  in-text link underlines.
- **e2e infra** — Playwright suite + `@axe-core/playwright`; Lighthouse report
  committed under `docs/lighthouse/`.
- **Version** 1.0.0 → 1.1.0; tagged `v1.1.0`.

### Decisions
- **next/og can't be unit-tested** (needs Next's bundler), so all OG data logic
  lives in a pure, unit-tested `lib/share-model.ts`; the route is a thin JSX
  layer, and image validity is asserted by the Playwright e2e suite.
- **Lighthouse uses the desktop preset** (desktop-first B2B tool); no
  `VERCEL_TOKEN` present, so the deploy command is documented, not run.

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
