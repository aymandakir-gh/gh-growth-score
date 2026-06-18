// ─────────────────────────────────────────────────────────────────────────────
// Growth-Health-Score · AARRR diagnostic (the original).
//
// This file owns the AARRR content (questions, weights, experiments) and keeps
// its long-standing public API. As of v2 the actual scoring runs on the shared,
// generic `lib/engine.ts`: AARRR is expressed as a `Diagnostic` descriptor
// (AARRR_DIAGNOSTIC) and every function below delegates to the engine. The
// existing unit tests are the parity guard — behavior is unchanged.
// ─────────────────────────────────────────────────────────────────────────────

import {
  type Diagnostic,
  type EngineExperiment,
  computeDimensionScore as engineDimensionScore,
  computeOverallScore as engineOverallScore,
  findBottlenecks as engineFindBottlenecks,
  computeICE as engineComputeICE,
  selectTopExperiments as engineSelectTopExperiments,
  scoreDiagnostic as engineScoreDiagnostic,
  getScoreLabel as engineGetScoreLabel,
  encodeAnswers as engineEncodeAnswers,
  parseAnswerDigits as engineParseAnswerDigits,
} from "./engine";

export type Stage = "acquisition" | "activation" | "retention" | "revenue" | "referral";

export type AnswerValue = 0 | 1 | 2 | 3 | 4; // 0=worst, 4=best

export interface Question {
  id: string;
  stage: Stage;
  text: string;
  hint?: string;
  options: [string, string, string, string, string]; // exactly 5, index = AnswerValue
}

export interface StageConfig {
  stage: Stage;
  label: string;
  emoji: string;
  weight: number; // must sum to 1.0 across all stages
  description: string;
  color: string; // tailwind color class stem e.g. "blue"
}

export interface Experiment {
  title: string;
  description: string;
  impact: number;   // 1–10
  confidence: number; // 1–10
  effort: number;   // 1–10 (lower = easier)
  ice: number;      // computed: impact * confidence / effort
  stage: Stage;
}

export interface StageResult {
  stage: Stage;
  label: string;
  emoji: string;
  color: string;
  rawScore: number;    // 0–100
  weightedScore: number; // rawScore * weight
  weight: number;
  questionCount: number;
  isBottleneck: boolean;
  rank: number; // 1 = worst
}

export interface ScoringResult {
  overallScore: number;        // 0–100 weighted
  stageResults: StageResult[];
  bottlenecks: Stage[];        // top 3 weakest stages
  experiments: Experiment[];   // top 3 ICE-prioritized experiments
  answers: Record<string, AnswerValue>;
  completedAt: string;         // ISO timestamp
}

// ─────────────────────────────────────────────────────────────────────────────
// STAGE CONFIG
// Weights reflect typical SaaS growth model importance.
// Revenue + Retention are highest-leverage levers.
// ─────────────────────────────────────────────────────────────────────────────
export const STAGE_CONFIGS: StageConfig[] = [
  {
    stage: "acquisition",
    label: "Acquisition",
    emoji: "🎯",
    weight: 0.20,
    description: "How well you attract new visitors and leads",
    color: "blue",
  },
  {
    stage: "activation",
    label: "Activation",
    emoji: "⚡",
    weight: 0.20,
    description: "How quickly new users reach their first 'aha moment'",
    color: "purple",
  },
  {
    stage: "retention",
    label: "Retention",
    emoji: "🔄",
    weight: 0.25,
    description: "How well you keep users coming back over time",
    color: "green",
  },
  {
    stage: "revenue",
    label: "Revenue",
    emoji: "💰",
    weight: 0.25,
    description: "How effectively you monetize your user base",
    color: "yellow",
  },
  {
    stage: "referral",
    label: "Referral",
    emoji: "📣",
    weight: 0.10,
    description: "How much your users spread the word organically",
    color: "orange",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// QUESTIONS  (3 per stage = 15 total)
// Scoring: 0 = critical issue / not done, 4 = best-in-class
// ─────────────────────────────────────────────────────────────────────────────
export const QUESTIONS: Question[] = [
  // ACQUISITION (3 questions)
  {
    id: "acq_channels",
    stage: "acquisition",
    text: "How many reliable, measurable traffic channels do you actively run?",
    hint: "Count channels with tracked CAC and clear conversion data",
    options: [
      "None — we rely on word of mouth",
      "1 channel, mostly inconsistent",
      "1–2 channels with some data",
      "2–3 channels with clear CAC",
      "3+ channels, all measured with CAC targets",
    ],
  },
  {
    id: "acq_cac",
    stage: "acquisition",
    text: "How does your Customer Acquisition Cost (CAC) trend over the last 3 months?",
    hint: "Blended CAC across all paid + organic channels",
    options: [
      "Unknown — we don't track CAC",
      "Rising fast (>20% per month)",
      "Flat or rising slowly",
      "Slightly decreasing",
      "Steadily decreasing with improving LTV:CAC",
    ],
  },
  {
    id: "acq_icp",
    stage: "acquisition",
    text: "How precisely defined is your Ideal Customer Profile (ICP)?",
    hint: "Firmographics, psychographics, trigger events, buying signals",
    options: [
      "No ICP defined",
      "Broad segment defined (e.g. 'SMBs')",
      "Industry + size defined",
      "Industry + size + pain point + trigger",
      "Full ICP with buying signals, verified with win/loss data",
    ],
  },

  // ACTIVATION (3 questions)
  {
    id: "act_onboarding",
    stage: "activation",
    text: "What is your new user activation rate (reaching core 'aha moment')?",
    hint: "% of signups who complete the key first-value action within 7 days",
    options: [
      "We don't measure activation",
      "Below 20%",
      "20–40%",
      "40–60%",
      "Above 60%",
    ],
  },
  {
    id: "act_time_to_value",
    stage: "activation",
    text: "How long does it take a new user to experience real value?",
    hint: "Time from signup to first meaningful outcome (not just feature use)",
    options: [
      "We don't know / more than 2 weeks",
      "5–14 days",
      "2–5 days",
      "Same day, usually within hours",
      "Under 30 minutes, reliably",
    ],
  },
  {
    id: "act_aha",
    stage: "activation",
    text: "How well-defined and deliberately engineered is your 'aha moment'?",
    hint: "The specific action that correlates most strongly with long-term retention",
    options: [
      "We haven't identified it",
      "We have a hypothesis but no data",
      "We've identified it with some correlation data",
      "Clearly defined, validated with cohort analysis",
      "Defined, validated, and the entire onboarding is engineered around it",
    ],
  },

  // RETENTION (3 questions)
  {
    id: "ret_d30",
    stage: "retention",
    text: "What is your D30 (day-30) user retention rate?",
    hint: "% of users still active 30 days after signup",
    options: [
      "Unknown",
      "Below 10%",
      "10–25%",
      "25–40%",
      "Above 40%",
    ],
  },
  {
    id: "ret_churn",
    stage: "retention",
    text: "How is your monthly revenue churn trending?",
    hint: "MRR lost from cancellations + downgrades ÷ starting MRR",
    options: [
      "Unknown",
      "Above 8% monthly",
      "5–8% monthly",
      "2–5% monthly",
      "Below 2% monthly with improving trend",
    ],
  },
  {
    id: "ret_engagement",
    stage: "retention",
    text: "Do you have a deliberate re-engagement system for at-risk users?",
    hint: "Automated triggers, health scores, CSM playbooks, win-back campaigns",
    options: [
      "None",
      "Ad-hoc manual outreach only",
      "Basic email drip for inactive users",
      "Automated health score + triggered interventions",
      "Full lifecycle system: health score + CSM playbook + win-back + NPS loop",
    ],
  },

  // REVENUE (3 questions)
  {
    id: "rev_ltv_cac",
    stage: "revenue",
    text: "What is your LTV:CAC ratio?",
    hint: "Customer Lifetime Value divided by Customer Acquisition Cost",
    options: [
      "Unknown",
      "Below 1:1",
      "1:1 – 2:1",
      "2:1 – 3:1",
      "3:1 or above",
    ],
  },
  {
    id: "rev_expansion",
    stage: "revenue",
    text: "Do you have a systematic expansion revenue motion (upsell / cross-sell)?",
    hint: "Net Revenue Retention > 100% means expansion covers churn",
    options: [
      "No expansion revenue at all",
      "Occasional upsells, mostly sales-led and reactive",
      "Product-led expansion exists but not optimized",
      "Clear expansion triggers with automated or CSM-led plays",
      "NRR > 110% — expansion reliably offsets churn",
    ],
  },
  {
    id: "rev_payback",
    stage: "revenue",
    text: "What is your CAC payback period?",
    hint: "Months to recover acquisition cost from gross margin",
    options: [
      "Unknown",
      "More than 24 months",
      "13–24 months",
      "7–12 months",
      "6 months or under",
    ],
  },

  // REFERRAL (3 questions)
  {
    id: "ref_nps",
    stage: "referral",
    text: "What is your Net Promoter Score (NPS)?",
    hint: "% Promoters (9–10) minus % Detractors (0–6)",
    options: [
      "Unknown",
      "Below 0",
      "0–20",
      "20–50",
      "Above 50",
    ],
  },
  {
    id: "ref_program",
    stage: "referral",
    text: "Do you have an active referral or word-of-mouth program?",
    hint: "Structured incentive-based referral, ambassador program, or viral loop",
    options: [
      "None",
      "We've thought about it but nothing built",
      "Basic referral link exists, not promoted",
      "Active program with incentives and tracking",
      "Referral is a top acquisition channel with measurable k-factor",
    ],
  },
  {
    id: "ref_virality",
    stage: "referral",
    text: "How much inherent virality or natural sharing is built into the product?",
    hint: "Network effects, social sharing, collaborative features, public artifacts",
    options: [
      "None — the product is fully private",
      "Users can share occasionally but rarely do",
      "Some sharing exists; not engineered",
      "Sharing is designed in; measurable viral loops",
      "Virality is a core growth mechanic with k > 0.3",
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// EXPERIMENT BANK
// One bank per stage. Top experiments are selected based on which stages
// are the weakest. ICE score = (impact × confidence) / effort.
// ─────────────────────────────────────────────────────────────────────────────
export const EXPERIMENT_BANK: Record<Stage, Experiment[]> = {
  acquisition: [
    {
      title: "ICP-Targeted Cold Outbound Sequence",
      description:
        "Build a 5-touch email + LinkedIn sequence targeting the top 3 ICP trigger events. Use AI to personalize at scale. Run for 30 days, measure reply rate and booked meetings.",
      impact: 8,
      confidence: 7,
      effort: 4,
      ice: 0,
      stage: "acquisition",
    },
    {
      title: "Content-Led SEO for Bottom-of-Funnel Terms",
      description:
        "Publish 4 long-form comparison and use-case pages targeting high-intent keywords (e.g. '[competitor] alternative', 'best [category] for [ICP]'). Measure organic SQLs in 60 days.",
      impact: 7,
      confidence: 6,
      effort: 5,
      ice: 0,
      stage: "acquisition",
    },
    {
      title: "Paid Channel Attribution Audit + Kill Low-ROI Spend",
      description:
        "Audit every paid channel for true blended CAC (include team time). Kill or pause channels with CAC payback > 18 months. Reallocate budget to proven channels.",
      impact: 7,
      confidence: 8,
      effort: 3,
      ice: 0,
      stage: "acquisition",
    },
  ],
  activation: [
    {
      title: "Onboarding Funnel Drop-off Analysis + Fix Top Leak",
      description:
        "Instrument every onboarding step. Find the single step with the highest drop-off. Run a 2-week experiment to reduce friction there (copy change, step removal, or in-app tooltip).",
      impact: 9,
      confidence: 8,
      effort: 3,
      ice: 0,
      stage: "activation",
    },
    {
      title: "Aha-Moment Concierge Onboarding for New Signups",
      description:
        "Trigger a Calendly / in-app chat prompt to top-ICP signups within 15 minutes. 30-minute guided setup call. Measure 7-day activation vs. control. Target: +15pp activation.",
      impact: 8,
      confidence: 7,
      effort: 4,
      ice: 0,
      stage: "activation",
    },
    {
      title: "Eliminate Steps Before First Value",
      description:
        "Audit every required step between signup and aha moment. Remove or defer anything not essential for value. Target: cut time-to-value by 50%.",
      impact: 9,
      confidence: 7,
      effort: 5,
      ice: 0,
      stage: "activation",
    },
  ],
  retention: [
    {
      title: "Build a User Health Score + Automated Early Warning",
      description:
        "Define 3–5 leading indicators of churn (login frequency, feature adoption, etc.). Build a composite health score. Trigger an automated email + CSM alert when score drops below threshold.",
      impact: 9,
      confidence: 8,
      effort: 5,
      ice: 0,
      stage: "retention",
    },
    {
      title: "Monthly Business Review (QBR) for Top 20% Accounts",
      description:
        "Identify your top 20% by ARR. Run a structured 30-min monthly review showing them their ROI from your product. Track NPS and renewal rate vs. non-QBR cohort.",
      impact: 8,
      confidence: 7,
      effort: 4,
      ice: 0,
      stage: "retention",
    },
    {
      title: "Feature Adoption Campaign for Power Features",
      description:
        "Identify the 2–3 features most correlated with retention. Build in-app prompts and a 3-email campaign for users who haven't used them by day 14. Measure 60-day retention lift.",
      impact: 7,
      confidence: 7,
      effort: 3,
      ice: 0,
      stage: "retention",
    },
  ],
  revenue: [
    {
      title: "Usage-Based Expansion Trigger Sequence",
      description:
        "Identify the usage threshold that predicts upgrade intent (e.g. 80% of quota used). Trigger an in-app and email sequence 2 weeks before the limit. A/B test discount vs. value-led messaging.",
      impact: 9,
      confidence: 7,
      effort: 4,
      ice: 0,
      stage: "revenue",
    },
    {
      title: "Annual Plan Conversion Campaign",
      description:
        "Email all monthly subscribers with a clear ROI story and 1–2 month discount for switching to annual. Measure conversion rate and MRR impact. Target: 20%+ of eligible base.",
      impact: 8,
      confidence: 8,
      effort: 2,
      ice: 0,
      stage: "revenue",
    },
    {
      title: "Pricing Page Redesign with Value Metric Alignment",
      description:
        "Audit whether your pricing metric (seats, usage, flat) matches how customers perceive value. Test one alternative metric or tier structure. Measure free-to-paid conversion and ARPU.",
      impact: 8,
      confidence: 6,
      effort: 5,
      ice: 0,
      stage: "revenue",
    },
  ],
  referral: [
    {
      title: "Launch a Structured Referral Program with Double-Sided Incentive",
      description:
        "Build a 'Give $X, Get $X' referral loop using a simple tool (e.g. ReferralHero, Rewardful). Promote in post-signup flow and in product. Measure k-factor after 60 days.",
      impact: 7,
      confidence: 6,
      effort: 4,
      ice: 0,
      stage: "referral",
    },
    {
      title: "NPS-Triggered Ask for Reviews + Referrals",
      description:
        "Automatically ask Promoters (NPS 9–10) for a G2/Capterra review AND a referral within 24h of their response. Measure review volume and referral signups vs. organic baseline.",
      impact: 7,
      confidence: 8,
      effort: 2,
      ice: 0,
      stage: "referral",
    },
    {
      title: "Add a Collaborative or Public-Share Feature",
      description:
        "Identify one workflow where sharing a result/doc/view to an outsider would be natural. Build a public-view URL or invite mechanism. Measure viral coefficient from new signups via shares.",
      impact: 8,
      confidence: 5,
      effort: 6,
      ice: 0,
      stage: "referral",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// AARRR_DIAGNOSTIC — the AARRR content expressed as a generic Diagnostic
// descriptor. This is what makes AARRR run on the shared engine. The mappings
// are 1:1: a stage is a dimension, the question/experiment `stage` field is the
// engine's `dimension` field.
// ─────────────────────────────────────────────────────────────────────────────
export const AARRR_DIAGNOSTIC: Diagnostic = {
  id: "aarrr",
  slug: "aarrr",
  name: "Growth Health Score",
  shortName: "AARRR",
  tagline: "Diagnose your growth engine across the 5 AARRR stages.",
  emoji: "📊",
  dimensions: STAGE_CONFIGS.map((c) => ({
    key: c.stage,
    label: c.label,
    emoji: c.emoji,
    weight: c.weight,
    description: c.description,
    color: c.color,
  })),
  questions: QUESTIONS.map((q) => ({
    id: q.id,
    dimension: q.stage,
    text: q.text,
    hint: q.hint,
    options: q.options,
  })),
  experiments: Object.fromEntries(
    (Object.keys(EXPERIMENT_BANK) as Stage[]).map((stage) => [
      stage,
      EXPERIMENT_BANK[stage].map((e) => ({
        title: e.title,
        description: e.description,
        impact: e.impact,
        confidence: e.confidence,
        effort: e.effort,
        ice: e.ice,
        dimension: e.stage,
      })),
    ])
  ),
};

// ─────────────────────────────────────────────────────────────────────────────
// PURE SCORING FUNCTIONS — thin AARRR-typed wrappers over the shared engine.
// Signatures + outputs are unchanged from v1 (the unit suite is the guard).
// ─────────────────────────────────────────────────────────────────────────────

/** Map an engine experiment back to the legacy AARRR Experiment shape. */
function toLegacyExperiment(e: EngineExperiment): Experiment {
  return {
    title: e.title,
    description: e.description,
    impact: e.impact,
    confidence: e.confidence,
    effort: e.effort,
    ice: e.ice,
    stage: e.dimension as Stage,
  };
}

/** Raw 0–100 score for a single AARRR stage. */
export function computeStageScore(
  stage: Stage,
  answers: Record<string, AnswerValue>
): number {
  return engineDimensionScore(AARRR_DIAGNOSTIC, stage, answers);
}

/** Weighted overall 0–100 from per-stage raw scores. */
export function computeOverallScore(stageScores: Record<Stage, number>): number {
  return engineOverallScore(AARRR_DIAGNOSTIC, stageScores);
}

/** The N weakest stages by raw score (worst first). */
export function findBottlenecks(
  stageScores: Record<Stage, number>,
  n = 3
): Stage[] {
  return engineFindBottlenecks(stageScores, n) as Stage[];
}

/** ICE = round(impact × confidence / effort). */
export function computeICE(exp: Omit<Experiment, "ice">): number {
  return engineComputeICE({ ...exp, dimension: exp.stage });
}

/** Top N ICE-prioritized experiments from the weakest stages. */
export function selectTopExperiments(bottlenecks: Stage[], n = 3): Experiment[] {
  return engineSelectTopExperiments(AARRR_DIAGNOSTIC, bottlenecks, n).map(
    toLegacyExperiment
  );
}

/** Full AARRR scoring pipeline. */
export function scoreSubmission(
  answers: Record<string, AnswerValue>
): ScoringResult {
  const r = engineScoreDiagnostic(AARRR_DIAGNOSTIC, answers);
  return {
    overallScore: r.overallScore,
    stageResults: r.dimensionResults.map((d) => ({
      stage: d.dimension as Stage,
      label: d.label,
      emoji: d.emoji,
      color: d.color,
      rawScore: d.rawScore,
      weightedScore: d.weightedScore,
      weight: d.weight,
      questionCount: d.questionCount,
      isBottleneck: d.isBottleneck,
      rank: d.rank,
    })),
    bottlenecks: r.bottlenecks as Stage[],
    experiments: r.experiments.map(toLegacyExperiment),
    answers,
    completedAt: r.completedAt,
  };
}

// Current share-token format version. Bump only if QUESTIONS order changes.
export const SHARE_FORMAT_VERSION = "1";

/** Recompute the weighted overall score directly from raw answers. */
function overallFromAnswers(answers: Record<string, AnswerValue>): number {
  return engineOverallScore(
    AARRR_DIAGNOSTIC,
    {
      acquisition: computeStageScore("acquisition", answers),
      activation: computeStageScore("activation", answers),
      retention: computeStageScore("retention", answers),
      revenue: computeStageScore("revenue", answers),
      referral: computeStageScore("referral", answers),
    } as Record<Stage, number>
  );
}

/**
 * Encode a ScoringResult into a compact, URL-safe AARRR share token.
 *
 * Format (v1):  "1." + one digit (0–4) per question in fixed QUESTIONS order.
 *   e.g.  "1.342013402230114"
 *
 * The 15 answer values are the ENTIRE payload — no email, name, company,
 * timestamp, or free text. It is not PII. Opening the link recomputes the exact
 * score/breakdown via scoreSubmission(). Digits + "." are URL-safe and the
 * function is pure string work, so it also runs on the Edge runtime (OG route).
 *
 * (For multi-diagnostic encoding, see lib/diagnostics/index.ts → encodeResultToken.)
 */
export function encodeResultForURL(result: ScoringResult): string {
  return `${SHARE_FORMAT_VERSION}.${engineEncodeAnswers(AARRR_DIAGNOSTIC, result.answers)}`;
}

/**
 * Validate a legacy base64-JSON token's answers object. Every value must be an
 * integer 0–4 (the AnswerValue invariant that parseAnswerDigits enforces for the
 * v1/v2 formats); unknown keys are dropped and any out-of-range value rejects the
 * whole token. Without this, a crafted token such as `{"a":{"acq_channels":99}}`
 * decoded to answers:99 and produced absurd scores (e.g. 2475/100) on the public
 * OG image, the page <title>, and shared dashboards.
 */
function sanitizeLegacyAnswers(raw: unknown): Record<string, AnswerValue> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const src = raw as Record<string, unknown>;
  const answers: Record<string, AnswerValue> = {};
  for (const q of AARRR_DIAGNOSTIC.questions) {
    const v = src[q.id];
    if (v === undefined) continue; // tolerate a partial answer set
    if (typeof v !== "number" || !Number.isInteger(v) || v < 0 || v > 4) {
      return null; // out-of-range / non-integer answer → reject the token
    }
    answers[q.id] = v as AnswerValue;
  }
  return answers;
}

/**
 * Decode an AARRR share token back into answers + recomputed overall score.
 * Returns null for malformed tokens. Legacy base64-JSON tokens (pre-1.1) still
 * decode for backward compatibility.
 */
export function decodeResultFromURL(token: string): {
  answers: Record<string, AnswerValue>;
  overallScore: number;
  completedAt: string;
} | null {
  if (typeof token !== "string" || token.length === 0) return null;

  // v1 compact format: "1.<15 digits 0–4>"
  const dot = token.indexOf(".");
  if (dot !== -1) {
    const version = token.slice(0, dot);
    const digits = token.slice(dot + 1);
    if (version !== SHARE_FORMAT_VERSION) return null;
    const answers = engineParseAnswerDigits(AARRR_DIAGNOSTIC, digits);
    if (!answers) return null;
    return { answers, overallScore: overallFromAnswers(answers), completedAt: "" };
  }

  // Legacy base64-JSON tokens (pre-1.1). `atob` is global in browsers, the
  // Edge runtime, and Node 16+ — so we avoid Buffer entirely (keeps scoring.ts
  // importable from the Edge OG route).
  try {
    const parsed: unknown = JSON.parse(atob(token));
    if (!parsed || typeof parsed !== "object") return null;
    const obj = parsed as Record<string, unknown>;
    // Validate the answer VALUES, not just the shape: a crafted `{"a":null}`
    // token must not decode to answers:null, and `{"a":{"id":99}}` must not
    // decode to an out-of-range answer. Recompute the score from the validated
    // answers — never trust the token's own `s` field (it is attacker-supplied
    // and was previously echoed straight into the rendered score).
    const answers = sanitizeLegacyAnswers(obj.a);
    if (!answers) return null;
    return {
      answers,
      overallScore: overallFromAnswers(answers),
      completedAt: typeof obj.t === "string" ? obj.t : "",
    };
  } catch {
    return null;
  }
}

/** Human-readable label for an overall score (delegates to the shared engine). */
export function getScoreLabel(score: number): {
  label: string;
  description: string;
  urgency: "critical" | "needs-work" | "good" | "excellent";
} {
  return engineGetScoreLabel(score);
}
