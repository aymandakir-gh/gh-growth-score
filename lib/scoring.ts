// ─────────────────────────────────────────────────────────────────────────────
// Growth-Health-Score · Scoring Engine
// All questions, weights, and pure scoring functions live here.
// This file is the single source of truth — UI just renders what's here.
// ─────────────────────────────────────────────────────────────────────────────

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
// PURE SCORING FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute the raw score (0–100) for a single stage.
 * Each answer is 0–4; max per question = 4; normalized to 100.
 */
export function computeStageScore(
  stage: Stage,
  answers: Record<string, AnswerValue>
): number {
  const stageQuestions = QUESTIONS.filter((q) => q.stage === stage);
  if (stageQuestions.length === 0) return 0;

  const total = stageQuestions.reduce((sum, q) => {
    const val = answers[q.id] ?? 0;
    return sum + val;
  }, 0);

  const max = stageQuestions.length * 4; // 4 = max AnswerValue
  return Math.round((total / max) * 100);
}

/**
 * Compute the weighted overall score (0–100).
 * Weighted sum of per-stage raw scores.
 */
export function computeOverallScore(
  stageScores: Record<Stage, number>
): number {
  const weighted = STAGE_CONFIGS.reduce((sum, cfg) => {
    return sum + stageScores[cfg.stage] * cfg.weight;
  }, 0);
  return Math.round(weighted);
}

/**
 * Identify the N weakest stages by raw score.
 * Returns stages sorted ascending (worst first).
 */
export function findBottlenecks(
  stageScores: Record<Stage, number>,
  n = 3
): Stage[] {
  return (Object.entries(stageScores) as [Stage, number][])
    .sort(([, a], [, b]) => a - b)
    .slice(0, n)
    .map(([stage]) => stage);
}

/**
 * Compute ICE score for a single experiment.
 * ICE = (impact × confidence) / effort
 * All values 1–10; higher ICE = higher priority.
 */
export function computeICE(exp: Omit<Experiment, "ice">): number {
  return Math.round((exp.impact * exp.confidence) / exp.effort);
}

/**
 * Select the top 3 ICE-prioritized experiments from the weakest stages.
 * From each bottleneck stage, pick the single highest-ICE experiment.
 * If fewer than 3 bottleneck stages, fill from the next weakest.
 */
export function selectTopExperiments(
  bottlenecks: Stage[],
  n = 3
): Experiment[] {
  const experiments: Experiment[] = [];
  const stagesToSearch = [...bottlenecks];

  // Add remaining stages if we need more experiments
  for (const cfg of STAGE_CONFIGS) {
    if (!stagesToSearch.includes(cfg.stage)) {
      stagesToSearch.push(cfg.stage);
    }
  }

  for (const stage of stagesToSearch) {
    if (experiments.length >= n) break;
    const bank = EXPERIMENT_BANK[stage];
    if (!bank || bank.length === 0) continue;

    // Compute ICE for each and pick the best one
    const best = bank
      .map((exp) => ({ ...exp, ice: computeICE(exp) }))
      .sort((a, b) => b.ice - a.ice)[0];

    experiments.push(best);
  }

  return experiments.slice(0, n);
}

/**
 * Full scoring pipeline — takes raw answers, returns complete ScoringResult.
 */
export function scoreSubmission(
  answers: Record<string, AnswerValue>
): ScoringResult {
  // Per-stage raw scores
  const stageScores: Record<Stage, number> = {
    acquisition: computeStageScore("acquisition", answers),
    activation: computeStageScore("activation", answers),
    retention: computeStageScore("retention", answers),
    revenue: computeStageScore("revenue", answers),
    referral: computeStageScore("referral", answers),
  };

  const overallScore = computeOverallScore(stageScores);
  const bottlenecks = findBottlenecks(stageScores, 3);
  const experiments = selectTopExperiments(bottlenecks, 3);

  // Build sorted stage results (worst first for ranking)
  const sortedByScore = (Object.entries(stageScores) as [Stage, number][]).sort(
    ([, a], [, b]) => a - b
  );

  const stageResults: StageResult[] = STAGE_CONFIGS.map((cfg) => {
    const rawScore = stageScores[cfg.stage];
    const rank = sortedByScore.findIndex(([s]) => s === cfg.stage) + 1;
    return {
      stage: cfg.stage,
      label: cfg.label,
      emoji: cfg.emoji,
      color: cfg.color,
      rawScore,
      weightedScore: Math.round(rawScore * cfg.weight),
      weight: cfg.weight,
      questionCount: QUESTIONS.filter((q) => q.stage === cfg.stage).length,
      isBottleneck: bottlenecks.includes(cfg.stage),
      rank,
    };
  });

  return {
    overallScore,
    stageResults,
    bottlenecks,
    experiments,
    answers,
    completedAt: new Date().toISOString(),
  };
}

// Current share-token format version. Bump only if QUESTIONS order changes.
export const SHARE_FORMAT_VERSION = "1";

/** Recompute the weighted overall score directly from raw answers. */
function overallFromAnswers(answers: Record<string, AnswerValue>): number {
  const stageScores = {
    acquisition: computeStageScore("acquisition", answers),
    activation: computeStageScore("activation", answers),
    retention: computeStageScore("retention", answers),
    revenue: computeStageScore("revenue", answers),
    referral: computeStageScore("referral", answers),
  } as Record<Stage, number>;
  return computeOverallScore(stageScores);
}

/**
 * Encode a ScoringResult into a compact, URL-safe share token.
 *
 * Format (v1):  "1." + one digit (0–4) per question in fixed QUESTIONS order.
 *   e.g.  "1.342013402230114"
 *
 * The 15 answer values are the ENTIRE payload — no email, name, company,
 * timestamp, or free text. It is not PII. Opening the link recomputes the exact
 * score/breakdown via scoreSubmission(). Digits + "." are URL-safe and the
 * function is pure string work, so it also runs on the Edge runtime (OG route).
 */
export function encodeResultForURL(result: ScoringResult): string {
  const digits = QUESTIONS.map((q) => {
    const v = result.answers[q.id];
    return typeof v === "number" && v >= 0 && v <= 4 ? String(v) : "0";
  }).join("");
  return `${SHARE_FORMAT_VERSION}.${digits}`;
}

/**
 * Decode a share token back into answers + recomputed overall score.
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
    if (digits.length !== QUESTIONS.length) return null;
    if (!/^[0-4]+$/.test(digits)) return null;

    const answers: Record<string, AnswerValue> = {};
    QUESTIONS.forEach((q, i) => {
      answers[q.id] = Number(digits[i]) as AnswerValue;
    });
    return { answers, overallScore: overallFromAnswers(answers), completedAt: "" };
  }

  // Legacy base64-JSON tokens (pre-1.1). `atob` is global in browsers, the
  // Edge runtime, and Node 16+ — so we avoid Buffer entirely (keeps scoring.ts
  // importable from the Edge OG route).
  try {
    const decoded = atob(token);
    const parsed = JSON.parse(decoded);
    if (!parsed || typeof parsed !== "object" || typeof parsed.a !== "object") {
      return null;
    }
    return {
      answers: parsed.a as Record<string, AnswerValue>,
      overallScore:
        typeof parsed.s === "number"
          ? parsed.s
          : overallFromAnswers(parsed.a as Record<string, AnswerValue>),
      completedAt: typeof parsed.t === "string" ? parsed.t : "",
    };
  } catch {
    return null;
  }
}

/**
 * Returns a human-readable label for an overall score.
 */
export function getScoreLabel(score: number): {
  label: string;
  description: string;
  urgency: "critical" | "needs-work" | "good" | "excellent";
} {
  if (score < 30)
    return {
      label: "Critical",
      description: "Your growth engine has serious structural gaps.",
      urgency: "critical",
    };
  if (score < 55)
    return {
      label: "Needs Work",
      description: "Foundation exists but multiple stages are underperforming.",
      urgency: "needs-work",
    };
  if (score < 75)
    return {
      label: "Good",
      description: "You're growing but there's clear upside in your bottlenecks.",
      urgency: "good",
    };
  return {
    label: "Excellent",
    description: "Strong growth engine — focus on compounding your strengths.",
    urgency: "excellent",
  };
}
