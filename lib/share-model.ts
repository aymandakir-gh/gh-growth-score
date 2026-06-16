// ─────────────────────────────────────────────────────────────────────────────
// Pure view-model for the shareable score card / OG image / downloadable report.
//
// next/og's ImageResponse cannot be imported outside Next's bundler (so the OG
// route can't be unit-tested directly). All of the route's *data* logic lives
// here instead and is fully unit-tested; the route is a thin JSX layer over
// this model. Pure + Edge-safe.
// ─────────────────────────────────────────────────────────────────────────────

import {
  type Stage,
  decodeResultFromURL,
  scoreSubmission,
  getScoreLabel,
} from "./scoring";
import {
  compareToBenchmark,
  type BenchmarkStatus,
} from "./benchmarks";

export interface ShareStageRow {
  stage: Stage;
  label: string;
  score: number; // user's raw 0–100
  median: number; // benchmark median 0–100
  delta: number; // score - median
  status: BenchmarkStatus;
  isBottleneck: boolean;
}

export interface ShareModel {
  /** false when the token was missing/invalid — render a generic card. */
  valid: boolean;
  overallScore: number;
  overallLabel: string; // e.g. "Good"
  overallMedian: number;
  overallDelta: number;
  isEstimate: boolean;
  stages: ShareStageRow[];
  bottlenecks: { stage: Stage; label: string }[];
  experiments: { title: string }[]; // top 3 experiment titles
}

function emptyModel(): ShareModel {
  const cmp = compareToBenchmark({
    acquisition: 0,
    activation: 0,
    retention: 0,
    revenue: 0,
    referral: 0,
  });
  return {
    valid: false,
    overallScore: 0,
    overallLabel: "",
    overallMedian: cmp.overallMedian,
    overallDelta: 0,
    isEstimate: cmp.isEstimate,
    stages: cmp.stages.map((s) => ({ ...s, isBottleneck: false })),
    bottlenecks: [],
    experiments: [],
  };
}

/**
 * Build the share view-model from a URL share token.
 * Returns a generic (valid:false) model for a missing/invalid token so callers
 * can always render something.
 */
export function buildShareModel(token: string | null | undefined): ShareModel {
  const decoded = token ? decodeResultFromURL(token) : null;
  if (!decoded) return emptyModel();

  const result = scoreSubmission(decoded.answers);
  const stageScores = result.stageResults.reduce(
    (acc, s) => {
      acc[s.stage] = s.rawScore;
      return acc;
    },
    {} as Record<Stage, number>
  );

  const cmp = compareToBenchmark(stageScores);
  const bottleneckSet = new Set(result.bottlenecks);

  const stages: ShareStageRow[] = cmp.stages.map((s) => ({
    ...s,
    isBottleneck: bottleneckSet.has(s.stage),
  }));

  return {
    valid: true,
    overallScore: result.overallScore,
    overallLabel: getScoreLabel(result.overallScore).label,
    overallMedian: cmp.overallMedian,
    overallDelta: cmp.overallDelta,
    isEstimate: cmp.isEstimate,
    stages,
    bottlenecks: result.bottlenecks.map((stage) => ({
      stage,
      label: stages.find((s) => s.stage === stage)?.label ?? stage,
    })),
    experiments: result.experiments.map((e) => ({ title: e.title })),
  };
}
