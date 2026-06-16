// ─────────────────────────────────────────────────────────────────────────────
// Client-side PDF report — the full report as a real PDF (not just the PNG).
//
// Pure: builds the document from a (diagnostic, result) pair with jsPDF and
// returns raw bytes. No DOM, so it unit-tests in node and runs in the browser
// (zero-backend — the download is generated entirely client-side). NOT imported
// by the Edge OG route.
//
// Content is English (the diagnostic content is English); helvetica is fine.
// ─────────────────────────────────────────────────────────────────────────────

import { jsPDF } from "jspdf";
import { type Diagnostic, type DiagnosticResult, getScoreLabel } from "./engine";
import { compareDiagnosticToBenchmark } from "./benchmarks";
import { buildPlaybook } from "./playbook";
import { dimensionHex } from "./share-model";

const BRAND = "#5c68f5";
const INK = "#0f172a";
const MUTED = "#475569";
const FAINT = "#94a3b8";
const TRACK = "#e2e8f0";

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function scoreHex(score: number): string {
  if (score >= 70) return "#16a34a";
  if (score >= 40) return "#ca8a04";
  return "#dc2626";
}

function deltaText(delta: number): string {
  if (delta > 0) return `+${delta} vs median`;
  if (delta < 0) return `${delta} vs median`;
  return "at median";
}

/** Build the full report PDF for a result. Returns raw PDF bytes (ArrayBuffer). */
export function buildReportPdf(
  diagnostic: Diagnostic,
  result: DiagnosticResult
): ArrayBuffer {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 48; // margin
  const contentW = pageW - M * 2;
  let y = M;

  const setColor = (hex: string) => {
    const [r, g, b] = hexToRgb(hex);
    doc.setTextColor(r, g, b);
  };
  const setFill = (hex: string) => {
    const [r, g, b] = hexToRgb(hex);
    doc.setFillColor(r, g, b);
  };
  const ensure = (h: number) => {
    if (y + h > pageH - M) {
      doc.addPage();
      y = M;
    }
  };

  const cmp = compareDiagnosticToBenchmark(diagnostic, dimScores(result));
  const label = getScoreLabel(result.overallScore).label;
  const colorByKey = new Map(diagnostic.dimensions.map((d) => [d.key, d.color]));

  // ── Header ────────────────────────────────────────────────────────────────
  setFill(BRAND);
  doc.roundedRect(M, y, 14, 14, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  setColor(INK);
  doc.text(diagnostic.name, M + 22, y + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  setColor(FAINT);
  doc.text("growthackers.io", pageW - M, y + 12, { align: "right" });
  y += 38;

  // ── Score block ─────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(54);
  setColor(scoreHex(result.overallScore));
  doc.text(String(result.overallScore), M, y + 40);
  const scoreW = doc.getTextWidth(String(result.overallScore));
  doc.setFontSize(18);
  setColor(FAINT);
  doc.text("/100", M + scoreW + 8, y + 40);
  doc.setFontSize(16);
  setColor(INK);
  doc.text(label, M, y + 64);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  setColor(MUTED);
  doc.text(deltaText(cmp.overallDelta), M + doc.getTextWidth(label) + 12, y + 64);
  y += 86;

  // ── Breakdown vs median ─────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  setColor(INK);
  doc.text(`${diagnostic.shortName} breakdown vs. industry median`, M, y);
  y += 18;

  const labelColW = 150;
  const barX = M + labelColW;
  const barW = contentW - labelColW - 110;
  for (const row of cmp.dimensions) {
    ensure(26);
    const dr = result.dimensionResults.find((d) => d.dimension === row.key);
    const bottleneck = dr?.isBottleneck ? "  ⚠" : "";
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    setColor(MUTED);
    doc.text(`${row.label}${bottleneck}`, M, y + 9);

    setFill(TRACK);
    doc.roundedRect(barX, y, barW, 10, 5, 5, "F");
    const filled = Math.max(6, Math.round((row.score / 100) * barW));
    setFill(dimensionHex(colorByKey.get(row.key) ?? ""));
    doc.roundedRect(barX, y, filled, 10, 5, 5, "F");

    setColor(INK);
    doc.setFont("helvetica", "bold");
    doc.text(String(row.score), barX + barW + 10, y + 9);
    doc.setFont("helvetica", "normal");
    setColor(FAINT);
    doc.setFontSize(8);
    doc.text(deltaText(row.delta), barX + barW + 38, y + 9);
    y += 22;
  }
  y += 8;

  // ── Top experiments ───────────────────────────────────────────────────────
  ensure(40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  setColor(INK);
  doc.text("Top experiments to run next", M, y);
  y += 18;
  result.experiments.forEach((exp, i) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    setColor(MUTED);
    const lines = doc.splitTextToSize(`${i + 1}.  ${exp.title}  (ICE ${exp.ice})`, contentW);
    ensure(lines.length * 13 + 4);
    doc.text(lines, M, y);
    y += lines.length * 13 + 4;
  });
  y += 10;

  // ── Action playbook ───────────────────────────────────────────────────────
  const playbook = buildPlaybook(diagnostic, result);
  if (playbook.length > 0) {
    ensure(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    setColor(INK);
    doc.text("Action playbook", M, y);
    y += 18;

    for (const dp of playbook) {
      const dr = result.dimensionResults.find((d) => d.dimension === dp.dimension);
      ensure(24);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      setColor(INK);
      doc.text(`${dp.label} — ${dr?.rawScore ?? 0}/100`, M, y);
      y += 16;

      dp.tactics.forEach((tac, i) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        setColor(INK);
        const head = doc.splitTextToSize(
          `${i + 1}. ${tac.title}  ·  ${tac.effort} · ${tac.horizon}`,
          contentW
        );
        ensure(head.length * 12 + 4);
        doc.text(head, M, y);
        y += head.length * 12 + 2;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        setColor(MUTED);
        const why = doc.splitTextToSize(tac.why, contentW);
        ensure(why.length * 11 + 2);
        doc.text(why, M, y);
        y += why.length * 11 + 2;

        for (const step of tac.steps) {
          setColor(MUTED);
          const sl = doc.splitTextToSize(`-  ${step}`, contentW - 12);
          ensure(sl.length * 11);
          doc.text(sl, M + 10, y);
          y += sl.length * 11;
        }
        setColor(FAINT);
        doc.setFontSize(8);
        const measure = doc.splitTextToSize(`Measure: ${tac.metric}`, contentW - 10);
        ensure(measure.length * 10 + 6);
        doc.text(measure, M + 10, y);
        y += measure.length * 10 + 8;
      });
      y += 4;
    }
  }

  // ── Footer on every page ──────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setColor(FAINT);
    doc.text(
      `growthackers.io · free & open-source ${diagnostic.shortName} diagnostic`,
      M,
      pageH - 24
    );
    doc.text(
      "Benchmark medians are directional estimates — see datasets/benchmarks.md",
      M,
      pageH - 14
    );
    doc.text(`${p} / ${pageCount}`, pageW - M, pageH - 14, { align: "right" });
  }

  return doc.output("arraybuffer") as ArrayBuffer;
}

function dimScores(result: DiagnosticResult): Record<string, number> {
  return result.dimensionResults.reduce(
    (acc, d) => {
      acc[d.dimension] = d.rawScore;
      return acc;
    },
    {} as Record<string, number>
  );
}
