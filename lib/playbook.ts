// ─────────────────────────────────────────────────────────────────────────────
// Actionable playbook — per-dimension, band-aware tactics with concrete steps.
//
// Where recommendations.ts gives one headline + action per weak dimension, the
// playbook gives the *how*: ordered tactics, each with why-it-matters, concrete
// steps, what to measure, an effort estimate, and a time horizon. Surfaced in
// the results UI and exportable as Markdown (and folded into the PDF report).
//
// ⚠️ Editorial content, not licensed research. These tactics are synthesized
// from widely-published growth practice and are directional, not guarantees.
// See datasets/playbooks.md for provenance + how to extend. Pure + Edge-safe.
// ─────────────────────────────────────────────────────────────────────────────

import type { Diagnostic } from "./engine";
import { type ScoreBand, scoreBand } from "./recommendations";

export const PLAYBOOK_SOURCE =
  "Editorial playbook synthesized from common growth practice — directional, not licensed research (see datasets/playbooks.md)";

export type Effort = "Low" | "Medium" | "High";

export interface Tactic {
  title: string;
  why: string;
  steps: string[];
  metric: string; // the one number to watch
  effort: Effort;
  horizon: string; // e.g. "2 weeks", "30 days"
  bands: ScoreBand[]; // which score bands this tactic applies to
}

export interface DimensionPlaybook {
  dimension: string;
  label: string;
  tactics: Tactic[];
}

const FOUNDATIONAL: ScoreBand[] = ["critical", "needs-work"];
const ADVANCED: ScoreBand[] = ["good", "strong"];

const AARRR_PLAYBOOK: Record<string, Tactic[]> = {
  acquisition: [
    {
      title: "Instrument one ICP channel end-to-end",
      why: "You can't improve acquisition economics you don't measure; one trustworthy channel beats five guesses.",
      steps: [
        "Pick the single channel that best maps to your ICP and trigger events.",
        "Add tracking across the whole path (spend → click → signup → qualified).",
        "Compute true blended CAC weekly, including team time.",
      ],
      metric: "Tracked blended CAC",
      effort: "Medium",
      horizon: "30 days",
      bands: FOUNDATIONAL,
    },
    {
      title: "Build a compounding bottom-of-funnel content engine",
      why: "High-intent organic pages compound and lower blended CAC as paid plateaus.",
      steps: [
        "List 5 high-intent keywords ('[competitor] alternative', 'best [category] for [ICP]').",
        "Publish 4 comparison / use-case pages targeting them.",
        "Track organic SQLs attributed to those pages at 60 days.",
      ],
      metric: "Organic SQLs / month",
      effort: "Medium",
      horizon: "60 days",
      bands: ADVANCED,
    },
  ],
  activation: [
    {
      title: "Find and fix the #1 onboarding drop-off",
      why: "The single biggest leak before value is usually the cheapest, highest-leverage fix you have.",
      steps: [
        "Instrument every onboarding step as an event.",
        "Identify the step with the largest drop-off.",
        "Run a 2-week experiment to reduce friction there (copy, remove a step, or a tooltip).",
      ],
      metric: "7-day activation rate",
      effort: "Low",
      horizon: "2 weeks",
      bands: FOUNDATIONAL,
    },
    {
      title: "Engineer onboarding around the validated aha-moment",
      why: "Once you know the action that predicts retention, the whole first session should drive to it.",
      steps: [
        "Validate the aha-moment with cohort analysis (which early action predicts D30).",
        "Gate onboarding milestones to that action; defer everything non-essential.",
        "Trigger an in-app nudge for users who stall before reaching it.",
      ],
      metric: "Median time-to-value",
      effort: "Medium",
      horizon: "30 days",
      bands: ADVANCED,
    },
  ],
  retention: [
    {
      title: "Stand up a churn early-warning health score",
      why: "Retention is your most expensive leak; you have to see churn coming before you can stop it.",
      steps: [
        "Pick 3–5 leading indicators of churn (login frequency, key-feature adoption, etc.).",
        "Combine them into a single composite health score.",
        "Auto-alert (email + CSM) when an account's score drops below threshold.",
      ],
      metric: "At-risk accounts caught / month",
      effort: "Medium",
      horizon: "30 days",
      bands: FOUNDATIONAL,
    },
    {
      title: "Turn retention into expansion with QBRs for top accounts",
      why: "Your stickiest accounts are where expansion compounds — show them ROI and renewal follows.",
      steps: [
        "Identify your top 20% of accounts by ARR.",
        "Run a structured 30-minute monthly review showing realized ROI.",
        "Track renewal rate + NPS vs. a non-QBR cohort.",
      ],
      metric: "Net revenue retention",
      effort: "Medium",
      horizon: "60 days",
      bands: ADVANCED,
    },
  ],
  revenue: [
    {
      title: "Establish unit economics, then fix the pricing metric",
      why: "You can't optimize monetization you don't measure; misaligned value metrics cap every account.",
      steps: [
        "Compute LTV:CAC and CAC payback for your core segment.",
        "Audit whether your pricing metric (seats / usage / flat) matches perceived value.",
        "Test one alternative tier or value-metric change.",
      ],
      metric: "LTV:CAC ratio",
      effort: "Medium",
      horizon: "30 days",
      bands: FOUNDATIONAL,
    },
    {
      title: "Automate a usage-based expansion motion",
      why: "Expansion that triggers on usage offsets churn without re-selling.",
      steps: [
        "Find the usage threshold that predicts upgrade intent (e.g. 80% of a limit).",
        "Trigger an in-app + email sequence ~2 weeks before the limit.",
        "A/B test value-led vs. discount messaging.",
      ],
      metric: "Net revenue retention",
      effort: "Medium",
      horizon: "45 days",
      bands: ADVANCED,
    },
  ],
  referral: [
    {
      title: "Auto-ask promoters for reviews + referrals",
      why: "Your happiest users will advocate — but only if you ask at the moment of delight.",
      steps: [
        "Start measuring NPS if you aren't already.",
        "When someone scores 9–10, auto-ask for a G2/Capterra review AND a referral within 24h.",
        "Track review volume + referral signups vs. organic baseline.",
      ],
      metric: "Referral signups / month",
      effort: "Low",
      horizon: "2 weeks",
      bands: FOUNDATIONAL,
    },
    {
      title: "Engineer a double-sided referral loop",
      why: "A structured incentive loop turns word-of-mouth into a measurable channel.",
      steps: [
        "Build a 'give $X, get $X' loop with a simple tool (Rewardful, ReferralHero).",
        "Promote it in the post-signup flow and in-product.",
        "Measure k-factor after 60 days.",
      ],
      metric: "k-factor",
      effort: "Medium",
      horizon: "60 days",
      bands: ADVANCED,
    },
  ],
};

const PLG_PLAYBOOK: Record<string, Tactic[]> = {
  ttv: [
    {
      title: "Instrument the activation event and cut TTV 50%",
      why: "If users wait for value, they churn before they convert — speed is the whole game in PLG.",
      steps: [
        "Define the single 'first win' event and instrument the full path to it.",
        "Find the biggest pre-value step and remove or defer it.",
        "Set and monitor a median time-to-value target.",
      ],
      metric: "Median time-to-value",
      effort: "Medium",
      horizon: "30 days",
      bands: FOUNDATIONAL,
    },
    {
      title: "Front-load value with templates and a reverse trial",
      why: "Seeing the product work before any setup is the fastest path to the aha-moment.",
      steps: [
        "Seed new accounts with a realistic template or sample workspace.",
        "A/B test a reverse-trial (full power up front, then drop to free).",
        "Measure 7-day activation vs. a blank-start control.",
      ],
      metric: "7-day activation rate",
      effort: "Medium",
      horizon: "45 days",
      bands: ADVANCED,
    },
  ],
  self_serve: [
    {
      title: "Open a no-sales path to value and checkout",
      why: "Every forced demo is a leak; PLG needs a user to start and pay without a call.",
      steps: [
        "Expose transparent pricing and enable in-product checkout on the entry tier.",
        "Remove any forced 'contact sales' gate before first value.",
        "Add a milestone-based onboarding checklist to the aha-moment.",
      ],
      metric: "Self-serve conversion rate",
      effort: "Medium",
      horizon: "45 days",
      bands: FOUNDATIONAL,
    },
    {
      title: "Usage-based self-serve billing + in-product upgrades",
      why: "Metered billing lets accounts grow spend without re-touching sales.",
      steps: [
        "Add metered / usage-based billing across tiers.",
        "Place in-product upgrade prompts at natural limits.",
        "Strip residual signup friction (no card to start, deferred profile).",
      ],
      metric: "Free → paid conversion",
      effort: "High",
      horizon: "60 days",
      bands: ADVANCED,
    },
  ],
  pql: [
    {
      title: "Define and surface your first PQL score",
      why: "In-product behavior predicts who's ready to buy — but only if you score and act on it.",
      steps: [
        "Pick 3–5 usage signals that correlate with conversion/expansion.",
        "Weight them into a single PQL score.",
        "Surface qualifying accounts to the team daily.",
      ],
      metric: "PQL → opportunity rate",
      effort: "Medium",
      horizon: "30 days",
      bands: FOUNDATIONAL,
    },
    {
      title: "Automate the PQL play and align sales",
      why: "Routing reps to product-qualified accounts beats cold lists on win-rate and cycle length.",
      steps: [
        "Fire a defined play (in-product prompt or sales/CS alert with context) on threshold.",
        "Route reps only to product-qualified accounts.",
        "A/B test the play vs. no-touch and feed results back into the score.",
      ],
      metric: "PQL win-rate",
      effort: "Medium",
      horizon: "45 days",
      bands: ADVANCED,
    },
  ],
  virality: [
    {
      title: "Build one invite or collaboration loop",
      why: "If using the product never pulls in a second person, growth is all paid — fix that first.",
      steps: [
        "Find a core workflow where inviting a teammate or sharing a result is natural.",
        "Make the invite/share one tap.",
        "Instrument invites sent → accepted → activated.",
      ],
      metric: "k-factor",
      effort: "Medium",
      horizon: "45 days",
      bands: FOUNDATIONAL,
    },
    {
      title: "Public artifacts + free-tier distribution",
      why: "Shareable outputs and a visible free tier expose the product to brand-new users for free.",
      steps: [
        "Ship public shareable links/reports with tasteful 'made with' branding.",
        "Make the free experience visible to an account's wider team.",
        "Attribute signups back to shares to measure the loop.",
      ],
      metric: "Share-driven signups",
      effort: "Medium",
      horizon: "60 days",
      bands: ADVANCED,
    },
  ],
  expansion: [
    {
      title: "Ship a usage-based upgrade trigger",
      why: "Expansion that fires on usage grows revenue inside accounts without renegotiation.",
      steps: [
        "Find the usage threshold that predicts upgrade intent.",
        "Prompt in-product before the limit is hit.",
        "A/B test value-led vs. discount messaging.",
      ],
      metric: "Net revenue retention",
      effort: "Medium",
      horizon: "30 days",
      bands: FOUNDATIONAL,
    },
    {
      title: "Re-align the value metric to realized value",
      why: "When customers pay more as they get more, expansion feels automatic and fair.",
      steps: [
        "Audit whether your value metric tracks realized value (pay-as-you-grow).",
        "Test one value-metric or tier change.",
        "Add seat / workspace expansion nudges at natural moments.",
      ],
      metric: "ARPA / NRR",
      effort: "High",
      horizon: "60 days",
      bands: ADVANCED,
    },
  ],
};

const PLAYBOOKS_BY_DIAGNOSTIC: Record<string, Record<string, Tactic[]>> = {
  aarrr: AARRR_PLAYBOOK,
  plg: PLG_PLAYBOOK,
};

/**
 * Tactics for a diagnostic's dimension at a given 0–100 score. Band-aware:
 * weak dimensions get foundational tactics, healthy ones get advanced tactics.
 * Never returns empty for a known dimension (falls back to all its tactics).
 */
export function getPlaybook(
  diagnostic: Diagnostic,
  dimension: string,
  score: number
): Tactic[] {
  const all = PLAYBOOKS_BY_DIAGNOSTIC[diagnostic.id]?.[dimension] ?? [];
  if (all.length === 0) return [];
  const band = scoreBand(score);
  const matched = all.filter((tac) => tac.bands.includes(band));
  return matched.length > 0 ? matched : all;
}

export interface PlaybookResultLike {
  bottlenecks: string[];
  dimensionResults: { dimension: string; label: string; rawScore: number }[];
}

/** The full playbook for the weak (bottleneck) dimensions of a result. */
export function buildPlaybook(
  diagnostic: Diagnostic,
  result: PlaybookResultLike
): DimensionPlaybook[] {
  return result.bottlenecks
    .map((key) => {
      const dr = result.dimensionResults.find((d) => d.dimension === key);
      if (!dr) return null;
      return {
        dimension: key,
        label: dr.label,
        tactics: getPlaybook(diagnostic, key, dr.rawScore),
      };
    })
    .filter((p): p is DimensionPlaybook => p !== null && p.tactics.length > 0);
}

/**
 * Render an exportable Markdown playbook for the weak dimensions of a result.
 * Carries NO PII and no timestamp — just scores + tactics.
 */
export function buildPlaybookMarkdown(
  diagnostic: Diagnostic,
  result: PlaybookResultLike & { overallScore: number }
): string {
  const lines: string[] = [];
  lines.push(`# ${diagnostic.name} — Action Playbook`);
  lines.push("");
  lines.push(`Overall score: **${result.overallScore}/100**. Focus on your weakest areas first.`);
  lines.push("");

  for (const dp of buildPlaybook(diagnostic, result)) {
    const dr = result.dimensionResults.find((d) => d.dimension === dp.dimension);
    lines.push(`## ${dp.label} — ${dr?.rawScore ?? 0}/100`);
    lines.push("");
    dp.tactics.forEach((tac, i) => {
      lines.push(`### ${i + 1}. ${tac.title}`);
      lines.push(`*Effort: ${tac.effort} · Horizon: ${tac.horizon} · Measure: ${tac.metric}*`);
      lines.push("");
      lines.push(`${tac.why}`);
      lines.push("");
      for (const step of tac.steps) lines.push(`- ${step}`);
      lines.push("");
    });
  }

  lines.push("---");
  lines.push(`_${PLAYBOOK_SOURCE}_`);
  lines.push("");
  return lines.join("\n");
}
