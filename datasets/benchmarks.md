# AARRR benchmark medians

This table powers the **"your score vs. median"** comparison shown on the
results screen and the downloadable report. It lives in `lib/benchmarks.ts`;
this file is the human-readable source of record.

## ⚠️ Provenance — synthesized placeholders

These figures are **honest, hand-set placeholders**, **not** measurements from a
licensed benchmark dataset. No proprietary or paywalled benchmark data is
bundled with this open-source repo. The numbers were chosen to reflect the
*shape* commonly described in public SaaS growth writing (e.g. Activation and
Referral are typically the weakest AARRR stages; Retention and Revenue sit a
little higher for surviving companies). Treat them as directional, not
authoritative.

**They are labelled as estimates everywhere they surface in the UI.**

### How to replace with real data

Swap the values in `BENCHMARKS` (`lib/benchmarks.ts`) for medians from a source
you have the rights to use (e.g. your own anonymized aggregate of submissions, or
a licensed report such as OpenView/ChartMogul/SaaS Capital benchmarks), update
`BENCHMARK_SOURCE` / `BENCHMARK_AS_OF`, and remove the "estimate" labelling if
the data becomes authoritative. The scoring model is 0–100 per AARRR stage, so
benchmarks must be expressed on the same 0–100 scale.

## Median score per AARRR stage (0–100)

| Stage | Median | Rationale (directional) |
|---|---:|---|
| 🎯 Acquisition | 52 | Most teams run 1–2 measured channels; few have 3+ with clean CAC. |
| ⚡ Activation | 45 | Activation/time-to-value is a common weak point; many don't measure it. |
| 🔄 Retention | 50 | Survivors retain moderately; strong D30 + lifecycle systems are rarer. |
| 💰 Revenue | 48 | LTV:CAC and expansion motions exist but are often unoptimized. |
| 📣 Referral | 36 | Referral/virality is the most frequently neglected stage. |

**Overall median ≈ 47** (weighted by the model's stage weights:
Acquisition 20% · Activation 20% · Retention 25% · Revenue 25% · Referral 10%).

_Last set: 2026-06-16. Source: synthesized placeholder (see above)._

## Median score per PLG dimension (0–100)

The second diagnostic (PLG Readiness) shares the same engine, share codec, and
OG/report pipeline as AARRR, so it has its own benchmark table — same honest,
synthesized-placeholder caveat as above. Lives in `PLG_BENCHMARKS`
(`lib/benchmarks.ts`).

| Dimension | Median | Rationale (directional) |
|---|---:|---|
| ⏱️ Time-to-Value | 42 | Most teams have meaningful setup friction; sub-hour TTV is rare. |
| 🛒 Self-Serve Funnel | 48 | Self-serve signup is common; self-serve *purchase* is less so. |
| 🎯 Product-Qualified Leads | 38 | A scored, acted-on PQL model is still uncommon. |
| 🔗 In-Product Virality | 34 | Engineered, measured viral loops are the exception. |
| 📈 Expansion-Led Revenue | 46 | Expansion motions exist but are often reactive, NRR < 110%. |

**Overall PLG median ≈ 42** (weighted: TTV 25% · Self-Serve 25% · PQL 15% ·
Virality 15% · Expansion 20%).

> The tables above are the default **"All industries"** baseline. Per-industry
> depth is documented below.

## Per-industry × per-dimension medians

The results screen has an **industry selector** that re-runs "you vs median"
against an industry-specific table for **both** diagnostics, and the selection
flows into the PNG/PDF report (`?industry=`). Tables live in
`BENCHMARKS_BY_INDUSTRY` (`lib/benchmarks.ts`).

### ⚠️ Same honest caveat, more granular

These per-industry numbers are **synthesized, directional variations** on the
baseline — they encode the *shape* commonly described in public writing (e.g.
fintech retains/monetizes higher but refers less; PLG SaaS has faster
time-to-value and more virality; marketplaces acquire and refer well but retain
harder). They are **not** licensed per-industry benchmark data. The `all` row is
the canonical baseline and equals the v1 medians exactly (enforced by a parity
test). Replace any cell with rights-cleared data and drop the estimate labelling
for that diagnostic.

Industries: **All · B2B SaaS · PLG SaaS · Marketplace · Fintech**.

### AARRR (median 0–100)

| Industry | Acquisition | Activation | Retention | Revenue | Referral |
|---|--:|--:|--:|--:|--:|
| All (baseline) | 52 | 45 | 50 | 48 | 36 |
| B2B SaaS | 50 | 47 | 55 | 52 | 33 |
| PLG SaaS | 55 | 52 | 48 | 45 | 44 |
| Marketplace | 58 | 44 | 42 | 46 | 48 |
| Fintech | 48 | 46 | 58 | 55 | 30 |

### PLG Readiness (median 0–100)

| Industry | Time-to-Value | Self-Serve | PQL | Virality | Expansion |
|---|--:|--:|--:|--:|--:|
| All (baseline) | 42 | 48 | 38 | 34 | 46 |
| B2B SaaS | 40 | 44 | 44 | 30 | 50 |
| PLG SaaS | 52 | 56 | 42 | 44 | 48 |
| Marketplace | 46 | 50 | 34 | 50 | 40 |
| Fintech | 44 | 46 | 40 | 28 | 52 |

_Every industry × dimension cell is present and within 0–100, and the `all` row
matches the v1 baseline — both enforced by `lib/benchmarks-depth.test.ts`._
