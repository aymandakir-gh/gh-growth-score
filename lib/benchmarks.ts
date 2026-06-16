// ─────────────────────────────────────────────────────────────────────────────
// Industry benchmark medians (0–100), per diagnostic × per industry × per
// dimension.
//
// ⚠️ SYNTHESIZED PLACEHOLDERS, not licensed benchmark data. See
// datasets/benchmarks.md for full provenance and how to replace them. Every
// surface that shows these labels them as estimates.
//
// The default industry ("all") reproduces the original v1 medians exactly, so
// existing AARRR behavior + tests are unchanged; other industries layer on top.
// ─────────────────────────────────────────────────────────────────────────────

import {
  type Stage,
  STAGE_CONFIGS,
  computeOverallScore,
} from "./scoring";
import {
  type Diagnostic,
  computeOverallScore as engineOverallScore,
} from "./engine";

export const BENCHMARK_SOURCE =
  "Synthesized placeholder (see datasets/benchmarks.md) — not licensed data";
export const BENCHMARK_AS_OF = "2026-06-16";
/** True while the medians are estimates rather than authoritative data. */
export const BENCHMARK_IS_ESTIMATE = true;

/** Median 0–100 score per AARRR stage (the "all industries" baseline). */
export const BENCHMARKS: Record<Stage, number> = {
  acquisition: 52,
  activation: 45,
  retention: 50,
  revenue: 48,
  referral: 36,
};

/** Median 0–100 score per PLG dimension (the "all industries" baseline). */
export const PLG_BENCHMARKS: Record<string, number> = {
  ttv: 42,
  self_serve: 48,
  pql: 38,
  virality: 34,
  expansion: 46,
};

// ─── Industries ──────────────────────────────────────────────────────────────
export interface Industry {
  id: string;
  label: string;
}

export const INDUSTRIES: Industry[] = [
  { id: "all", label: "All industries" },
  { id: "b2b-saas", label: "B2B SaaS" },
  { id: "plg-saas", label: "PLG SaaS" },
  { id: "marketplace", label: "Marketplace" },
  { id: "fintech", label: "Fintech" },
];

export const DEFAULT_INDUSTRY = "all";

export function isValidIndustry(id: string | null | undefined): boolean {
  return !!id && INDUSTRIES.some((i) => i.id === id);
}

/**
 * Median tables: diagnostic → industry → dimension → median.
 * `all` is the canonical baseline; the rest are directional synthesized
 * variations documented in datasets/benchmarks.md.
 */
export const BENCHMARKS_BY_INDUSTRY: Record<
  string,
  Record<string, Record<string, number>>
> = {
  aarrr: {
    all: BENCHMARKS,
    "b2b-saas": { acquisition: 50, activation: 47, retention: 55, revenue: 52, referral: 33 },
    "plg-saas": { acquisition: 55, activation: 52, retention: 48, revenue: 45, referral: 44 },
    marketplace: { acquisition: 58, activation: 44, retention: 42, revenue: 46, referral: 48 },
    fintech: { acquisition: 48, activation: 46, retention: 58, revenue: 55, referral: 30 },
  },
  plg: {
    all: PLG_BENCHMARKS,
    "b2b-saas": { ttv: 40, self_serve: 44, pql: 44, virality: 30, expansion: 50 },
    "plg-saas": { ttv: 52, self_serve: 56, pql: 42, virality: 44, expansion: 48 },
    marketplace: { ttv: 46, self_serve: 50, pql: 34, virality: 50, expansion: 40 },
    fintech: { ttv: 44, self_serve: 46, pql: 40, virality: 28, expansion: 52 },
  },
};

/** Back-compat: the "all"-industry table per diagnostic. */
export const BENCHMARKS_BY_DIAGNOSTIC: Record<string, Record<string, number>> = {
  aarrr: BENCHMARKS,
  plg: PLG_BENCHMARKS,
};

export type BenchmarkStatus = "above" | "below" | "at";

export interface StageBenchmark {
  stage: Stage;
  label: string;
  score: number;
  median: number;
  delta: number;
  status: BenchmarkStatus;
}

export interface BenchmarkComparison {
  stages: StageBenchmark[];
  overallScore: number;
  overallMedian: number;
  overallDelta: number;
  overallStatus: BenchmarkStatus;
  isEstimate: boolean;
}

function statusOf(delta: number): BenchmarkStatus {
  if (delta > 0) return "above";
  if (delta < 0) return "below";
  return "at";
}

/** The weighted overall AARRR ("all") benchmark median. */
export function overallBenchmarkMedian(): number {
  return computeOverallScore(BENCHMARKS);
}

/**
 * Compare per-stage raw scores against the AARRR ("all") benchmark medians.
 * AARRR-specific; preserved for back-compat. Generic + industry-aware callers
 * use compareDiagnosticToBenchmark.
 */
export function compareToBenchmark(
  stageScores: Record<Stage, number>
): BenchmarkComparison {
  const stages: StageBenchmark[] = STAGE_CONFIGS.map((cfg) => {
    const score = stageScores[cfg.stage] ?? 0;
    const median = BENCHMARKS[cfg.stage];
    const delta = score - median;
    return { stage: cfg.stage, label: cfg.label, score, median, delta, status: statusOf(delta) };
  });

  const overallScore = computeOverallScore(stageScores);
  const overallMedian = overallBenchmarkMedian();
  const overallDelta = overallScore - overallMedian;

  return {
    stages,
    overallScore,
    overallMedian,
    overallDelta,
    overallStatus: statusOf(overallDelta),
    isEstimate: BENCHMARK_IS_ESTIMATE,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GENERIC, DIAGNOSTIC + INDUSTRY-AWARE BENCHMARKS
// ─────────────────────────────────────────────────────────────────────────────

export interface DimensionBenchmark {
  key: string;
  label: string;
  score: number;
  median: number;
  delta: number;
  status: BenchmarkStatus;
}

export interface DiagnosticBenchmarkComparison {
  diagnosticId: string;
  industry: string;
  dimensions: DimensionBenchmark[];
  overallScore: number;
  overallMedian: number;
  overallDelta: number;
  overallStatus: BenchmarkStatus;
  isEstimate: boolean;
}

/**
 * The median table for a diagnostic + industry. Falls back to the diagnostic's
 * "all" baseline for an unknown industry, then to {} for an unknown diagnostic.
 */
export function getBenchmarks(
  diagnosticId: string,
  industry: string = DEFAULT_INDUSTRY
): Record<string, number> {
  const byIndustry = BENCHMARKS_BY_INDUSTRY[diagnosticId];
  if (!byIndustry) return {};
  return byIndustry[industry] ?? byIndustry[DEFAULT_INDUSTRY] ?? {};
}

/** Compare per-dimension raw scores against a diagnostic + industry's medians. */
export function compareDiagnosticToBenchmark(
  diagnostic: Diagnostic,
  dimensionScores: Record<string, number>,
  industry: string = DEFAULT_INDUSTRY
): DiagnosticBenchmarkComparison {
  const resolvedIndustry = isValidIndustry(industry) ? industry : DEFAULT_INDUSTRY;
  const medians = getBenchmarks(diagnostic.id, resolvedIndustry);

  const dimensions: DimensionBenchmark[] = diagnostic.dimensions.map((dim) => {
    const score = dimensionScores[dim.key] ?? 0;
    const median = medians[dim.key] ?? 0;
    const delta = score - median;
    return { key: dim.key, label: dim.label, score, median, delta, status: statusOf(delta) };
  });

  const overallScore = engineOverallScore(diagnostic, dimensionScores);
  const overallMedian = engineOverallScore(diagnostic, medians);
  const overallDelta = overallScore - overallMedian;

  return {
    diagnosticId: diagnostic.id,
    industry: resolvedIndustry,
    dimensions,
    overallScore,
    overallMedian,
    overallDelta,
    overallStatus: statusOf(overallDelta),
    isEstimate: BENCHMARK_IS_ESTIMATE,
  };
}
