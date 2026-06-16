"use client";

import { useState } from "react";
import { type Diagnostic, type DiagnosticResult } from "@/lib/engine";
import { encodeResultToken } from "@/lib/diagnostics";
import { useI18n } from "@/lib/i18n-context";

interface ShareCardProps {
  diagnostic: Diagnostic;
  result: DiagnosticResult;
}

export default function ShareCard({ diagnostic, result }: ShareCardProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);

  const token = encodeResultToken(diagnostic, result.answers);
  const encodedToken = encodeURIComponent(token);
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?r=${encodedToken}`
      : `https://growth-score.growthackers.io/?r=${encodedToken}`;

  // AARRR keeps its long-standing report filename; others derive from the slug.
  const fileBase =
    diagnostic.id === "aarrr" ? "growth-health-score" : `${diagnostic.slug}-readiness-score`;

  const labelByKey = new Map(diagnostic.dimensions.map((d) => [d.key, d.label]));

  // Download the branded report PNG. Stateless render of the URL token by the
  // /api/og route (no DB, no PII) — fetched client-side and saved as a file.
  async function downloadReport() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/og?r=${encodedToken}&v=report`);
      if (!res.ok) throw new Error(`status ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileBase}-${result.overallScore}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Non-fatal — the share link still works without the download.
    } finally {
      setDownloading(false);
    }
  }

  // Build the full PDF report client-side (no backend, no PII leaves the browser).
  // jsPDF is heavy, so it's lazy-loaded only when the user asks for the PDF.
  async function downloadPdf() {
    setPdfBusy(true);
    try {
      const { buildReportPdf } = await import("@/lib/pdf-report");
      const bytes = buildReportPdf(diagnostic, result);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileBase}-${result.overallScore}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // Non-fatal — the share link + PNG still work.
    } finally {
      setPdfBusy(false);
    }
  }

  const summaryText = [
    `📊 My ${diagnostic.name}: ${result.overallScore}/100`,
    ``,
    `${diagnostic.shortName} Breakdown:`,
    ...result.dimensionResults.map(
      (s) => `${s.emoji} ${s.label}: ${s.rawScore}/100${s.isBottleneck ? " ⚠️" : ""}`
    ),
    ``,
    `Top bottlenecks: ${result.bottlenecks
      .map((b) => labelByKey.get(b) ?? b)
      .join(", ")}`,
    ``,
    `Get your free ${diagnostic.name} → ${shareUrl}`,
  ].join("\n");

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select the input
    }
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  const tweetText = encodeURIComponent(
    `I scored ${result.overallScore}/100 on the ${diagnostic.name}\n\nTop bottlenecks: ${result.bottlenecks
      .map((b) => labelByKey.get(b) ?? b)
      .join(", ")}\n\nTake the free audit → `
  );
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}${encodeURIComponent(shareUrl)}`;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
      <h3 className="font-semibold text-white mb-1">{t("share.title")}</h3>
      <p className="text-sm text-slate-400 mb-4">{t("share.desc")}</p>

      {/* URL input */}
      <div className="flex gap-2 mb-3">
        <input
          readOnly
          value={shareUrl}
          aria-label="Shareable result link"
          className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-300 focus:outline-none font-mono truncate"
        />
        <button
          onClick={copyLink}
          className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors whitespace-nowrap"
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>

      {/* Action row */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={copySummary}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
        >
          <span>📋</span> Copy Summary
        </button>

        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
        >
          <span>𝕏</span> Share on X
        </a>

        <button
          onClick={downloadReport}
          disabled={downloading}
          aria-busy={downloading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span aria-hidden="true">⬇️</span>
          {downloading ? "Preparing…" : "Download PNG"}
        </button>

        <button
          onClick={downloadPdf}
          disabled={pdfBusy}
          aria-busy={pdfBusy}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span aria-hidden="true">📄</span>
          {pdfBusy ? "Building…" : "Download PDF"}
        </button>

        <button
          onClick={() => {
            window.location.href = `/?d=${diagnostic.id}`;
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
        >
          <span>🔄</span> Retake
        </button>
      </div>
    </div>
  );
}
