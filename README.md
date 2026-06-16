# Growth Health Score — free AARRR diagnostic for SaaS founders

[![CI](https://github.com/aymandakir-gh/gh-growth-score/actions/workflows/ci.yml/badge.svg)](https://github.com/aymandakir-gh/gh-growth-score/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/aymandakir-gh/gh-growth-score?style=social)](https://github.com/aymandakir-gh/gh-growth-score)

**Diagnose your growth engine in 3 minutes.** Answer 15 questions across the 5
AARRR stages, get a 0–100 score per stage, find your top bottlenecks, and walk
away with 3 ICE-prioritized experiments to fix them.

Built by [GrowthHackers](https://growthackers.io) — free and open-source forever.

**Live demo:** _<!-- add your deployed URL here, e.g. https://growth-score.vercel.app -->_ — deploy your own in one click ↓

![Growth Health Score — landing page](./docs/screenshot.png)

> _Screenshot is real and reproducible: `npm run build && npm run screenshot`
> regenerates `docs/screenshot.png` via the committed Playwright script._

---

## What it does

- **15 diagnostic questions** — 3 per AARRR stage (Acquisition, Activation, Retention, Revenue, Referral)
- **0–100 score per stage** — weighted by growth-model importance
- **Bottleneck detection** — surfaces your 3 weakest stages
- **ICE-prioritized experiments** — 3 actionable experiments ranked by Impact × Confidence ÷ Effort
- **Tailored recommendations + benchmark** — per-stage advice and "your score vs. industry median"
- **Built-in growth loop** — shareable result link, auto-generated social preview image, downloadable report (see below)
- **9 languages** — EN, AR (RTL), IT, NL, ZH, ES, FR, DE, PT-BR
- **Zero backend, privacy-first** — no database, no PII leaves the browser; the optional email gate degrades gracefully

---

## The growth loop

The tool markets itself: every result is shareable, and shared links preview the
score on social — pulling new people in to take their own audit.

![Auto-generated share card](./docs/share-card.png)

- **Shareable result link.** Your full result is encoded in the URL — no account,
  no database. The format is `?r=1.<15 digits>`: a version tag plus one answer
  value (0–4) per question in fixed order (e.g. `?r=1.342013402230114`). That's
  the **entire** payload — no email, name, or timestamp, so it carries **no PII**.
  Opening the link recomputes the exact score and breakdown.
- **Dynamic share image.** `app/api/og` renders the branded card above from the
  token via `next/og`, so a pasted link previews the score on X/LinkedIn. It's a
  stateless render of the URL — nothing stored.
- **Ungated for recipients.** Opening a shared link shows the full breakdown
  immediately (it's already public, no PII) with a CTA to take your own audit —
  that's the loop.
- **Downloadable report.** One click saves a branded PNG report (score, AARRR
  breakdown vs. median, bottlenecks, top experiments).

---

## Quick start

```bash
git clone https://github.com/aymandakir-gh/gh-growth-score.git
cd gh-growth-score && npm install && npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No env vars required — the
app runs fully out of the box.

---

## How the AARRR score works

Everything is a pure function in [`lib/scoring.ts`](lib/scoring.ts) (the single
source of truth — the UI just renders what it returns).

**1. Answer the questions.** Each of the 15 questions has a 5-point scale, scored
`0` (critical gap) to `4` (best-in-class).

**2. Score each stage (0–100).** A stage's raw score is the share of points
earned across its 3 questions:

```
stageScore = round( sum(answers) / (questions × 4) × 100 )
```

**3. Weight into an overall score.** Stages are weighted by their typical
leverage in a SaaS growth model (weights sum to 1.0):

| Stage | Weight | Why |
|---|---|---|
| 🎯 Acquisition | 20% | Top-of-funnel reach |
| ⚡ Activation | 20% | First "aha moment" |
| 🔄 Retention | 25% | Compounding base — highest leverage |
| 💰 Revenue | 25% | Monetization & expansion — highest leverage |
| 📣 Referral | 10% | Organic word-of-mouth |

```
overallScore = round( Σ stageScore × weight )
```

**4. Find the bottlenecks.** The 3 lowest-scoring stages are flagged as your
bottlenecks (`findBottlenecks`).

**5. Prescribe experiments.** From each bottleneck stage, the single
highest-**ICE** experiment is selected from the [`EXPERIMENT_BANK`](lib/scoring.ts):

```
ICE = round( Impact × Confidence ÷ Effort )      // all 1–10, higher = do first
```

You get the top 3 experiments, prioritized — a concrete roadmap, not just a number.

**6. Compare + recommend.** Each stage is compared to an industry median
(`lib/benchmarks.ts`) — "your score vs. median" — and each bottleneck gets a
tailored recommendation by score band (`lib/recommendations.ts`).

> The benchmark medians in [`datasets/benchmarks.md`](datasets/benchmarks.md) are
> **honestly-labelled synthesized placeholders** (no licensed dataset is bundled
> with this OSS repo). Swap them for real medians and the UI labelling updates.

---

## The email gate (decision: kept, env-configured, optional)

This OSS build **keeps the email gate but makes it fully optional**, so the tool
works with **zero backend**:

- Submitting the form `POST`s to `app/api/lead/route.ts`, a server-side proxy
  that keeps `LEADS_API_URL` private (never exposed to the browser).
- **If `LEADS_API_URL` is set**, the lead is forwarded to your backend / CRM.
- **If it's unset** (the default), the route logs the score only (no PII) and
  returns `ok` so the results screen still unlocks. Nothing is stored, nothing
  breaks. No secrets are committed.

The endpoint validates email + score and is **rate-limited to 10 requests /
minute / IP** to blunt abuse. To wire it to a real CRM, edit
`app/api/lead/route.ts` (HubSpot, Supabase, your own API, etc.).

> Prefer no gate at all? Render `ResultsDashboard` without `EmailGate` in
> `components/ResultsDashboard.tsx` — the scoring is pure and never needs the gate.

---

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aymandakir-gh/gh-growth-score)

Turnkey — `vercel.json` is `{ "framework": "nextjs" }`, so there are no required
secrets and no build config to wire up. From a clone, one command ships it:

```bash
npx vercel --prod
```

To enable lead capture after deploying, add `LEADS_API_URL` (and optionally
`NEXT_PUBLIC_SENTRY_DSN` / `NEXT_PUBLIC_POSTHOG_KEY`) in **Project Settings →
Environment Variables**. Leave them empty to run backend-free.

---

## Self-hosting — environment variables

All optional. The app degrades gracefully when any are absent.

| Variable | Purpose |
|---|---|
| `LEADS_API_URL` | gh-leads-core / CRM endpoint. Unset = lead capture skipped (app still works). |
| `NEXT_PUBLIC_SITE_URL` | Absolute base for OG/share image URLs. Defaults to the prod host. |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error monitoring. Unset = disabled. |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog product analytics. Unset = disabled. |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host (defaults to EU cloud). |

```bash
cp .env.example .env.local   # then fill in only what you need
```

---

## Tests, CI & quality

```bash
npm test     # 155 unit tests (Vitest)
npm run lint # next lint (eslint-config-next)
npm run build
npm run e2e   # Playwright: share loop + OG route + axe a11y (needs a build)
```

GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs
**install → lint → test → build** on every push and PR to `main`.

- **Unit (Vitest):** scoring engine, the result codec, benchmarks,
  recommendations, share-model, the `/api/lead` route (validation, rate
  limiting, fallback, proxy), the rate limiter, i18n, and `LanguageSelector`.
- **E2E (Playwright):** the share-link round-trip, OG/report image routes, the
  download, and **axe** accessibility scans (WCAG 2.0/2.1 A & AA, clean).
- **Lighthouse** (desktop, committed under [`docs/lighthouse/`](docs/lighthouse/SUMMARY.md)):
  **Performance 100 · Accessibility 100 · Best Practices 96 · SEO 100**.

---

## Stack

- **Next.js 14** (App Router) · **TypeScript** · **Tailwind CSS**
- **Vitest** unit tests · **Playwright** e2e + axe a11y + screenshot capture
- **`next/og`** dynamic share images (Edge)
- **Sentry + PostHog** observability (optional, graceful degrade)
- No external UI libraries — pure Tailwind components

---

## Project structure

```
app/
  page.tsx              # Server component — generateMetadata sets dynamic og:image for ?r=
  layout.tsx            # Metadata + metadataBase, PostHog provider, global styles
  api/lead/route.ts     # Lead capture proxy (validation + rate limit + graceful fallback)
  api/og/route.tsx      # Dynamic share-card image (next/og, Edge) — social + ?v=report
components/
  HomeClient.tsx        # Client shell — quiz/results, hydrates shared result from ?r=
  GrowthQuiz.tsx        # Quiz orchestrator (intro + question flow)
  ResultsDashboard.tsx  # Results — gauge, stage cards, benchmark, recommendations, experiments
  EmailGate.tsx         # Optional email capture (skipped for shared views)
  ScoreGauge.tsx        # SVG arc gauge · StageScoreCard.tsx · ExperimentCard.tsx
  LanguageSelector.tsx  # Accessible 9-language dropdown (WCAG 2.1 AA)
  ShareCard.tsx         # Share link + tweet + download report
lib/
  scoring.ts            # Questions, scoring, experiments, share codec — pure single source of truth
  benchmarks.ts         # Industry median table + compareToBenchmark
  recommendations.ts    # Per-stage tailored advice by score band
  share-model.ts        # Pure view-model for the OG card / report (unit-tested)
  rate-limit.ts         # In-memory sliding-window limiter for /api/lead
  i18n.ts               # 9-language flat-key dictionaries
datasets/benchmarks.md  # Documented benchmark medians (synthesized placeholders)
e2e/                    # Playwright: growth-loop.spec.ts + a11y.spec.ts
scripts/screenshot.mjs  # Playwright capture → docs/screenshot.png
```

---

## Customize the scoring model

Edit [`lib/scoring.ts`](lib/scoring.ts):

| Export | Purpose |
|---|---|
| `STAGE_CONFIGS` | Stage weights, labels, colors |
| `QUESTIONS` | All 15 questions with a 5-option scale |
| `EXPERIMENT_BANK` | 3 experiments per stage |
| `scoreSubmission()` | Full scoring pipeline — pure function |
| `computeICE()` | Impact × Confidence ÷ Effort |
| `findBottlenecks()` | N weakest stages |
| `encodeResultForURL()` | Base64 encode answers for sharing |

Keep it pure (no network calls, no side effects) and add tests for any change.

---

## Contributing

PRs welcome. Keep `lib/scoring.ts` pure, add/update tests for any scoring change,
put new experiments in `EXPERIMENT_BANK`, and keep the UI dark and responsive.

---

## License

MIT — use it, fork it, white-label it. Attribution appreciated, not required.

Built with care by [GrowthHackers](https://growthackers.io).
