import { describe, it, expect } from "vitest";
import { buildShareModel } from "./share-model";
import { encodeResultForURL, scoreSubmission, QUESTIONS, type AnswerValue } from "./scoring";
import { encodeResultToken } from "./diagnostics";
import { PLG_DIAGNOSTIC } from "./diagnostics/plg";

function tokenFor(value: AnswerValue): string {
  const answers: Record<string, AnswerValue> = {};
  for (const q of QUESTIONS) answers[q.id] = value;
  return encodeResultForURL(scoreSubmission(answers));
}

describe("buildShareModel — AARRR", () => {
  it("builds a valid model from a real token", () => {
    const model = buildShareModel(tokenFor(4));
    expect(model.valid).toBe(true);
    expect(model.diagnosticId).toBe("aarrr");
    expect(model.overallScore).toBe(100);
    expect(model.overallLabel.length).toBeGreaterThan(0);
    expect(model.dimensions).toHaveLength(5);
    expect(model.dimensions.map((s) => s.key)).toEqual([
      "acquisition",
      "activation",
      "retention",
      "revenue",
      "referral",
    ]);
  });

  it("includes benchmark deltas per dimension", () => {
    const model = buildShareModel(tokenFor(4)); // perfect → above median everywhere
    for (const s of model.dimensions) {
      expect(s.delta).toBe(s.score - s.median);
      expect(s.status).toBe("above");
      expect(s.color).toMatch(/^#/);
    }
    expect(model.overallDelta).toBe(model.overallScore - model.overallMedian);
  });

  it("flags bottlenecks and surfaces up to 3 experiment titles", () => {
    const model = buildShareModel(tokenFor(0)); // all-zero → every dimension weak
    expect(model.bottlenecks.length).toBeGreaterThan(0);
    expect(model.bottlenecks.length).toBeLessThanOrEqual(3);
    expect(model.experiments.length).toBeLessThanOrEqual(3);
    for (const e of model.experiments) expect(e.title.length).toBeGreaterThan(0);
    const flagged = model.dimensions.filter((s) => s.isBottleneck).map((s) => s.key);
    expect(flagged.sort()).toEqual(model.bottlenecks.map((b) => b.key).sort());
  });

  it("returns a generic (valid:false) model for a missing token", () => {
    const model = buildShareModel(null);
    expect(model.valid).toBe(false);
    expect(model.overallScore).toBe(0);
    expect(model.dimensions).toHaveLength(5);
    expect(model.diagnosticId).toBe("aarrr");
  });

  it("returns a generic model for an invalid token", () => {
    expect(buildShareModel("1.999").valid).toBe(false);
    expect(buildShareModel("garbage!!!").valid).toBe(false);
  });

  it("does not throw on a crafted null-answers legacy token (regression)", () => {
    // Previously decoded to answers:null and crashed scoreDiagnostic.
    expect(() => buildShareModel(btoa('{"a":null,"s":42}'))).not.toThrow();
    expect(buildShareModel(btoa('{"a":null,"s":42}')).valid).toBe(false);
  });

  it("rejects a legacy token whose answers are out of the 0–4 range (security)", () => {
    // Crafted base64 tokens previously bypassed answer validation and rendered
    // absurd scores (e.g. 2475/100) in the public OG image and shared dashboard.
    const single = btoa(JSON.stringify({ a: { acq_channels: 50 } }));
    expect(buildShareModel(single).valid).toBe(false);
    expect(buildShareModel(single).overallScore).toBe(0); // generic fallback model

    const allBig = btoa(
      JSON.stringify({ a: Object.fromEntries(QUESTIONS.map((q) => [q.id, 99])), s: 999 }),
    );
    expect(buildShareModel(allBig).valid).toBe(false);
  });

  it("still decodes a well-formed legacy base64 token (0–4 answers)", () => {
    const token = btoa(
      JSON.stringify({ a: Object.fromEntries(QUESTIONS.map((q) => [q.id, 4])) }),
    );
    const model = buildShareModel(token);
    expect(model.valid).toBe(true);
    expect(model.overallScore).toBeGreaterThanOrEqual(0);
    expect(model.overallScore).toBeLessThanOrEqual(100);
  });

  it("marks benchmark data as an estimate", () => {
    expect(buildShareModel(tokenFor(3)).isEstimate).toBe(true);
  });
});

describe("buildShareModel — PLG", () => {
  function plgToken(value: AnswerValue): string {
    const answers: Record<string, AnswerValue> = {};
    for (const q of PLG_DIAGNOSTIC.questions) answers[q.id] = value;
    return encodeResultToken(PLG_DIAGNOSTIC, answers);
  }

  it("decodes a v2 PLG token and scores it", () => {
    const model = buildShareModel(plgToken(4));
    expect(model.valid).toBe(true);
    expect(model.diagnosticId).toBe("plg");
    expect(model.diagnosticShortName).toBe("PLG");
    expect(model.overallScore).toBe(100);
    expect(model.dimensions.map((d) => d.key)).toEqual([
      "ttv",
      "self_serve",
      "pql",
      "virality",
      "expansion",
    ]);
  });

  it("flags PLG bottlenecks on all-zero answers", () => {
    const model = buildShareModel(plgToken(0));
    expect(model.overallScore).toBe(0);
    expect(model.bottlenecks.length).toBe(3);
    const flagged = model.dimensions.filter((d) => d.isBottleneck).map((d) => d.key);
    expect(flagged.sort()).toEqual(model.bottlenecks.map((b) => b.key).sort());
  });
});
