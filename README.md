# Growth Health Score — Free AARRR diagnostic for SaaS founders

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/aymandakir-gh/gh-growth-score?style=social)](https://github.com/aymandakir-gh/gh-growth-score)

**Diagnose your growth engine in 3 minutes.** Answer 15 questions across the 5 AARRR stages, get a 0–100 score per stage, identify your top bottlenecks, and receive 3 ICE-prioritized experiments to fix them.

Built by [GrowthHackers](https://growthackers.io) — free and open-source forever.

![Screenshot](./screenshot-placeholder.png)
> _Add a real screenshot here after your first local run (`npm run dev`, open localhost:3000, take a screenshot, save as `screenshot-placeholder.png`)._

---

## What it does

- **15 diagnostic questions** — 3 per AARRR stage (Acquisition, Activation, Retention, Revenue, Referral)
- **0–100 score per stage** — weighted by growth-model importance
- **Bottleneck detection** — surfaces your top 3 weakest stages
- **ICE-prioritized experiments** — 3 actionable experiments ranked by Impact × Confidence ÷ Effort
- **Shareable results** — encoded in the URL, no account needed
- **Email gate** — captures lead email before revealing full breakdown (optional, graceful degradation without backend)

---

## How it works

```
Answer 15 questions  →  Get your AARRR score  →  See bottlenecks + experiments
      (~3 min)              (0–100 per stage)        (ICE-prioritized roadmap)
```

---

## Quick start

```bash
git clone https://github.com/aymandakir-gh/gh-growth-score.git
cd gh-growth-score
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Self-hosting

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `LEADS_API_URL` | No | URL of the gh-leads-core service. If unset, lead capture is skipped gracefully — the app still works fully. |
| `NODE_ENV` | No | `development` or `production` |

Create `.env.local` from the example:

```bash
cp .env.example .env.local
# Edit .env.local and set LEADS_API_URL if you have a leads backend
```

### Running tests

```bash
npm test
```

41 unit tests cover the scoring engine (`lib/scoring.ts`): scoring math, weighting, bottleneck ranking, ICE formula, experiment selection, URL encode/decode round-trips.

---

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aymandakir-gh/gh-growth-score)

After deploying, add the `LEADS_API_URL` environment variable in your Vercel project settings if you want lead capture. Leave it empty to run without a backend — the app degrades gracefully.

---

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Vitest** (unit tests)
- No external UI libraries — pure Tailwind components

---

## Project structure

```
app/
  page.tsx              # Root page — quiz or results
  layout.tsx            # Metadata, global styles
  globals.css           # Tailwind base + custom tokens
  api/lead/route.ts     # Lead capture proxy (server-side, keeps LEADS_API_URL private)
components/
  GrowthQuiz.tsx        # Quiz orchestrator (intro + question flow)
  StageProgress.tsx     # AARRR step progress bar (desktop labels + mobile dots)
  QuestionCard.tsx      # Single question with 5 options
  ResultsDashboard.tsx  # Results view (gated behind email)
  EmailGate.tsx         # Email capture form with score preview
  ScoreGauge.tsx        # SVG arc gauge for overall score
  StageScoreCard.tsx    # Per-stage score card with bar + bottleneck badge
  ExperimentCard.tsx    # ICE experiment card
  ShareCard.tsx         # Share URL + tweet button
lib/
  scoring.ts            # All questions, scoring logic, experiments (single source of truth)
  scoring.test.ts       # 41 unit tests
```

---

## Customize the scoring model

Everything lives in `lib/scoring.ts`:

| Export | Purpose |
|---|---|
| `STAGE_CONFIGS` | Stage weights, labels, colors |
| `QUESTIONS` | All 15 questions with a 5-option scale |
| `EXPERIMENT_BANK` | 3 experiments per stage |
| `scoreSubmission()` | Full scoring pipeline — pure function |
| `computeICE()` | Impact × Confidence ÷ Effort |
| `findBottlenecks()` | N weakest stages |
| `encodeResultForURL()` | Base64 encode answers for sharing |

---

## Wire the email gate to a CRM

Edit `app/api/lead/route.ts`. The route already validates email + score and proxies to `LEADS_API_URL/api/lead`. Replace `LEADS_API_URL` with your backend URL, or swap the upstream call for your CRM SDK (HubSpot, Supabase, etc.).

---

## Contributing

PRs welcome:

1. Keep `lib/scoring.ts` pure — no network calls, no side effects
2. Add/update tests for any scoring change
3. New experiments go in `EXPERIMENT_BANK`
4. Keep the UI dark and responsive

---

## License

MIT — use it, fork it, white-label it. Attribution appreciated, not required.

---

Built with care by [GrowthHackers](https://growthackers.io).
