// ─────────────────────────────────────────────────────────────────────────────
// Pure view-model for the shareable score card / OG image / PDF report.
//
// As of v2 this is diagnostic-agnostic: it decodes any share token (AARRR, PLG,
// legacy), scores it on the shared engine, and returns everything the OG/report
// surfaces need — including each dimension's resolved hex color — so those
// surfaces carry no per-diagnostic knowledge.
//
// next/og's ImageResponse cannot be imported outside Next's bundler (so the OG
// route can't be unit-tested directly). All of the route's *data* logic lives
// here and is fully unit-tested; the route is a thin JSX layer. Pure + Edge-safe.
// ─────────────────────────────────────────────────────────────────────────────

import { scoreDiagnostic, getScoreLabel } from "./engine";
import { decodeShareToken, getDiagnosticOrDefault } from "./diagnostics";
import {
  compareDiagnosticToBenchmark,
  DEFAULT_INDUSTRY,
  isValidIndustry,
  type BenchmarkStatus,
} from "./benchmarks";

/** Tailwind color stem → hex, for the OG/PDF surfaces (no Tailwind there). */
export const DIMENSION_HEX: Record<string, string> = {
  blue: "#3b82f6",
  purple: "#a855f7",
  green: "#22c55e",
  yellow: "#eab308",
  orange: "#f97316",
  red: "#ef4444",
  emerald: "#34d399",
};
const DEFAULT_HEX = "#5c68f5";

export function dimensionHex(colorStem: string): string {
  return DIMENSION_HEX[colorStem] ?? DEFAULT_HEX;
}

export interface ShareDimensionRow {
  key: string;
  label: string;
  score: number; // user's raw 0–100
  median: number; // benchmark median 0–100
  delta: number; // score - median
  status: BenchmarkStatus;
  color: string; // resolved hex
  isBottleneck: boolean;
}

export interface ShareModel {
  /** false when the token was missing/invalid — render a generic card. */
  valid: boolean;
  diagnosticId: string;
  diagnosticName: string;
  diagnosticShortName: string;
  diagnosticTagline: string;
  industry: string;
  overallScore: number;
  overallLabel: string; // e.g. "Good"
  overallMedian: number;
  overallDelta: number;
  isEstimate: boolean;
  dimensions: ShareDimensionRow[];
  bottlenecks: { key: string; label: string }[];
  experiments: { title: string }[]; // top experiment titles
}

function genericModel(diagnosticId?: string, industry: string = DEFAULT_INDUSTRY): ShareModel {
  const diagnostic = getDiagnosticOrDefault(diagnosticId);
  const zeroScores = Object.fromEntries(
    diagnostic.dimensions.map((d) => [d.key, 0])
  );
  const cmp = compareDiagnosticToBenchmark(diagnostic, zeroScores, industry);
  return {
    valid: false,
    diagnosticId: diagnostic.id,
    diagnosticName: diagnostic.name,
    diagnosticShortName: diagnostic.shortName,
    diagnosticTagline: diagnostic.tagline,
    industry: cmp.industry,
    overallScore: 0,
    overallLabel: "",
    overallMedian: cmp.overallMedian,
    overallDelta: 0,
    isEstimate: cmp.isEstimate,
    dimensions: cmp.dimensions.map((d) => ({
      ...d,
      color: dimensionHex(
        diagnostic.dimensions.find((dim) => dim.key === d.key)?.color ?? ""
      ),
      isBottleneck: false,
    })),
    bottlenecks: [],
    experiments: [],
  };
}

/**
 * Build the share view-model from a URL share token (any diagnostic).
 * Returns a generic (valid:false) model for a missing/invalid token so callers
 * can always render something.
 */
export function buildShareModel(
  token: string | null | undefined,
  industry: string = DEFAULT_INDUSTRY
): ShareModel {
  const resolvedIndustry = isValidIndustry(industry) ? industry : DEFAULT_INDUSTRY;
  const decoded = token ? decodeShareToken(token) : null;
  if (!decoded) return genericModel(undefined, resolvedIndustry);

  const { diagnostic, answers } = decoded;
  const result = scoreDiagnostic(diagnostic, answers);
  const dimScores = result.dimensionResults.reduce(
    (acc, d) => {
      acc[d.dimension] = d.rawScore;
      return acc;
    },
    {} as Record<string, number>
  );

  const cmp = compareDiagnosticToBenchmark(diagnostic, dimScores, resolvedIndustry);
  const bottleneckSet = new Set(result.bottlenecks);
  const colorByKey = new Map(diagnostic.dimensions.map((d) => [d.key, d.color]));

  const dimensions: ShareDimensionRow[] = cmp.dimensions.map((d) => ({
    ...d,
    color: dimensionHex(colorByKey.get(d.key) ?? ""),
    isBottleneck: bottleneckSet.has(d.key),
  }));

  return {
    valid: true,
    diagnosticId: diagnostic.id,
    diagnosticName: diagnostic.name,
    diagnosticShortName: diagnostic.shortName,
    diagnosticTagline: diagnostic.tagline,
    industry: cmp.industry,
    overallScore: result.overallScore,
    overallLabel: getScoreLabel(result.overallScore).label,
    overallMedian: cmp.overallMedian,
    overallDelta: cmp.overallDelta,
    isEstimate: cmp.isEstimate,
    dimensions,
    bottlenecks: result.bottlenecks.map((key) => ({
      key,
      label: dimensions.find((d) => d.key === key)?.label ?? key,
    })),
    experiments: result.experiments.map((e) => ({ title: e.title })),
  };
}
