import { describe, it, expect } from "vitest";
import {
  INDUSTRIES,
  DEFAULT_INDUSTRY,
  isValidIndustry,
  getBenchmarks,
  compareDiagnosticToBenchmark,
  BENCHMARKS,
  PLG_BENCHMARKS,
} from "./benchmarks";
import { listDiagnostics, getDiagnosticOrDefault } from "./diagnostics";
import { type Diagnostic } from "./engine";

describe("industry list", () => {
  it("includes 'all' plus named industries", () => {
    expect(INDUSTRIES.map((i) => i.id)).toContain("all");
    expect(INDUSTRIES.length).toBeGreaterThanOrEqual(5);
    expect(DEFAULT_INDUSTRY).toBe("all");
  });

  it("isValidIndustry guards membership", () => {
    expect(isValidIndustry("fintech")).toBe(true);
    expect(isValidIndustry("nope")).toBe(false);
    expect(isValidIndustry(null)).toBe(false);
  });
});

describe.each(listDiagnostics())("benchmark depth — $id", (diagnostic: Diagnostic) => {
  it("every industry has a median for every dimension within 0–100", () => {
    for (const ind of INDUSTRIES) {
      const table = getBenchmarks(diagnostic.id, ind.id);
      for (const dim of diagnostic.dimensions) {
        const v = table[dim.key];
        expect(typeof v).toBe("number");
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      }
    }
  });

  it("unknown industry falls back to the 'all' baseline", () => {
    expect(getBenchmarks(diagnostic.id, "does-not-exist")).toEqual(
      getBenchmarks(diagnostic.id, "all")
    );
  });
});

describe("default-industry parity with v1 medians", () => {
  it("AARRR 'all' == BENCHMARKS", () => {
    expect(getBenchmarks("aarrr", "all")).toEqual(BENCHMARKS);
    expect(getBenchmarks("aarrr")).toEqual(BENCHMARKS); // default arg
  });
  it("PLG 'all' == PLG_BENCHMARKS", () => {
    expect(getBenchmarks("plg", "all")).toEqual(PLG_BENCHMARKS);
  });
});

describe("compareDiagnosticToBenchmark — industry aware", () => {
  const aarrr = getDiagnosticOrDefault("aarrr");
  const scores = { acquisition: 60, activation: 60, retention: 60, revenue: 60, referral: 60 };

  it("uses the selected industry's medians (and reports it)", () => {
    const all = compareDiagnosticToBenchmark(aarrr, scores, "all");
    const fintech = compareDiagnosticToBenchmark(aarrr, scores, "fintech");
    expect(all.industry).toBe("all");
    expect(fintech.industry).toBe("fintech");
    // fintech retention/revenue medians differ from 'all' → different overall median
    expect(fintech.overallMedian).not.toBe(all.overallMedian);
  });

  it("an invalid industry resolves back to 'all'", () => {
    const cmp = compareDiagnosticToBenchmark(aarrr, scores, "bogus");
    expect(cmp.industry).toBe("all");
    expect(cmp.overallMedian).toBe(
      compareDiagnosticToBenchmark(aarrr, scores, "all").overallMedian
    );
  });

  it("each dimension delta = score - the industry median", () => {
    const cmp = compareDiagnosticToBenchmark(aarrr, scores, "b2b-saas");
    const medians = getBenchmarks("aarrr", "b2b-saas");
    for (const d of cmp.dimensions) {
      expect(d.median).toBe(medians[d.key]);
      expect(d.delta).toBe(d.score - d.median);
    }
  });
});
