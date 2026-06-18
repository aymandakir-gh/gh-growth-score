// ─────────────────────────────────────────────────────────────────────────────
// Diagnostic Engine — the shared, generic scoring core.
//
// One pure, Edge-safe engine powers EVERY diagnostic (AARRR, PLG, …). A
// diagnostic is just data: a `Diagnostic` descriptor (dimensions + questions +
// experiments). Scoring, bottleneck ranking, ICE experiment selection, and the
// share codec all operate on that descriptor — so adding an audit is adding a
// descriptor, not new engine code.
//
// No DOM, no network, no Node-only APIs → importable from the `next/og` Edge
// route. `lib/scoring.ts` (AARRR) delegates to this file; its 155 tests are the
// parity guard that this generalization matches the original behavior exactly.
// ─────────────────────────────────────────────────────────────────────────────

export type AnswerValue = 0 | 1 | 2 | 3 | 4; // 0 = worst, 4 = best

export type ScoreUrgency = "critical" | "needs-work" | "good" | "excellent";

/**
 * Canonical 0–100 score-band boundaries, shared by every consumer that colors,
 * labels, or buckets a score: getScoreLabel (here), getScoreColor
 * (StageScoreCard), scoreBand (recommendations), and the results legend strings
 * (i18n). A score < critical is the worst band; >= good is the best.
 *
 * These MUST be the single source of truth — the results legend in lib/i18n.ts
 * advertises these exact numbers to users, so any divergence is a visible bug.
 */
export const SCORE_BAND_BOUNDS = {
  /** below this → "Critical" (red) */
  critical: 30,
  /** below this → "Needs Work" (yellow) */
  needsWork: 55,
  /** below this → "Good" (green); at/above → "Excellent" (emerald) */
  good: 75,
} as const;

/** One scored axis of a diagnostic (an AARRR "stage", a PLG "pillar", …). */
export interface DimensionConfig {
  key: string; // stable id, e.g. "acquisition"
  label: string;
  emoji: string;
  weight: number; // must sum to 1.0 across a diagnostic's dimensions
  description: string;
  color: string; // tailwind color stem, e.g. "blue"
}

export interface EngineQuestion {
  id: string;
  dimension: string; // references DimensionConfig.key
  text: string;
  hint?: string;
  options: [string, string, string, string, string]; // index = AnswerValue
}

export interface EngineExperiment {
  title: string;
  description: string;
  impact: number; // 1–10
  confidence: number; // 1–10
  effort: number; // 1–10 (lower = easier)
  ice: number; // computed: round(impact * confidence / effort)
  dimension: string;
}

/** A complete, self-describing diagnostic. Pure data. */
export interface Diagnostic {
  id: string; // registry key + token tag, e.g. "aarrr" | "plg"
  slug: string; // url-friendly, e.g. "aarrr"
  name: string; // full title, e.g. "Growth Health Score"
  shortName: string; // compact label, e.g. "AARRR"
  tagline: string;
  emoji: string;
  dimensions: DimensionConfig[];
  questions: EngineQuestion[];
  experiments: Record<string, EngineExperiment[]>; // keyed by dimension key
}

export interface DimensionResult {
  dimension: string;
  label: string;
  emoji: string;
  color: string;
  rawScore: number; // 0–100
  weightedScore: number; // round(rawScore * weight)
  weight: number;
  questionCount: number;
  isBottleneck: boolean;
  rank: number; // 1 = worst
}

export interface DiagnosticResult {
  diagnosticId: string;
  overallScore: number; // 0–100 weighted
  dimensionResults: DimensionResult[];
  bottlenecks: string[]; // weakest dimension keys (worst first)
  experiments: EngineExperiment[]; // top ICE-prioritized experiments
  answers: Record<string, AnswerValue>;
  completedAt: string; // ISO timestamp
}

// ─────────────────────────────────────────────────────────────────────────────
// PURE SCORING
// ─────────────────────────────────────────────────────────────────────────────

/** Raw 0–100 score for one dimension. Each answer 0–4; normalized to 100. */
export function computeDimensionScore(
  diagnostic: Diagnostic,
  dimension: string,
  answers: Record<string, AnswerValue>
): number {
  const qs = diagnostic.questions.filter((q) => q.dimension === dimension);
  if (qs.length === 0) return 0;
  const total = qs.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0);
  const max = qs.length * 4;
  return Math.round((total / max) * 100);
}

/** Build the per-dimension raw scores in canonical (descriptor) order. */
export function computeDimensionScores(
  diagnostic: Diagnostic,
  answers: Record<string, AnswerValue>
): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const dim of diagnostic.dimensions) {
    scores[dim.key] = computeDimensionScore(diagnostic, dim.key, answers);
  }
  return scores;
}

/** Weighted overall 0–100 using the descriptor's dimension weights. */
export function computeOverallScore(
  diagnostic: Diagnostic,
  dimensionScores: Record<string, number>
): number {
  const weighted = diagnostic.dimensions.reduce(
    (sum, dim) => sum + (dimensionScores[dim.key] ?? 0) * dim.weight,
    0
  );
  return Math.round(weighted);
}

/** The N weakest dimensions by raw score (worst first; ties keep descriptor order). */
export function findBottlenecks(
  dimensionScores: Record<string, number>,
  n = 3
): string[] {
  return (Object.entries(dimensionScores) as [string, number][])
    .sort(([, a], [, b]) => a - b)
    .slice(0, n)
    .map(([dimension]) => dimension);
}

/** ICE = round(impact × confidence / effort). Higher = do first. */
export function computeICE(exp: Omit<EngineExperiment, "ice">): number {
  return Math.round((exp.impact * exp.confidence) / exp.effort);
}

/**
 * Top N ICE-prioritized experiments: from each bottleneck dimension (then the
 * remaining dimensions in descriptor order) pick that dimension's single
 * highest-ICE experiment, until N are collected.
 */
export function selectTopExperiments(
  diagnostic: Diagnostic,
  bottlenecks: string[],
  n = 3
): EngineExperiment[] {
  const experiments: EngineExperiment[] = [];
  const order = [...bottlenecks];
  for (const dim of diagnostic.dimensions) {
    if (!order.includes(dim.key)) order.push(dim.key);
  }

  for (const dimension of order) {
    if (experiments.length >= n) break;
    const bank = diagnostic.experiments[dimension];
    if (!bank || bank.length === 0) continue;
    const best = bank
      .map((exp) => ({ ...exp, ice: computeICE(exp) }))
      .sort((a, b) => b.ice - a.ice)[0];
    experiments.push(best);
  }

  return experiments.slice(0, n);
}

/** Full scoring pipeline for any diagnostic. */
export function scoreDiagnostic(
  diagnostic: Diagnostic,
  answers: Record<string, AnswerValue>
): DiagnosticResult {
  const dimensionScores = computeDimensionScores(diagnostic, answers);
  const overallScore = computeOverallScore(diagnostic, dimensionScores);
  const bottlenecks = findBottlenecks(dimensionScores, 3);
  const experiments = selectTopExperiments(diagnostic, bottlenecks, 3);

  const sortedByScore = (
    Object.entries(dimensionScores) as [string, number][]
  ).sort(([, a], [, b]) => a - b);

  const bottleneckSet = new Set(bottlenecks);
  const dimensionResults: DimensionResult[] = diagnostic.dimensions.map((dim) => {
    const rawScore = dimensionScores[dim.key];
    const rank = sortedByScore.findIndex(([k]) => k === dim.key) + 1;
    return {
      dimension: dim.key,
      label: dim.label,
      emoji: dim.emoji,
      color: dim.color,
      rawScore,
      weightedScore: Math.round(rawScore * dim.weight),
      weight: dim.weight,
      questionCount: diagnostic.questions.filter((q) => q.dimension === dim.key)
        .length,
      isBottleneck: bottleneckSet.has(dim.key),
      rank,
    };
  });

  return {
    diagnosticId: diagnostic.id,
    overallScore,
    dimensionResults,
    bottlenecks,
    experiments,
    answers,
    completedAt: new Date().toISOString(),
  };
}

/** Human-readable label for an overall 0–100 score. Shared across diagnostics. */
export function getScoreLabel(score: number): {
  label: string;
  description: string;
  urgency: ScoreUrgency;
} {
  if (score < SCORE_BAND_BOUNDS.critical)
    return {
      label: "Critical",
      description: "Your growth engine has serious structural gaps.",
      urgency: "critical",
    };
  if (score < SCORE_BAND_BOUNDS.needsWork)
    return {
      label: "Needs Work",
      description: "Foundation exists but multiple stages are underperforming.",
      urgency: "needs-work",
    };
  if (score < SCORE_BAND_BOUNDS.good)
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

// ─────────────────────────────────────────────────────────────────────────────
// SHARE CODEC (low-level, descriptor-scoped)
//
// A token carries ONLY answer digits + a diagnostic tag — no PII. High-level
// multi-diagnostic encode/decode (token version detection, registry lookup)
// lives in lib/diagnostics/index.ts, which can see every descriptor.
// ─────────────────────────────────────────────────────────────────────────────

/** One digit (0–4) per question, in descriptor order. The entire payload. */
export function encodeAnswers(
  diagnostic: Diagnostic,
  answers: Record<string, AnswerValue>
): string {
  return diagnostic.questions
    .map((q) => {
      const v = answers[q.id];
      return typeof v === "number" && v >= 0 && v <= 4 ? String(v) : "0";
    })
    .join("");
}

/**
 * Parse a digit string back into answers for a given descriptor.
 * Returns null when the length or digit range is invalid.
 */
export function parseAnswerDigits(
  diagnostic: Diagnostic,
  digits: string
): Record<string, AnswerValue> | null {
  if (digits.length !== diagnostic.questions.length) return null;
  if (!/^[0-4]+$/.test(digits)) return null;
  const answers: Record<string, AnswerValue> = {};
  diagnostic.questions.forEach((q, i) => {
    answers[q.id] = Number(digits[i]) as AnswerValue;
  });
  return answers;
}
