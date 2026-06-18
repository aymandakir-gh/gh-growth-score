// ─────────────────────────────────────────────────────────────────────────────
// Per-AARRR-stage tailored recommendations.
//
// Each stage has advice for 4 score bands (critical / needs-work / good /
// strong). Pure data + lookup — safe on the Edge runtime, fully unit-tested.
// Bands match getScoreLabel() thresholds in scoring.ts.
// ─────────────────────────────────────────────────────────────────────────────

import type { Stage } from "./scoring";
import { SCORE_BAND_BOUNDS, type Diagnostic } from "./engine";

export type ScoreBand = "critical" | "needs-work" | "good" | "strong";

export interface StageRecommendation {
  band: ScoreBand;
  /** One-line diagnosis of where this stage stands. */
  headline: string;
  /** The single highest-leverage next action. */
  action: string;
}

/** Map a 0–100 score to a band (same thresholds as getScoreLabel). */
export function scoreBand(score: number): ScoreBand {
  if (score < SCORE_BAND_BOUNDS.critical) return "critical";
  if (score < SCORE_BAND_BOUNDS.needsWork) return "needs-work";
  if (score < SCORE_BAND_BOUNDS.good) return "good";
  return "strong";
}

const RECOMMENDATIONS: Record<Stage, Record<ScoreBand, Omit<StageRecommendation, "band">>> = {
  acquisition: {
    critical: {
      headline: "You're relying on luck, not a system.",
      action:
        "Pick ONE channel that maps to your ICP and instrument it end-to-end (spend → signup) so you have a tracked CAC within 30 days.",
    },
    "needs-work": {
      headline: "A channel works, but the economics are fuzzy.",
      action:
        "Calculate true blended CAC (include team time) and define an LTV:CAC target. Kill or pause anything with payback over 18 months.",
    },
    good: {
      headline: "Acquisition is healthy — now make it compounding.",
      action:
        "Add a second proven channel and build bottom-of-funnel content (comparison / use-case pages) for high-intent keywords.",
    },
    strong: {
      headline: "Strong, measured acquisition.",
      action:
        "Defend it: watch CAC creep, and reinvest the channel that improves LTV:CAC fastest rather than chasing new ones.",
    },
  },
  activation: {
    critical: {
      headline: "New users aren't reaching value — your funnel leaks at the top.",
      action:
        "Define your aha-moment and instrument every onboarding step. Find the single biggest drop-off and fix that one step first.",
    },
    "needs-work": {
      headline: "Some users activate, but too slowly.",
      action:
        "Cut steps before first value (target −50% time-to-value) and add a concierge / guided setup for your best-fit signups.",
    },
    good: {
      headline: "Solid activation — tighten the path.",
      action:
        "A/B test removing or deferring one onboarding step, and trigger an in-app nudge for users who stall before the aha-moment.",
    },
    strong: {
      headline: "Excellent activation engine.",
      action:
        "Protect it as you add features — re-validate the aha-moment quarterly so new flows don't dilute time-to-value.",
    },
  },
  retention: {
    critical: {
      headline: "Users leave fast — this is your most expensive leak.",
      action:
        "Pick 3–5 leading churn indicators and build a simple health score with an automated alert when it drops. Stop the bleed before scaling acquisition.",
    },
    "needs-work": {
      headline: "Retention is shaky and mostly reactive.",
      action:
        "Stand up a re-engagement drip for inactive users and run a feature-adoption campaign for the features most correlated with sticking.",
    },
    good: {
      headline: "Good retention — make it deliberate.",
      action:
        "Add triggered interventions on the health score and run monthly reviews with your top 20% of accounts to lift renewal.",
    },
    strong: {
      headline: "Retention is a real moat.",
      action:
        "Turn it into expansion: use the same health signals to surface upsell-ready accounts before they hit their limits.",
    },
  },
  revenue: {
    critical: {
      headline: "You're not capturing the value you create.",
      action:
        "Establish LTV:CAC and CAC payback first — you can't optimize what you don't measure. Then audit whether your pricing metric matches perceived value.",
    },
    "needs-work": {
      headline: "Monetization works but leaves money on the table.",
      action:
        "Launch an annual-plan conversion campaign (fast win) and design one usage-based expansion trigger before customers hit a limit.",
    },
    good: {
      headline: "Healthy revenue mechanics.",
      action:
        "Systematize expansion: automate the upgrade trigger and test value-led vs. discount messaging to push NRR past 110%.",
    },
    strong: {
      headline: "Strong, expanding revenue.",
      action:
        "Keep NRR compounding — segment expansion plays by account tier and protect gross margin as you scale.",
    },
  },
  referral: {
    critical: {
      headline: "Word-of-mouth is leaking away unused.",
      action:
        "Start measuring NPS, then auto-ask your promoters (9–10) for a review AND a referral within 24h. Cheapest growth you're ignoring.",
    },
    "needs-work": {
      headline: "Referral exists but isn't engineered.",
      action:
        "Launch a simple double-sided referral incentive and promote it in your post-signup flow and in-product, then track k-factor.",
    },
    good: {
      headline: "Referral is contributing — amplify it.",
      action:
        "Find one workflow where sharing a result to an outsider is natural and build a public-share / invite loop to raise virality.",
    },
    strong: {
      headline: "Referral is a genuine growth channel.",
      action:
        "Treat it like paid: measure k-factor per cohort and double down on the share surfaces with the highest viral coefficient.",
    },
  },
};

/** Get the tailored AARRR recommendation for a stage at a given 0–100 score. */
export function getStageRecommendation(
  stage: Stage,
  score: number
): StageRecommendation {
  const band = scoreBand(score);
  return { band, ...RECOMMENDATIONS[stage][band] };
}

// ─────────────────────────────────────────────────────────────────────────────
// PLG recommendations (per dimension × band).
// ─────────────────────────────────────────────────────────────────────────────
const PLG_RECOMMENDATIONS: Record<string, Record<ScoreBand, Omit<StageRecommendation, "band">>> = {
  ttv: {
    critical: {
      headline: "New users hit a wall before any value.",
      action:
        "Define the single 'first win' event, instrument the path to it, and remove the biggest pre-value step. Aim for a measurable TTV within 30 days.",
    },
    "needs-work": {
      headline: "Users get value, but too slowly.",
      action:
        "Ship templates or seeded sample data so people see the product working before setup, and cut the longest required step. Target −50% median TTV.",
    },
    good: {
      headline: "Solid time-to-value — sharpen it.",
      action:
        "A/B test a reverse-trial (full power up front) and instrument TTV per cohort so you can defend it as you add features.",
    },
    strong: {
      headline: "Fast, reliable time-to-value.",
      action:
        "Protect it: re-validate the activation event quarterly and watch TTV creep as onboarding and features evolve.",
    },
  },
  self_serve: {
    critical: {
      headline: "Your funnel still depends on a human in the loop.",
      action:
        "Open a fully self-serve path to value on the entry tier — signup, onboarding, and in-product checkout — so a user never has to book a call to start.",
    },
    "needs-work": {
      headline: "Self-serve exists but leaks or stops short of purchase.",
      action:
        "Add a milestone-based onboarding checklist to the aha moment and enable self-serve checkout on the entry tier. Measure signup→activation→paid.",
    },
    good: {
      headline: "Healthy self-serve motion.",
      action:
        "Extend self-serve checkout across more tiers and strip any remaining non-essential signup friction (no card to start, deferred profile).",
    },
    strong: {
      headline: "End-to-end self-serve works.",
      action:
        "Layer usage-based billing and in-product upgrades so the buying path scales with value without re-touching sales.",
    },
  },
  pql: {
    critical: {
      headline: "You're blind to in-product buying signals.",
      action:
        "Pick 3–5 usage signals that predict conversion, weight them into a first PQL score, and surface qualifying accounts daily.",
    },
    "needs-work": {
      headline: "You see signals but act on them inconsistently.",
      action:
        "Wire an automated play (in-product prompt or sales/CS alert with context) to fire when an account crosses the PQL threshold. Track PQL→opportunity.",
    },
    good: {
      headline: "PQLs are working — tighten the loop.",
      action:
        "A/B test the play, route reps only to product-qualified accounts, and feed conversion data back to tune the score.",
    },
    strong: {
      headline: "A validated PQL engine.",
      action:
        "Segment plays by account fit and keep retuning the model on outcomes so PLG and sales compound each other.",
    },
  },
  virality: {
    critical: {
      headline: "Usage creates no new users — the product is single-player.",
      action:
        "Find one core workflow where inviting a teammate or sharing a result is natural, make it one tap, and instrument invites sent → activated.",
    },
    "needs-work": {
      headline: "Sharing is possible but not engineered.",
      action:
        "Build a deliberate loop (collaboration or public shareable artifact with light branding) and start tracking k-factor.",
    },
    good: {
      headline: "Real loops exist — amplify them.",
      action:
        "Make the free tier visible to the wider team and optimize the highest-k surface. Measure seats originating inside existing accounts.",
    },
    strong: {
      headline: "Virality is a genuine channel.",
      action:
        "Treat it like paid: measure k per cohort and double down on the share surfaces with the highest viral coefficient.",
    },
  },
  expansion: {
    critical: {
      headline: "Revenue doesn't grow inside accounts.",
      action:
        "Establish NRR first, then ship one usage-based upgrade trigger that prompts before a limit is hit. You can't expand what you don't measure.",
    },
    "needs-work": {
      headline: "Expansion happens, but reactively.",
      action:
        "Automate the upgrade prompt at the usage threshold and add seat-expansion nudges at natural moments. Push NRR toward 110%.",
    },
    good: {
      headline: "Healthy expansion mechanics.",
      action:
        "Audit whether your value metric tracks realized value, and test one change so expansion feels automatic and fair.",
    },
    strong: {
      headline: "Expansion reliably outpaces churn.",
      action:
        "Keep NRR compounding — segment expansion plays by tier and protect the value-metric alignment as you scale.",
    },
  },
};

const RECOMMENDATIONS_BY_DIAGNOSTIC: Record<
  string,
  Record<string, Record<ScoreBand, Omit<StageRecommendation, "band">>>
> = {
  aarrr: RECOMMENDATIONS,
  plg: PLG_RECOMMENDATIONS,
};

/**
 * Get the tailored recommendation for any diagnostic's dimension at a 0–100
 * score. Falls back gracefully if a dimension/band is missing.
 */
export function getDimensionRecommendation(
  diagnostic: Diagnostic,
  dimension: string,
  score: number
): StageRecommendation {
  const band = scoreBand(score);
  const table = RECOMMENDATIONS_BY_DIAGNOSTIC[diagnostic.id]?.[dimension];
  if (table) return { band, ...table[band] };
  const label =
    diagnostic.dimensions.find((d) => d.key === dimension)?.label ?? dimension;
  return {
    band,
    headline: `${label} needs attention.`,
    action: `Focus your next experiment cycle on improving ${label.toLowerCase()}.`,
  };
}
