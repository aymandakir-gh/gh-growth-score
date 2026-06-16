import { describe, it, expect } from "vitest";
import { buildShareModel } from "./share-model";
import { encodeResultForURL, scoreSubmission, QUESTIONS, type AnswerValue } from "./scoring";

function tokenFor(value: AnswerValue): string {
  const answers: Record<string, AnswerValue> = {};
  for (const q of QUESTIONS) answers[q.id] = value;
  return encodeResultForURL(scoreSubmission(answers));
}

describe("buildShareModel", () => {
  it("builds a valid model from a real token", () => {
    const model = buildShareModel(tokenFor(4));
    expect(model.valid).toBe(true);
    expect(model.overallScore).toBe(100);
    expect(model.overallLabel.length).toBeGreaterThan(0);
    expect(model.stages).toHaveLength(5);
    expect(model.stages.map((s) => s.stage)).toEqual([
      "acquisition",
      "activation",
      "retention",
      "revenue",
      "referral",
    ]);
  });

  it("includes benchmark deltas per stage", () => {
    const model = buildShareModel(tokenFor(4)); // perfect → above median everywhere
    for (const s of model.stages) {
      expect(s.delta).toBe(s.score - s.median);
      expect(s.status).toBe("above");
    }
    expect(model.overallDelta).toBe(model.overallScore - model.overallMedian);
  });

  it("flags bottlenecks and surfaces up to 3 experiment titles", () => {
    const model = buildShareModel(tokenFor(0)); // all-zero → every stage weak
    expect(model.bottlenecks.length).toBeGreaterThan(0);
    expect(model.bottlenecks.length).toBeLessThanOrEqual(3);
    expect(model.experiments.length).toBeLessThanOrEqual(3);
    for (const e of model.experiments) expect(e.title.length).toBeGreaterThan(0);
    // bottleneck stages should be marked on the stage rows
    const flagged = model.stages.filter((s) => s.isBottleneck).map((s) => s.stage);
    expect(flagged.sort()).toEqual(model.bottlenecks.map((b) => b.stage).sort());
  });

  it("returns a generic (valid:false) model for a missing token", () => {
    const model = buildShareModel(null);
    expect(model.valid).toBe(false);
    expect(model.overallScore).toBe(0);
    expect(model.stages).toHaveLength(5);
  });

  it("returns a generic model for an invalid token", () => {
    expect(buildShareModel("1.999").valid).toBe(false);
    expect(buildShareModel("garbage!!!").valid).toBe(false);
  });

  it("marks benchmark data as an estimate", () => {
    expect(buildShareModel(tokenFor(3)).isEstimate).toBe(true);
  });
});
