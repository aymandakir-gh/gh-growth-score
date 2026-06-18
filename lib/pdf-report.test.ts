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

// Read the leading bytes as a string without spreading the typed array.
// `String.fromCharCode(...bytes.slice(0, 5))` trips TS2802 under TypeScript
// 5.7+ (Uint8Array became generic); Array.from with a map callback avoids the
// iteration requirement.
function magic(bytes: Uint8Array, len = 5): string {
  return Array.from(bytes.slice(0, len), (b) => String.fromCharCode(b)).join("");
}

describe.each(listDiagnostics())("buildReportPdf — $id", (diagnostic) => {
  it("produces a valid, non-trivial PDF for a weak result", () => {
    const result = scoreDiagnostic(diagnostic, allAnswers(diagnostic, 0));
    const bytes = new Uint8Array(buildReportPdf(diagnostic, result));
    const head = magic(bytes);
    expect(head).toBe(PDF_MAGIC);
    expect(bytes.byteLength).toBeGreaterThan(2000);
  });

  it("produces a valid PDF for a strong result (no bottleneck playbook edge)", () => {
    const result = scoreDiagnostic(diagnostic, allAnswers(diagnostic, 4));
    const bytes = new Uint8Array(buildReportPdf(diagnostic, result));
    expect(magic(bytes)).toBe(PDF_MAGIC);
    expect(bytes.byteLength).toBeGreaterThan(2000);
  });

  it("produces a valid PDF for a mixed result", () => {
    const answers: Record<string, AnswerValue> = {};
    diagnostic.questions.forEach((q, i) => {
      answers[q.id] = (i % 5) as AnswerValue;
    });
    const result = scoreDiagnostic(diagnostic, answers);
    const bytes = new Uint8Array(buildReportPdf(diagnostic, result));
    expect(magic(bytes)).toBe(PDF_MAGIC);
  });
});
