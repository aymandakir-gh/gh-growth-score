import { describe, it, expect } from "vitest";
import {
  type AnswerValue,
  type Diagnostic,
  computeDimensionScore,
  computeOverallScore,
  computeDimensionScores,
  findBottlenecks,
  computeICE,
  selectTopExperiments,
  scoreDiagnostic,
  getScoreLabel,
  encodeAnswers,
  parseAnswerDigits,
} from "./engine";
import {
  AARRR_DIAGNOSTIC,
  scoreSubmission,
  QUESTIONS,
} from "./scoring";
import { listDiagnostics } from "./diagnostics";
import { PLG_DIAGNOSTIC } from "./diagnostics/plg";

function answersAll(diagnostic: Diagnostic, value: AnswerValue): Record<string, AnswerValue> {
  const a: Record<string, AnswerValue> = {};
  for (const q of diagnostic.questions) a[q.id] = value;
  return a;
}

// ─────────────────────────────────────────────────────────────────────────────
// Descriptor invariants — run for EVERY registered diagnostic. Future-proofs new
// audits: a malformed descriptor fails here.
// ─────────────────────────────────────────────────────────────────────────────
describe.each(listDiagnostics())("descriptor invariants — $id", (diagnostic) => {
  it("dimension weights sum to 1.0", () => {
    const sum = diagnostic.dimensions.reduce((s, d) => s + d.weight, 0);
    expect(Math.abs(sum - 1)).toBeLessThan(1e-9);
  });

  it("every question has a unique id and exactly 5 options", () => {
    const ids = new Set<string>();
    for (const q of diagnostic.questions) {
      expect(ids.has(q.id)).toBe(false);
      ids.add(q.id);
      expect(q.options).toHaveLength(5);
      for (const opt of q.options) expect(opt.length).toBeGreaterThan(0);
    }
  });

  it("every question maps to a known dimension", () => {
    const keys = new Set(diagnostic.dimensions.map((d) => d.key));
    for (const q of diagnostic.questions) expect(keys.has(q.dimension)).toBe(true);
  });

  it("every dimension has a non-empty experiment bank with matching dimension", () => {
    for (const d of diagnostic.dimensions) {
      const bank = diagnostic.experiments[d.key];
      expect(bank?.length ?? 0).toBeGreaterThan(0);
      for (const exp of bank) expect(exp.dimension).toBe(d.key);
    }
  });

  it("all-zero answers → 0, all-max answers → 100", () => {
    expect(scoreDiagnostic(diagnostic, answersAll(diagnostic, 0)).overallScore).toBe(0);
    expect(scoreDiagnostic(diagnostic, answersAll(diagnostic, 4)).overallScore).toBe(100);
  });

  it("token round-trips: encodeAnswers → parseAnswerDigits", () => {
    const answers = answersAll(diagnostic, 3);
    const digits = encodeAnswers(diagnostic, answers);
    expect(digits).toHaveLength(diagnostic.questions.length);
    expect(parseAnswerDigits(diagnostic, digits)).toEqual(answers);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Core scoring math
// ─────────────────────────────────────────────────────────────────────────────
describe("engine scoring math", () => {
  it("computeDimensionScore normalizes to 0–100", () => {
    expect(computeDimensionScore(AARRR_DIAGNOSTIC, "acquisition", answersAll(AARRR_DIAGNOSTIC, 2))).toBe(50);
    expect(computeDimensionScore(AARRR_DIAGNOSTIC, "acquisition", answersAll(AARRR_DIAGNOSTIC, 4))).toBe(100);
  });

  it("computeOverallScore weights by descriptor weights", () => {
    const scores = computeDimensionScores(AARRR_DIAGNOSTIC, answersAll(AARRR_DIAGNOSTIC, 4));
    expect(computeOverallScore(AARRR_DIAGNOSTIC, scores)).toBe(100);
  });

  it("findBottlenecks returns the N weakest keys, worst first", () => {
    const scores = { a: 10, b: 90, c: 50, d: 5 };
    expect(findBottlenecks(scores, 2)).toEqual(["d", "a"]);
  });

  it("computeICE = round(impact*confidence/effort)", () => {
    expect(computeICE({ title: "", description: "", impact: 9, confidence: 8, effort: 3, dimension: "x" })).toBe(24);
  });

  it("selectTopExperiments draws from bottlenecks first", () => {
    const exps = selectTopExperiments(PLG_DIAGNOSTIC, ["expansion"], 1);
    expect(exps).toHaveLength(1);
    expect(exps[0].dimension).toBe("expansion");
  });

  it("getScoreLabel bands by threshold", () => {
    expect(getScoreLabel(10).urgency).toBe("critical");
    expect(getScoreLabel(40).urgency).toBe("needs-work");
    expect(getScoreLabel(60).urgency).toBe("good");
    expect(getScoreLabel(90).urgency).toBe("excellent");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AARRR parity — scoring on the engine must equal the legacy AARRR pipeline.
// ─────────────────────────────────────────────────────────────────────────────
describe("AARRR engine parity", () => {
  const cases: AnswerValue[] = [0, 1, 2, 3, 4];
  it.each(cases)("scoreDiagnostic == scoreSubmission for all-%i answers", (v) => {
    const answers: Record<string, AnswerValue> = {};
    for (const q of QUESTIONS) answers[q.id] = v;
    const engine = scoreDiagnostic(AARRR_DIAGNOSTIC, answers);
    const legacy = scoreSubmission(answers);
    expect(engine.overallScore).toBe(legacy.overallScore);
    expect(engine.bottlenecks).toEqual(legacy.bottlenecks);
    expect(engine.dimensionResults.map((d) => [d.dimension, d.rawScore, d.rank])).toEqual(
      legacy.stageResults.map((s) => [s.stage, s.rawScore, s.rank])
    );
    expect(engine.experiments.map((e) => [e.title, e.ice])).toEqual(
      legacy.experiments.map((e) => [e.title, e.ice])
    );
  });

  it("parity holds for a mixed answer set", () => {
    const answers: Record<string, AnswerValue> = {};
    QUESTIONS.forEach((q, i) => {
      answers[q.id] = (i % 5) as AnswerValue;
    });
    const engine = scoreDiagnostic(AARRR_DIAGNOSTIC, answers);
    const legacy = scoreSubmission(answers);
    expect(engine.overallScore).toBe(legacy.overallScore);
    expect(engine.bottlenecks).toEqual(legacy.bottlenecks);
  });
});
