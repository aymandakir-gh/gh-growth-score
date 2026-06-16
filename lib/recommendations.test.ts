import { describe, it, expect } from "vitest";
import {
  scoreBand,
  getStageRecommendation,
  type ScoreBand,
} from "./recommendations";
import { STAGE_CONFIGS, type Stage } from "./scoring";

describe("scoreBand", () => {
  it("maps scores to the same bands as getScoreLabel thresholds", () => {
    expect(scoreBand(0)).toBe("critical");
    expect(scoreBand(29)).toBe("critical");
    expect(scoreBand(30)).toBe("needs-work");
    expect(scoreBand(54)).toBe("needs-work");
    expect(scoreBand(55)).toBe("good");
    expect(scoreBand(74)).toBe("good");
    expect(scoreBand(75)).toBe("strong");
    expect(scoreBand(100)).toBe("strong");
  });
});

describe("getStageRecommendation", () => {
  const bands: { score: number; band: ScoreBand }[] = [
    { score: 10, band: "critical" },
    { score: 40, band: "needs-work" },
    { score: 65, band: "good" },
    { score: 90, band: "strong" },
  ];

  it("returns a non-empty, banded recommendation for every stage × band", () => {
    for (const cfg of STAGE_CONFIGS) {
      for (const { score, band } of bands) {
        const rec = getStageRecommendation(cfg.stage as Stage, score);
        expect(rec.band).toBe(band);
        expect(rec.headline.length).toBeGreaterThan(0);
        expect(rec.action.length).toBeGreaterThan(0);
      }
    }
  });

  it("gives different advice as the score improves within a stage", () => {
    const critical = getStageRecommendation("retention", 10);
    const strong = getStageRecommendation("retention", 90);
    expect(critical.action).not.toBe(strong.action);
    expect(critical.headline).not.toBe(strong.headline);
  });

  it("tailors advice per stage (acquisition vs referral differ at the same band)", () => {
    const acq = getStageRecommendation("acquisition", 10);
    const ref = getStageRecommendation("referral", 10);
    expect(acq.action).not.toBe(ref.action);
  });
});
