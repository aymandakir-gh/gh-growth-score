import { describe, it, expect } from "vitest";
import {
  QUESTIONS,
  STAGE_CONFIGS,
  computeStageScore,
  computeOverallScore,
  findBottlenecks,
  computeICE,
  selectTopExperiments,
  scoreSubmission,
  encodeResultForURL,
  decodeResultFromURL,
  getScoreLabel,
  AnswerValue,
  Stage,
  EXPERIMENT_BANK,
} from "./scoring";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function buildAnswers(overrideStage?: Stage, value?: AnswerValue): Record<string, AnswerValue> {
  return Object.fromEntries(
    QUESTIONS.map((q) => [
      q.id,
      overrideStage && q.stage === overrideStage ? (value ?? 0) : (2 as AnswerValue),
    ])
  );
}

function allAnswers(value: AnswerValue): Record<string, AnswerValue> {
  return Object.fromEntries(QUESTIONS.map((q) => [q.id, value]));
}

// ─────────────────────────────────────────────────────────────────────────────
// Schema / data integrity
// ─────────────────────────────────────────────────────────────────────────────

describe("data integrity", () => {
  it("stage weights sum to 1.0", () => {
    const total = STAGE_CONFIGS.reduce((sum, c) => sum + c.weight, 0);
    expect(total).toBeCloseTo(1.0, 5);
  });

  it("every question belongs to a valid stage", () => {
    const validStages = new Set(STAGE_CONFIGS.map((c) => c.stage));
    for (const q of QUESTIONS) {
      expect(validStages.has(q.stage)).toBe(true);
    }
  });

  it("every question has exactly 5 options", () => {
    for (const q of QUESTIONS) {
      expect(q.options).toHaveLength(5);
    }
  });

  it("all question IDs are unique", () => {
    const ids = QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("experiment bank covers all 5 stages", () => {
    const stages: Stage[] = ["acquisition", "activation", "retention", "revenue", "referral"];
    for (const stage of stages) {
      expect(EXPERIMENT_BANK[stage].length).toBeGreaterThan(0);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// computeStageScore
// ─────────────────────────────────────────────────────────────────────────────

describe("computeStageScore", () => {
  it("returns 0 when all answers are 0", () => {
    const answers = allAnswers(0);
    expect(computeStageScore("acquisition", answers)).toBe(0);
    expect(computeStageScore("retention", answers)).toBe(0);
  });

  it("returns 100 when all answers are 4", () => {
    const answers = allAnswers(4);
    expect(computeStageScore("acquisition", answers)).toBe(100);
    expect(computeStageScore("referral", answers)).toBe(100);
  });

  it("returns 50 when all answers are 2", () => {
    const answers = allAnswers(2);
    expect(computeStageScore("activation", answers)).toBe(50);
  });

  it("correctly handles partial answers (missing = 0)", () => {
    // One question in acquisition answered as 4, rest as 0
    const stageQuestions = QUESTIONS.filter((q) => q.stage === "acquisition");
    const answers: Record<string, AnswerValue> = {};
    answers[stageQuestions[0].id] = 4;
    // Others missing → default to 0
    const score = computeStageScore("acquisition", answers);
    // 4 / (stageQuestions.length * 4) * 100
    const expected = Math.round((4 / (stageQuestions.length * 4)) * 100);
    expect(score).toBe(expected);
  });

  it("is independent across stages", () => {
    const answersA = buildAnswers("acquisition", 4); // acquisition=100, others=50
    const answersB = buildAnswers("acquisition", 0); // acquisition=0, others=50

    const acqA = computeStageScore("acquisition", answersA);
    const acqB = computeStageScore("acquisition", answersB);
    const retA = computeStageScore("retention", answersA);
    const retB = computeStageScore("retention", answersB);

    expect(acqA).toBe(100);
    expect(acqB).toBe(0);
    expect(retA).toBe(retB); // retention unchanged
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// computeOverallScore
// ─────────────────────────────────────────────────────────────────────────────

describe("computeOverallScore", () => {
  it("returns 0 when all stage scores are 0", () => {
    const stageScores: Record<Stage, number> = {
      acquisition: 0,
      activation: 0,
      retention: 0,
      revenue: 0,
      referral: 0,
    };
    expect(computeOverallScore(stageScores)).toBe(0);
  });

  it("returns 100 when all stage scores are 100", () => {
    const stageScores: Record<Stage, number> = {
      acquisition: 100,
      activation: 100,
      retention: 100,
      revenue: 100,
      referral: 100,
    };
    expect(computeOverallScore(stageScores)).toBe(100);
  });

  it("correctly weights stages", () => {
    // Only revenue=100, all others=0. Revenue weight=0.25 → expect 25
    const stageScores: Record<Stage, number> = {
      acquisition: 0,
      activation: 0,
      retention: 0,
      revenue: 100,
      referral: 0,
    };
    expect(computeOverallScore(stageScores)).toBe(25);
  });

  it("correctly weights retention", () => {
    // Only retention=100, all others=0. Retention weight=0.25 → expect 25
    const stageScores: Record<Stage, number> = {
      acquisition: 0,
      activation: 0,
      retention: 100,
      revenue: 0,
      referral: 0,
    };
    expect(computeOverallScore(stageScores)).toBe(25);
  });

  it("referral has lowest weight", () => {
    // Only referral=100 → expect 10
    const stageScores: Record<Stage, number> = {
      acquisition: 0,
      activation: 0,
      retention: 0,
      revenue: 0,
      referral: 100,
    };
    expect(computeOverallScore(stageScores)).toBe(10);
  });

  it("returns 50 when all stages are 50", () => {
    const stageScores: Record<Stage, number> = {
      acquisition: 50,
      activation: 50,
      retention: 50,
      revenue: 50,
      referral: 50,
    };
    expect(computeOverallScore(stageScores)).toBe(50);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// findBottlenecks
// ─────────────────────────────────────────────────────────────────────────────

describe("findBottlenecks", () => {
  it("returns 3 weakest stages by default", () => {
    const scores: Record<Stage, number> = {
      acquisition: 10,
      activation: 20,
      retention: 90,
      revenue: 80,
      referral: 5,
    };
    const bottlenecks = findBottlenecks(scores);
    expect(bottlenecks).toHaveLength(3);
    expect(bottlenecks[0]).toBe("referral");   // score=5 (lowest)
    expect(bottlenecks[1]).toBe("acquisition"); // score=10
    expect(bottlenecks[2]).toBe("activation"); // score=20
  });

  it("respects n parameter", () => {
    const scores: Record<Stage, number> = {
      acquisition: 10,
      activation: 20,
      retention: 30,
      revenue: 40,
      referral: 5,
    };
    expect(findBottlenecks(scores, 1)).toHaveLength(1);
    expect(findBottlenecks(scores, 5)).toHaveLength(5);
  });

  it("handles ties gracefully (just returns n items)", () => {
    const scores: Record<Stage, number> = {
      acquisition: 50,
      activation: 50,
      retention: 50,
      revenue: 50,
      referral: 50,
    };
    expect(findBottlenecks(scores, 3)).toHaveLength(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// computeICE
// ─────────────────────────────────────────────────────────────────────────────

describe("computeICE", () => {
  it("computes correctly: (impact × confidence) / effort", () => {
    expect(
      computeICE({ title: "t", description: "d", stage: "acquisition", impact: 8, confidence: 7, effort: 4 })
    ).toBe(Math.round((8 * 7) / 4)); // 14
  });

  it("higher effort = lower ICE", () => {
    const low = computeICE({ title: "", description: "", stage: "acquisition", impact: 8, confidence: 8, effort: 2 });
    const high = computeICE({ title: "", description: "", stage: "acquisition", impact: 8, confidence: 8, effort: 8 });
    expect(low).toBeGreaterThan(high);
  });

  it("higher impact = higher ICE", () => {
    const low = computeICE({ title: "", description: "", stage: "acquisition", impact: 3, confidence: 5, effort: 3 });
    const high = computeICE({ title: "", description: "", stage: "acquisition", impact: 9, confidence: 5, effort: 3 });
    expect(high).toBeGreaterThan(low);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// selectTopExperiments
// ─────────────────────────────────────────────────────────────────────────────

describe("selectTopExperiments", () => {
  it("returns 3 experiments for 3 bottlenecks", () => {
    const bottlenecks: Stage[] = ["acquisition", "activation", "retention"];
    const experiments = selectTopExperiments(bottlenecks, 3);
    expect(experiments).toHaveLength(3);
  });

  it("each experiment has a computed ICE score > 0", () => {
    const experiments = selectTopExperiments(["acquisition", "retention", "revenue"], 3);
    for (const exp of experiments) {
      expect(exp.ice).toBeGreaterThan(0);
    }
  });

  it("experiments map to the correct stages", () => {
    const bottlenecks: Stage[] = ["acquisition", "activation", "retention"];
    const experiments = selectTopExperiments(bottlenecks, 3);
    const expStages = experiments.map((e) => e.stage);
    for (const stage of bottlenecks) {
      expect(expStages).toContain(stage);
    }
  });

  it("picks highest ICE from each stage bank", () => {
    const experiments = selectTopExperiments(["revenue"], 1);
    expect(experiments).toHaveLength(1);
    // The selected experiment should have the max ICE of the revenue bank
    const revenueBank = EXPERIMENT_BANK.revenue.map((e) => ({
      ...e,
      ice: computeICE(e),
    }));
    const maxICE = Math.max(...revenueBank.map((e) => e.ice));
    expect(experiments[0].ice).toBe(maxICE);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// scoreSubmission (full pipeline)
// ─────────────────────────────────────────────────────────────────────────────

describe("scoreSubmission", () => {
  it("full pipeline with all-zero answers → overall=0", () => {
    const result = scoreSubmission(allAnswers(0));
    expect(result.overallScore).toBe(0);
    expect(result.stageResults.every((s) => s.rawScore === 0)).toBe(true);
  });

  it("full pipeline with all-max answers → overall=100", () => {
    const result = scoreSubmission(allAnswers(4));
    expect(result.overallScore).toBe(100);
  });

  it("bottlenecks are 3 stages", () => {
    const result = scoreSubmission(allAnswers(2));
    expect(result.bottlenecks).toHaveLength(3);
  });

  it("experiments are exactly 3", () => {
    const result = scoreSubmission(allAnswers(2));
    expect(result.experiments).toHaveLength(3);
  });

  it("isBottleneck flag matches bottlenecks array", () => {
    const result = scoreSubmission(buildAnswers("acquisition", 0));
    const bottleneckStages = result.bottlenecks;
    for (const sr of result.stageResults) {
      if (bottleneckStages.includes(sr.stage)) {
        expect(sr.isBottleneck).toBe(true);
      }
    }
  });

  it("stageResults cover all 5 stages", () => {
    const result = scoreSubmission(allAnswers(2));
    const stages = result.stageResults.map((s) => s.stage);
    expect(stages).toContain("acquisition");
    expect(stages).toContain("activation");
    expect(stages).toContain("retention");
    expect(stages).toContain("revenue");
    expect(stages).toContain("referral");
  });

  it("weightedScore = rawScore × weight", () => {
    const result = scoreSubmission(allAnswers(4));
    for (const sr of result.stageResults) {
      expect(sr.weightedScore).toBe(Math.round(sr.rawScore * sr.weight));
    }
  });

  it("worst stage for acquisition=0 is acquisition", () => {
    const answers = buildAnswers("acquisition", 0);
    // Others all get value=2 (50%)
    const result = scoreSubmission(answers);
    expect(result.bottlenecks[0]).toBe("acquisition");
  });

  it("completedAt is a valid ISO timestamp", () => {
    const result = scoreSubmission(allAnswers(2));
    expect(() => new Date(result.completedAt)).not.toThrow();
    expect(new Date(result.completedAt).toISOString()).toBe(result.completedAt);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// encode / decode URL
// ─────────────────────────────────────────────────────────────────────────────

describe("URL encoding round-trip", () => {
  it("encodes and decodes answers faithfully", () => {
    const answers = allAnswers(3);
    const result = scoreSubmission(answers);
    const token = encodeResultForURL(result);
    const decoded = decodeResultFromURL(token);

    expect(decoded).not.toBeNull();
    expect(decoded!.overallScore).toBe(result.overallScore);
    for (const q of QUESTIONS) {
      expect(decoded!.answers[q.id]).toBe(answers[q.id]);
    }
  });

  it("returns null for invalid token", () => {
    expect(decodeResultFromURL("not-valid-base64!!!")).toBeNull();
  });

  it("uses the compact v1 format: '1.' + one digit per question", () => {
    const answers = allAnswers(3);
    const token = encodeResultForURL(scoreSubmission(answers));
    expect(token).toBe(`1.${"3".repeat(QUESTIONS.length)}`);
    expect(token.length).toBe(2 + QUESTIONS.length);
  });

  it("encodes distinct per-question answers in QUESTIONS order", () => {
    const answers: Record<string, 0 | 1 | 2 | 3 | 4> = {};
    QUESTIONS.forEach((q, i) => {
      answers[q.id] = (i % 5) as 0 | 1 | 2 | 3 | 4;
    });
    const token = encodeResultForURL(scoreSubmission(answers));
    const decoded = decodeResultFromURL(token);
    expect(decoded).not.toBeNull();
    QUESTIONS.forEach((q, i) => {
      expect(decoded!.answers[q.id]).toBe((i % 5) as 0 | 1 | 2 | 3 | 4);
    });
  });

  it("carries NO PII — token is only the version and answer digits", () => {
    const answers = allAnswers(2);
    const token = encodeResultForURL(scoreSubmission(answers));
    // The whole token must match the strict digit grammar (no emails, names, etc.)
    expect(token).toMatch(/^1\.[0-4]+$/);
  });

  it("is URL-safe (round-trips through encode/decodeURIComponent unchanged)", () => {
    const token = encodeResultForURL(scoreSubmission(allAnswers(4)));
    expect(encodeURIComponent(token)).toBe(token);
  });

  it("rejects wrong digit length", () => {
    expect(decodeResultFromURL("1.123")).toBeNull();
    expect(decodeResultFromURL(`1.${"3".repeat(QUESTIONS.length + 1)}`)).toBeNull();
  });

  it("rejects out-of-range digits", () => {
    expect(decodeResultFromURL(`1.${"5".repeat(QUESTIONS.length)}`)).toBeNull();
    expect(decodeResultFromURL(`1.${"x".repeat(QUESTIONS.length)}`)).toBeNull();
  });

  it("rejects an unknown format version", () => {
    expect(decodeResultFromURL(`9.${"3".repeat(QUESTIONS.length)}`)).toBeNull();
  });

  it("returns null for empty / non-string input", () => {
    expect(decodeResultFromURL("")).toBeNull();
    // @ts-expect-error — runtime guard for non-string input
    expect(decodeResultFromURL(null)).toBeNull();
  });

  it("still decodes legacy base64-JSON tokens (backward compatible)", () => {
    const answers = allAnswers(3);
    const result = scoreSubmission(answers);
    // Reconstruct a pre-1.1 token: base64(JSON{a,s,t}).
    const legacy = Buffer.from(
      JSON.stringify({ a: answers, s: result.overallScore, t: result.completedAt })
    ).toString("base64");
    const decoded = decodeResultFromURL(legacy);
    expect(decoded).not.toBeNull();
    expect(decoded!.overallScore).toBe(result.overallScore);
    for (const q of QUESTIONS) {
      expect(decoded!.answers[q.id]).toBe(answers[q.id]);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getScoreLabel
// ─────────────────────────────────────────────────────────────────────────────

describe("getScoreLabel", () => {
  it("score < 30 → critical", () => {
    expect(getScoreLabel(0).urgency).toBe("critical");
    expect(getScoreLabel(29).urgency).toBe("critical");
  });

  it("score 30–54 → needs-work", () => {
    expect(getScoreLabel(30).urgency).toBe("needs-work");
    expect(getScoreLabel(54).urgency).toBe("needs-work");
  });

  it("score 55–74 → good", () => {
    expect(getScoreLabel(55).urgency).toBe("good");
    expect(getScoreLabel(74).urgency).toBe("good");
  });

  it("score 75–100 → excellent", () => {
    expect(getScoreLabel(75).urgency).toBe("excellent");
    expect(getScoreLabel(100).urgency).toBe("excellent");
  });
});
