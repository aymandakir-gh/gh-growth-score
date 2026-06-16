// ─────────────────────────────────────────────────────────────────────────────
// Per-AARRR-stage tailored recommendations.
//
// Each stage has advice for 4 score bands (critical / needs-work / good /
// strong). Pure data + lookup — safe on the Edge runtime, fully unit-tested.
// Bands match getScoreLabel() thresholds in scoring.ts.
// ─────────────────────────────────────────────────────────────────────────────

import type { Stage } from "./scoring";

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
  if (score < 30) return "critical";
  if (score < 55) return "needs-work";
  if (score < 75) return "good";
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

/** Get the tailored recommendation for a stage at a given 0–100 score. */
export function getStageRecommendation(
  stage: Stage,
  score: number
): StageRecommendation {
  const band = scoreBand(score);
  return { band, ...RECOMMENDATIONS[stage][band] };
}
