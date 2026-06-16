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
