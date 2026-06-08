# Growth Health Score

**Free, open-source AARRR growth audit.**

Answer 15 diagnostic questions across the five AARRR stages — Acquisition, Activation, Retention, Revenue, Referral — and get a 0–100 growth health score, a ranked bottleneck analysis, and three ICE-prioritized experiments to fix your biggest gaps. Takes about 3 minutes; you see your score with no signup.

---

![Growth Health Score screenshot placeholder](https://placehold.co/1200x630/0a0e1a/5c68f5?text=Growth+Health+Score+%E2%80%94+AARRR+Audit)

---

## What it is

Most founders know they have growth problems. Few know *which* problems to fix first.

Growth Health Score is a structured self-diagnostic built on the AARRR framework. It outputs:

- **Stage scores (0–100)** for each of the five AARRR stages, weighted by typical leverage
- **Overall weighted score (0–100)** reflecting the health of your full funnel
- **Top 3 bottleneck stages** ranked by how much they're dragging down your score
- **3 ICE-prioritized experiments** — Impact × Confidence ÷ Effort — targeted at your weakest stages
- **Shareable result URL** — your score is base64-encoded in the query string, no backend required

The full report is gated behind an optional email step. The API stub (`POST /api/lead`) logs the lead server-side and returns `{ ok: true }` — wiring to any CRM is a one-file change.

---

## Features

- 15 questions across 5 AARRR stages (3 per stage)
- Weighted scoring: Retention and Revenue highest (25% each), Referral lowest (10%)
- Per-stage raw score + weighted contribution side-by-side
- Automatic bottleneck detection — top 3 weakest stages flagged
- ICE experiment bank: 3 per stage, best one selected per bottleneck
- Optional email gate before the full report (stub API, no external dependency)
- URL-encoded shareable results (Base64 JSON, no database)
- One-click copy summary
- Responsive dark UI — mobile and desktop
- Pure TypeScript scoring engine, zero runtime dependencies
- 40+ unit tests covering scoring math, bottleneck detection, ICE selection, encode/decode

**Keywords:** free growth audit · AARRR growth score · startup growth diagnostic · growth health check · growth metrics · ICE framework · growth experiment prioritization · acquisition activation retention revenue referral

---

## Quick start

```bash
git clone https://github.com/aymandakir-gh/gh-growth-score.git
cd gh-growth-score
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Run tests

```bash
npm test
```

Covers scoring math, weighting, bottleneck ranking, the ICE formula, experiment selection, the full pipeline, and URL encode/decode round-trips.

---

## Build for production

```bash
npm run build
npm start
```

---

## Customize the scoring model

Everything lives in `/lib/scoring.ts`:

| Export | Purpose |
|---|---|
| `STAGE_CONFIGS` | Stage weights, labels, colors |
| `QUESTIONS` | All 15 questions with a 5-option scale |
| `EXPERIMENT_BANK` | 3 experiments per stage |
| `scoreSubmission()` | Full pipeline — pure function |
| `computeICE()` | Impact × Confidence ÷ Effort |
| `findBottlenecks()` | N weakest stages |
| `encodeResultForURL()` | Base64 encode answers for sharing |

---

## Wire the email gate to a CRM

Edit `app/api/lead/route.ts`. The stub already validates email + score — replace the `console.log` with your provider (HubSpot, Supabase, a webhook, etc.).

---

## Stack

- [Next.js](https://nextjs.org) (App Router) · [TypeScript](https://www.typescriptlang.org) · [Tailwind CSS](https://tailwindcss.com) · [Vitest](https://vitest.dev)
- Zero external runtime dependencies

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

## Questions?

Open an issue, or reach out at [growthackers.io](https://growthackers.io).
