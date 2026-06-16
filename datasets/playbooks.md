# Action playbooks

This file documents the **actionable playbook** content that powers the
"Your Playbook" section on the results screen and the Markdown/PDF exports. The
content itself lives in [`lib/playbook.ts`](../lib/playbook.ts); this file is the
human-readable source of record and provenance.

## ⚠️ Provenance — editorial, not licensed research

The tactics are an **editorial playbook synthesized from widely-published growth
practice** (onboarding/activation, PLG, retention, pricing, referral). They are
**directional guidance, not guarantees or licensed benchmark research**. Numbers
inside a tactic (e.g. "80% of a limit", "−50% time-to-value") are illustrative
targets, not measured industry constants.

The export and UI label this as a playbook; nothing here claims to be sourced
from a proprietary dataset.

## Structure

For each diagnostic, every dimension has a small set of **tactics**. Each tactic
is band-aware via a `bands` list, so the playbook adapts to where you are:

- **Foundational** tactics (`critical`, `needs-work`) — fix the basics first.
- **Advanced** tactics (`good`, `strong`) — optimize and scale.

A tactic carries:

| Field | Meaning |
|---|---|
| `title` | The play, in imperative form |
| `why` | One line on why it matters / the leverage |
| `steps` | 2–4 concrete, do-this-next steps |
| `metric` | The single number to watch |
| `effort` | `Low` / `Medium` / `High` |
| `horizon` | A realistic time box (e.g. "2 weeks", "30 days") |
| `bands` | Which score bands the tactic applies to |

## How the playbook is assembled

1. A result's **bottleneck dimensions** (the weakest stages) are selected.
2. For each, `getPlaybook(diagnostic, dimension, score)` returns the tactics that
   match the dimension's **score band** (band-aware tailoring).
3. `buildPlaybookMarkdown(diagnostic, result)` renders an exportable Markdown
   document — **no PII, no timestamp**, just scores + tactics. The same model
   feeds the PDF report (Slice 3).

## Coverage

Both diagnostics are fully covered (every dimension × band resolves to ≥1 tactic;
enforced by `lib/playbook.test.ts`):

- **AARRR** — Acquisition · Activation · Retention · Revenue · Referral
- **PLG Readiness** — Time-to-Value · Self-Serve · Product-Qualified Leads ·
  In-Product Virality · Expansion-Led Revenue

## Extending / replacing

Add or edit entries in `AARRR_PLAYBOOK` / `PLG_PLAYBOOK` in `lib/playbook.ts`.
Keep tactics concrete (real steps, a real metric), tag the right `bands`, and the
integrity test will hold you to non-empty steps/metrics for every band. A new
diagnostic adds its own `Record<dimension, Tactic[]>` table keyed by its id.
