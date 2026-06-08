# Growth Health Score

**Free AARRR growth audit for startups and SaaS founders.**

Answer 15 diagnostic questions across the 5 AARRR stages — Acquisition, Activation, Retention, Revenue, Referral — and get a 0–100 growth health score, a ranked bottleneck analysis, and three ICE-prioritized experiments to fix your biggest gaps.

Built and open-sourced by [GrowthHackers](https://growthackers.io).

---

![Growth Health Score screenshot placeholder](https://placehold.co/1200x630/0a0e1a/5c68f5?text=Growth+Health+Score+%E2%80%94+AARRR+Audit)

---

## What it is

Most founders know they have growth problems. Few know *which* problems to fix first.

The Growth Health Score is a structured self-diagnostic built on the AARRR framework. It takes about 3 minutes to complete and outputs:

- **Stage scores (0–100)** for each of the five AARRR stages, weighted by typical SaaS leverage
- **Overall weighted score (0–100)** reflecting the health of your full growth engine
- **Top 3 bottleneck stages** ranked by how much they're dragging down your score
- **3 ICE-prioritized experiments** — Impact × Confidence ÷ Effort — targeted at your weakest stages
- **Shareable result URL** — your score is base64-encoded in the query string, no backend required

The full report is gated behind an email capture. The API stub (`POST /api/lead`) logs the lead server-side and returns `{ ok: true }` — wiring to HubSpot, Intercom, or Supabase is a one-file change.

---

## Why we built it

Growth agencies talk to a lot of founders. Almost universally, the conversation starts with "we need more leads" — when the real issue is a 12% activation rate, or churn eating every new dollar of MRR.

A free, public diagnostic tool forces that honest conversation. If it also generates qualified pipeline for GrowthHackers, great. But it works equally well as a standalone open-source tool you fork and run yourself.

---

## Features

- 15 questions across 5 AARRR stages (3 per stage)
- Weighted scoring model: Retention and Revenue weighted highest (25% each), Referral lowest (10%)
- Per-stage raw score + weighted contribution displayed side-by-side
- Automatic bottleneck detection — top 3 weakest stages flagged
- ICE experiment bank: 3 experiments per stage, best one selected per bottleneck
- Email gate before full report reveal (stub API, no external dependency)
- URL-encoded shareable results (Base64 JSON, no database)
- One-click copy summary for Slack/Twitter
- Responsive dark UI — works on mobile and desktop
- Pure TypeScript scoring engine with zero runtime dependencies
- 30+ unit tests covering scoring math, bottleneck detection, ICE selection, and encode/decode

**Keywords:** free growth audit · AARRR growth score · startup growth diagnostic · growth health check · SaaS growth metrics · ICE framework · growth experiment prioritization · acquisition activation retention revenue referral · growth hacking tool

---

## Quick start

```bash
# Clone
git clone https://github.com/growthackers/gh-growth-score.git
cd gh-growth-score

# Install
npm install

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Run tests

```bash
npm test
```

The test suite covers:

- `computeStageScore` — zero, max, midpoint, partial answers
- `computeOverallScore` — weight correctness for each stage
- `findBottlenecks` — correct ranking, n parameter, tie handling
- `computeICE` — formula correctness, relative comparisons
- `selectTopExperiments` — stage matching, ICE ranking, n results
- `scoreSubmission` — full pipeline integration tests
- URL encode/decode — round-trip fidelity, invalid token handling
- `getScoreLabel` — all four urgency brackets

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
| `STAGE_CONFIGS` | Stage weights, labels, colors — change weights here |
| `QUESTIONS` | All 15 questions with 5-option answer scale |
| `EXPERIMENT_BANK` | 3 experiments per stage — add or swap freely |
| `scoreSubmission()` | Full pipeline — pure function, no side effects |
| `computeICE()` | Impact × Confidence ÷ Effort |
| `findBottlenecks()` | N weakest stages |
| `encodeResultForURL()` | Base64 encode answers for sharing |

---

## Wire the email gate to a real CRM

Edit `app/api/lead/route.ts`. The stub already validates email + score. Replace the `console.log` with:

- **HubSpot:** `fetch("https://api.hubapi.com/contacts/v1/contact/", { method: "POST", ... })`
- **Supabase:** `supabase.from("leads").insert({ email, score, ... })`
- **Intercom:** `client.contacts.create({ email, ... })`
- **n8n / Make webhook:** `fetch(process.env.WEBHOOK_URL, { method: "POST", body: JSON.stringify(payload) })`

---

## Stack

- [Next.js 14](https://nextjs.org) (App Router)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Vitest](https://vitest.dev) for testing
- Zero external runtime dependencies

---

## Contributing

Pull requests welcome. A few ground rules:

1. Keep `lib/scoring.ts` pure — no network calls, no side effects
2. Add or update tests for any change to scoring logic
3. New experiments: add to `EXPERIMENT_BANK`, not hardcoded in components
4. UI changes: keep the dark theme, keep it responsive

---

## License

MIT — use it, fork it, white-label it, sell it. Attribution appreciated but not required.

---

## About GrowthHackers

[GrowthHackers](https://growthackers.io) is a growth agency specializing in B2B SaaS. We help founders go from stalled to scaling using the same AARRR framework behind this tool — with a full team to actually run the experiments.

[Book a free growth audit call →](https://growthackers.io/audit)
