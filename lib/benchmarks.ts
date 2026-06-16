// ─────────────────────────────────────────────────────────────────────────────
// Industry benchmark medians per AARRR stage (0–100 scale).
//
// ⚠️ These are SYNTHESIZED PLACEHOLDERS, not licensed benchmark data. See
// datasets/benchmarks.md for full provenance and how to replace them. Every
// surface that shows these labels them as estimates.
// ─────────────────────────────────────────────────────────────────────────────

import {
  type Stage,
  STAGE_CONFIGS,
  computeOverallScore,
} from "./scoring";

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

/** The weighted overall benchmark median, using the model's stage weights. */
export function overallBenchmarkMedian(): number {
  return computeOverallScore(BENCHMARKS);
}

/**
 * Compare a set of per-stage raw scores against the benchmark medians.
 * Pure — safe on the Edge runtime. Stages come back in canonical AARRR order.
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
