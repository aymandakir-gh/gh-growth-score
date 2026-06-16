import { describe, it, expect } from "vitest";
import {
  BENCHMARKS,
  BENCHMARK_IS_ESTIMATE,
  compareToBenchmark,
  overallBenchmarkMedian,
} from "./benchmarks";
import { STAGE_CONFIGS, type Stage } from "./scoring";

describe("BENCHMARKS table", () => {
  it("has a median for every AARRR stage", () => {
    for (const cfg of STAGE_CONFIGS) {
      expect(typeof BENCHMARKS[cfg.stage]).toBe("number");
    }
  });

  it("every median is within 0–100", () => {
    for (const v of Object.values(BENCHMARKS)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });

  it("is flagged as an estimate (placeholder data)", () => {
    expect(BENCHMARK_IS_ESTIMATE).toBe(true);
  });

  it("overall median is the weighted blend of stage medians", () => {
    // 52*.2 + 45*.2 + 50*.25 + 48*.25 + 36*.1 = 47.5 → round 48
    expect(overallBenchmarkMedian()).toBe(48);
  });
});

describe("compareToBenchmark", () => {
  const perfect: Record<Stage, number> = {
    acquisition: 100,
    activation: 100,
    retention: 100,
    revenue: 100,
    referral: 100,
  };
  const zero: Record<Stage, number> = {
    acquisition: 0,
    activation: 0,
    retention: 0,
    revenue: 0,
    referral: 0,
  };

  it("returns all 5 stages in canonical AARRR order", () => {
    const cmp = compareToBenchmark(perfect);
    expect(cmp.stages.map((s) => s.stage)).toEqual([
      "acquisition",
      "activation",
      "retention",
      "revenue",
      "referral",
    ]);
  });

  it("marks every stage above median when the user is perfect", () => {
    const cmp = compareToBenchmark(perfect);
    for (const s of cmp.stages) {
      expect(s.status).toBe("above");
      expect(s.delta).toBe(s.score - s.median);
      expect(s.delta).toBeGreaterThan(0);
    }
    expect(cmp.overallStatus).toBe("above");
  });

  it("marks every stage below median when the user scores zero", () => {
    const cmp = compareToBenchmark(zero);
    for (const s of cmp.stages) {
      expect(s.status).toBe("below");
      expect(s.delta).toBeLessThan(0);
    }
    expect(cmp.overallStatus).toBe("below");
  });

  it("reports 'at' when a stage exactly matches its median", () => {
    const atMedian = { ...zero, acquisition: BENCHMARKS.acquisition };
    const cmp = compareToBenchmark(atMedian);
    const acq = cmp.stages.find((s) => s.stage === "acquisition");
    expect(acq?.status).toBe("at");
    expect(acq?.delta).toBe(0);
  });

  it("computes overall score + delta vs the overall median", () => {
    const cmp = compareToBenchmark(perfect);
    expect(cmp.overallScore).toBe(100);
    expect(cmp.overallMedian).toBe(overallBenchmarkMedian());
    expect(cmp.overallDelta).toBe(100 - cmp.overallMedian);
    expect(cmp.isEstimate).toBe(true);
  });
});
