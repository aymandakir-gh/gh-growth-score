import { describe, it, expect } from "vitest";
import { buildReportPdf } from "./pdf-report";
import { listDiagnostics } from "./diagnostics";
import { scoreDiagnostic, type AnswerValue, type Diagnostic } from "./engine";

function allAnswers(d: Diagnostic, value: AnswerValue) {
  const a: Record<string, AnswerValue> = {};
  for (const q of d.questions) a[q.id] = value;
  return a;
}

const PDF_MAGIC = "%PDF-";

describe.each(listDiagnostics())("buildReportPdf — $id", (diagnostic) => {
  it("produces a valid, non-trivial PDF for a weak result", () => {
    const result = scoreDiagnostic(diagnostic, allAnswers(diagnostic, 0));
    const bytes = new Uint8Array(buildReportPdf(diagnostic, result));
    const head = String.fromCharCode(...bytes.slice(0, 5));
    expect(head).toBe(PDF_MAGIC);
    expect(bytes.byteLength).toBeGreaterThan(2000);
  });

  it("produces a valid PDF for a strong result (no bottleneck playbook edge)", () => {
    const result = scoreDiagnostic(diagnostic, allAnswers(diagnostic, 4));
    const bytes = new Uint8Array(buildReportPdf(diagnostic, result));
    expect(String.fromCharCode(...bytes.slice(0, 5))).toBe(PDF_MAGIC);
    expect(bytes.byteLength).toBeGreaterThan(2000);
  });

  it("produces a valid PDF for a mixed result", () => {
    const answers: Record<string, AnswerValue> = {};
    diagnostic.questions.forEach((q, i) => {
      answers[q.id] = (i % 5) as AnswerValue;
    });
    const result = scoreDiagnostic(diagnostic, answers);
    const bytes = new Uint8Array(buildReportPdf(diagnostic, result));
    expect(String.fromCharCode(...bytes.slice(0, 5))).toBe(PDF_MAGIC);
  });
});
