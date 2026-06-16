// ─────────────────────────────────────────────────────────────────────────────
// Industry benchmark medians (0–100 scale), per diagnostic + per dimension.
//
// ⚠️ These are SYNTHESIZED PLACEHOLDERS, not licensed benchmark data. See
// datasets/benchmarks.md for full provenance and how to replace them. Every
// surface that shows these labels them as estimates.
//
// v2 generalizes benchmarks across diagnostics. The original AARRR exports
// (BENCHMARKS, compareToBenchmark) are preserved unchanged for back-compat;
// the generic API (getBenchmarks, compareDiagnosticToBenchmark) powers both
// AARRR and PLG and is the basis Slice 6 extends to per-industry depth.
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

/** Median 0–100 score per AARRR stage. */
export const BENCHMARKS: Record<Stage, number> = {
  acquisition: 52,
  activation: 45,
  retention: 50,
  revenue: 48,
  referral: 36,
};

/** Median 0–100 score per PLG dimension (synthesized, directional). */
export const PLG_BENCHMARKS: Record<string, number> = {
  ttv: 42,
  self_serve: 48,
  pql: 38,
  virality: 34,
  expansion: 46,
};

/** Benchmark medians keyed by diagnostic id → dimension key → median. */
export const BENCHMARKS_BY_DIAGNOSTIC: Record<string, Record<string, number>> = {
  aarrr: BENCHMARKS,
  plg: PLG_BENCHMARKS,
};

export type BenchmarkStatus = "above" | "below" | "at";

export interface StageBenchmark {
  stage: Stage;
  label: string;
  score: number; // the user's raw 0–100 stage score
  median: number; // benchmark median 0–100
  delta: number; // score - median (+ = ahead of median)
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

/** The weighted overall AARRR benchmark median, using the model's stage weights. */
export function overallBenchmarkMedian(): number {
  return computeOverallScore(BENCHMARKS);
}

/**
 * Compare a set of per-stage raw scores against the AARRR benchmark medians.
 * Pure — safe on the Edge runtime. Stages come back in canonical AARRR order.
 * (AARRR-specific; preserved for back-compat. Generic callers use
 * compareDiagnosticToBenchmark.)
 */
export function compareToBenchmark(
  stageScores: Record<Stage, number>
): BenchmarkComparison {
  const stages: StageBenchmark[] = STAGE_CONFIGS.map((cfg) => {
    const score = stageScores[cfg.stage] ?? 0;
    const median = BENCHMARKS[cfg.stage];
    const delta = score - median;
    return {
      stage: cfg.stage,
      label: cfg.label,
      score,
      median,
      delta,
      status: statusOf(delta),
    };
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
// GENERIC, DIAGNOSTIC-AWARE BENCHMARKS
// ─────────────────────────────────────────────────────────────────────────────

export interface DimensionBenchmark {
  key: string; // dimension key
  label: string;
  score: number; // user's raw 0–100
  median: number; // benchmark median 0–100
  delta: number; // score - median
  status: BenchmarkStatus;
}

export interface DiagnosticBenchmarkComparison {
  diagnosticId: string;
  dimensions: DimensionBenchmark[];
  overallScore: number;
  overallMedian: number;
  overallDelta: number;
  overallStatus: BenchmarkStatus;
  isEstimate: boolean;
}

/** The median table for a diagnostic (empty object if unknown id). */
export function getBenchmarks(diagnosticId: string): Record<string, number> {
  return BENCHMARKS_BY_DIAGNOSTIC[diagnosticId] ?? {};
}

/** Compare per-dimension raw scores against a diagnostic's benchmark medians. */
export function compareDiagnosticToBenchmark(
  diagnostic: Diagnostic,
  dimensionScores: Record<string, number>
): DiagnosticBenchmarkComparison {
  const medians = getBenchmarks(diagnostic.id);

  const dimensions: DimensionBenchmark[] = diagnostic.dimensions.map((dim) => {
    const score = dimensionScores[dim.key] ?? 0;
    const median = medians[dim.key] ?? 0;
    const delta = score - median;
    return {
      key: dim.key,
      label: dim.label,
      score,
      median,
      delta,
      status: statusOf(delta),
    };
  });

  const overallScore = engineOverallScore(diagnostic, dimensionScores);
  const overallMedian = engineOverallScore(diagnostic, medians);
  const overallDelta = overallScore - overallMedian;

  return {
    diagnosticId: diagnostic.id,
    dimensions,
    overallScore,
    overallMedian,
    overallDelta,
    overallStatus: statusOf(overallDelta),
    isEstimate: BENCHMARK_IS_ESTIMATE,
  };
}
