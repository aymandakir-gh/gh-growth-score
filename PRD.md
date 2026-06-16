# PRD — gh-growth-score v2.0.0

> ✅ **SHIPPED 2026-06-16 (v2.0.0).** All 8 criteria met and verified; released
> through tags v1.2.0 → v2.0.0, each CI-green (lint · test · build · e2e). Final
> gate: 264 tests (228 unit + 36 e2e), Lighthouse 100/100/96/100, multi-agent
> adversarial review with every real finding fixed + regression-tested. See
> `STATUS.md` for the per-slice log and the review findings.


> **The multi-diagnostic growth platform.** v1.1.0 shipped a single AARRR
> diagnostic with a self-marketing growth loop. v2.0.0 turns it into a
> **platform**: a shared diagnostic engine powering two audits, an actionable
> playbook, PDF export, an embeddable widget, `?lang=` localization, and
> per-industry benchmark depth — all still **zero-backend & privacy-first** (no
> DB, no PII leaves the browser; the whole loop works in the static build).
>
> This is **extend, not rebuild**. `lib/scoring.ts` keeps its public API and all
> 155 existing tests stay green; AARRR is re-expressed as one descriptor on a new
> generic engine, and everything new plugs into that engine.

Status log lives in `STATUS.md`. Each numbered slice ships behind its own tag
(`v1.2.0` → `v2.0.0`), CI-green (lint · test · build · e2e), verified by
building + running unit + e2e + screenshot + axe before moving on.

---

## Non-negotiable invariants (every slice)

1. **Zero-backend.** No database, no server-stored results. Everything derives
   from pure functions + the URL. The optional `/api/lead` gate stays optional.
2. **Privacy-first.** Share tokens carry only answer digits + a diagnostic id —
   never email, name, company, free text, or timestamps. `?lang=` /
   `?industry=` are non-PII view state. **Never** `localStorage` for locale.
3. **Edge-safe core.** `lib/engine.ts` + descriptors + share codec are pure
   string/number work so the `next/og` Edge route can import them.
4. **Honest data.** All benchmark + playbook content is labelled
   synthesized/directional with documented provenance in `datasets/`.
5. **Spec-first + tested.** Every feature ships with tests asserting real
   behavior. Target **≥240** passing (unit + e2e). Lighthouse stays **≥95** on
   all four categories.

---

## Slice 1 — Shared diagnostic engine + second diagnostic  → `v1.2.0`

**Goal criterion 1.** A second diagnostic alongside AARRR sharing the same
engine + share codec + OG/report pipeline; both selectable; tested.

- `lib/engine.ts` — generic, pure, Edge-safe core:
  - `Diagnostic` descriptor: `{ id, slug, name, tagline, dimensions[],
    questions[], experiments{}, benchmarks…, recommendations… }`.
  - `scoreDiagnostic(diagnostic, answers)`, `computeDimensionScore`,
    `computeOverallScore`, `findBottlenecks`, `computeICE`,
    `selectTopExperiments`, `getScoreLabel` — generalized from scoring.ts and
    **algorithmically identical** for the AARRR descriptor.
  - Multi-diagnostic share codec: `encodeForDiagnostic(id, answers)` →
    `2.<diagId>.<digits>`; `decodeShareToken(token)` →
    `{ diagnosticId, answers }`. **Back-compat:** `1.<15 digits>` and legacy
    base64 JSON still decode as AARRR; AARRR keeps **emitting** `1.<digits>`.
- `lib/diagnostics/aarrr.ts` — AARRR as a descriptor built from scoring.ts data.
- `lib/diagnostics/plg.ts` — **PLG / Product-Led-Growth Readiness** audit: 5
  dimensions (Time-to-Value, Self-Serve, Product-Qualified Leads, In-Product
  Virality, Expansion-Led Revenue) × 3 questions, weighted; experiments +
  recommendations + playbook authored here.
- `lib/diagnostics/index.ts` — registry: `DIAGNOSTICS`, `getDiagnostic(id)`,
  `listDiagnostics()`, `DEFAULT_DIAGNOSTIC_ID = "aarrr"`.
- `lib/scoring.ts` — refactor function **bodies** to delegate to `engine.ts`
  with the AARRR descriptor; **signatures + outputs unchanged** (155 tests = the
  parity guard). Keep all AARRR data + types as the AARRR source of truth.
- **Selectable:** the landing intro offers both audits (`?d=plg` /
  `?d=aarrr`); `HomeClient` routes to the chosen diagnostic; results + OG +
  share are diagnostic-aware.
- **Tests:** engine units, PLG descriptor validity (weights sum to 1, 5 options
  each, ids unique), codec round-trip per diagnostic + back-compat, AARRR parity
  (engine output == legacy scoring output).

## Slice 2 — Actionable playbook output  → `v1.3.0`

**Goal criterion 2.** Per-weak-dimension tailored tactics with concrete next
steps, exportable; from a documented, honestly-labelled content table.

- `datasets/playbooks.md` — the content table (per diagnostic, per dimension, a
  band-aware set of concrete tactics: title · why · steps · metric · effort ·
  horizon), labelled as an editorial playbook (provenance documented).
- `lib/playbook.ts` — `getPlaybook(diagnosticId, dimension, score)` →
  ordered tactics; `buildPlaybookMarkdown(result)` → exportable markdown for the
  weakest dimensions.
- UI: a **Playbook** section in results (tactics per bottleneck) + "Copy
  playbook (Markdown)" export; folded into the PDF (Slice 3).
- **Tests:** content-table integrity (every dimension × band resolves, no empty
  steps), markdown export shape, UI render.

## Slice 3 — Client-side PDF export  → `v1.4.0`

**Goal criterion 3.** PDF export (not just PNG) of the full report, client-side;
tested.

- Add `jspdf` (MIT, pure-JS, runs in browser → zero-backend).
- `lib/pdf-report.ts` — `buildReportPdf(model)` → `Uint8Array`: cover/score,
  breakdown vs median bars, bottlenecks + recommendations, playbook, top
  experiments, honest-benchmark footer. Pure (no DOM) → unit-testable in node.
- UI: "Download PDF" button in `ShareCard` saves `…-report.pdf` client-side.
- **Tests:** unit asserts `%PDF-` header + non-trivial size + content for both
  diagnostics; e2e clicks Download PDF and asserts a `.pdf` download.

## Slice 4 — Embeddable widget  → `v1.5.0`

**Goal criterion 4.** Script-tag embed other sites drop in, self-contained, no
backend, documented with a copy-paste snippet; e2e-tested.

- `app/embed/page.tsx` (+ client) — standalone, minimal-chrome audit honoring
  `?d=` and `?lang=`; no outer nav/footer; safe to iframe.
- `public/embed.js` — loader: reads `data-diagnostic` / `data-lang` /
  `data-base`, injects a responsive iframe to `/embed`, auto-resizes via
  `postMessage` (height beacon from the embed page). Self-contained, no backend.
- README + `docs/EMBED.md` — copy-paste `<script>` snippet.
- **Tests:** unit for the height-beacon/script attributes parsing where pure;
  e2e loads a host page with the real `embed.js` and asserts an iframe to
  `/embed` is created and the audit renders inside it.

## Slice 5 — Localization via `?lang=` + AR RTL  → `v1.6.0`

**Goal criterion 5.** UI + results in ≥5 languages via `?lang=` URL param (never
localStorage), with an AR RTL pass; tested.

- `lib/i18n.ts` already ships 9 locales (EN, AR-RTL, IT, NL, ZH, ES, FR, DE,
  PT-BR). Wire **`?lang=`**: `I18nProvider` resolves locale from the URL param
  on load (validated; fallback `en`); selector updates `?lang=` via
  `history.replaceState` (shareable, reload-stable) — **no localStorage**.
- New v2 surfaces (diagnostic picker, playbook, industry selector, embed) get
  i18n keys; `getScoreLabel` band labels localized. Honest scope note: question
  *content* stays English (same as v1) — "UI + results" = interface + results
  presentation.
- AR RTL pass across the new surfaces (logical props already used).
- **Tests:** unit (locale resolution from `?lang=`, never touches localStorage,
  key parity across new keys); e2e (`?lang=ar` → `dir=rtl` + Arabic chrome;
  `?lang=fr` → French chrome) + axe stays clean in RTL.

## Slice 6 — Benchmark depth (per-industry × per-dimension)  → `v1.7.0`

**Goal criterion 6.** Per-industry + per-stage median tables (documented,
honestly synthesized/labelled) powering "you vs median" across both diagnostics.

- `datasets/benchmarks.md` — extend to **per-industry × per-dimension** medians
  for **both** diagnostics (industries: All / B2B SaaS / PLG SaaS / Marketplace
  / Fintech), labelled synthesized + how-to-replace.
- `lib/benchmarks.ts` — generalize to `getBenchmarks(diagnosticId, industry)` +
  `compareToBenchmark(diagnosticId, scores, industry)`. **Back-compat:** the
  default (`aarrr`, `all`) reproduces the existing AARRR medians exactly.
- UI: an **industry selector** on results (+ optional `?industry=`), re-running
  "you vs median" live. OG/report/PDF read the selected industry from the token
  context (default `all`).
- **Tests:** table integrity (every industry × dimension present, 0–100),
  default-parity with v1 medians, comparison correctness, UI switch.

## Slice 7 — Quality gate: a11y + Lighthouse + CI e2e  → `v1.8.0`

**Goal criterion 7.** ≥240 tests; Lighthouse ≥95 ×4 (committed); CI green incl.
next build + e2e.

- Expand e2e to cover: second diagnostic share loop, OG for `2.plg.…`, PDF,
  embed, i18n (`?lang=ar`/`fr`), industry switch; axe on all new surfaces +
  `/embed` + RTL.
- Update `.github/workflows/ci.yml` to also **build + run Playwright e2e**
  (install browsers) so CI matches local gates.
- Re-run Lighthouse on the production build; commit the report; keep all four
  categories **≥95**.

## Slice 8 — Adversarial review + README/demo + release  → `v1.9.0` → `v2.0.0`

**Goal criterion 8.** README/demo refreshed (vhs/gif), `vercel.json` valid
(turnkey); released through tags. Multi-agent adversarial review before
`v2.0.0`; fix every real finding; add regression tests. No secrets.

- Multi-agent adversarial review (Workflow): correctness, privacy/PII leakage in
  tokens & embed `postMessage`, codec edge cases, i18n/RTL, PDF/embed, a11y,
  benchmark honesty. Fix every real finding + add a regression test per fix.
- README: two diagnostics, playbook, PDF, embed snippet, `?lang=`, industries;
  refresh screenshot + a `vhs`/gif demo of the loop.
- Verify `vercel.json` turnkey; document `npx vercel --prod` (no `VERCEL_TOKEN`
  in env → do not deploy).
- Final full gate, then tag **`v2.0.0`**.

---

## Decisions (encoded so the session can run unattended)

- **Second diagnostic = PLG Readiness** (complements AARRR; same 5×3 shape so it
  reuses the codec/OG/report/PDF pipeline cleanly and is honestly authorable).
- **Token format v2 = `2.<diagId>.<digits>`** (self-describing, URL-safe, no
  PII). AARRR still emits `1.<digits>` for back-compat; both decode.
- **PDF lib = jsPDF** (client-side, MIT, no backend, node-testable).
- **Embed = iframe loader** (strong isolation, trivially self-contained, no
  backend) over a web component.
- **Locale source = `?lang=` only** (shareable, reload-stable, non-PII); the
  selector writes the param, never localStorage.
- **Industries** are a small, clearly-synthesized set; default `all` == v1.
- **Deploy:** no `VERCEL_TOKEN` present → document `npx vercel --prod`, do not
  run. Tag releases on `main`; CI gates (lint/test/build/e2e) green per tag.
