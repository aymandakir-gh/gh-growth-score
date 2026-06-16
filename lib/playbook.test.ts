import { describe, it, expect } from "vitest";
import {
  getPlaybook,
  buildPlaybook,
  buildPlaybookMarkdown,
  type PlaybookResultLike,
} from "./playbook";
import { scoreBand } from "./recommendations";
import { listDiagnostics } from "./diagnostics";
import { scoreDiagnostic, type AnswerValue, type Diagnostic } from "./engine";

function allAnswers(d: Diagnostic, value: AnswerValue) {
  const a: Record<string, AnswerValue> = {};
  for (const q of d.questions) a[q.id] = value;
  return a;
}

describe.each(listDiagnostics())("playbook content integrity — $id", (diagnostic) => {
  it("every dimension resolves non-empty tactics at every band", () => {
    const bands = [10, 40, 60, 90]; // critical, needs-work, good, strong
    for (const dim of diagnostic.dimensions) {
      for (const score of bands) {
        const tactics = getPlaybook(diagnostic, dim.key, score);
        expect(tactics.length).toBeGreaterThan(0);
        for (const tac of tactics) {
          expect(tac.title.length).toBeGreaterThan(0);
          expect(tac.steps.length).toBeGreaterThan(0);
          for (const step of tac.steps) expect(step.length).toBeGreaterThan(0);
          expect(tac.metric.length).toBeGreaterThan(0);
          expect(["Low", "Medium", "High"]).toContain(tac.effort);
          expect(tac.horizon.length).toBeGreaterThan(0);
          // The returned tactic actually applies to the requested band.
          expect(tac.bands).toContain(scoreBand(score));
        }
      }
    }
  });
});

describe("buildPlaybook + markdown export", () => {
  it("covers exactly the bottleneck dimensions", () => {
    const d = listDiagnostics()[0];
    const result = scoreDiagnostic(d, allAnswers(d, 0)); // all weak
    const pb = buildPlaybook(d, result);
    expect(pb.map((p) => p.dimension).sort()).toEqual([...result.bottlenecks].sort());
    for (const dp of pb) expect(dp.tactics.length).toBeGreaterThan(0);
  });

  it("markdown is exportable, structured, and PII-free", () => {
    const d = listDiagnostics()[0];
    const result = scoreDiagnostic(d, allAnswers(d, 1));
    const md = buildPlaybookMarkdown(d, result);
    expect(md.startsWith(`# ${d.name}`)).toBe(true);
    expect(md).toContain("## ");
    expect(md).toContain("### 1.");
    expect(md).toContain("Measure:");
    // No timestamp / ISO date, no email.
    expect(md).not.toMatch(/\d{4}-\d{2}-\d{2}T/);
    expect(md).not.toMatch(/@/);
  });

  it("works for the PLG diagnostic too", () => {
    const plg = listDiagnostics().find((x) => x.id === "plg")!;
    const result = scoreDiagnostic(plg, allAnswers(plg, 0));
    const md = buildPlaybookMarkdown(plg, result);
    expect(md).toContain("PLG Readiness Score");
    const pb: PlaybookResultLike = result;
    expect(buildPlaybook(plg, pb).length).toBeGreaterThan(0);
  });
});
