"use client";

import { useState } from "react";
import { type Diagnostic, type DiagnosticResult } from "@/lib/engine";
import { buildPlaybook, buildPlaybookMarkdown } from "@/lib/playbook";
import { dimLabel } from "@/lib/labels";
import { useI18n } from "@/lib/i18n-context";

interface PlaybookSectionProps {
  diagnostic: Diagnostic;
  result: DiagnosticResult;
}

const effortClass: Record<string, string> = {
  Low: "text-green-400 bg-green-500/15",
  Medium: "text-yellow-400 bg-yellow-500/15",
  High: "text-orange-400 bg-orange-500/15",
};

export default function PlaybookSection({ diagnostic, result }: PlaybookSectionProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const playbook = buildPlaybook(diagnostic, result);
  if (playbook.length === 0) return null;

  const markdown = () => buildPlaybookMarkdown(diagnostic, result);

  async function copyPlaybook() {
    try {
      await navigator.clipboard.writeText(markdown());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // non-fatal
    }
  }

  function downloadPlaybook() {
    const blob = new Blob([markdown()], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${diagnostic.slug}-playbook.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <section aria-labelledby="playbook-heading">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
        <h2 id="playbook-heading" className="text-lg sm:text-xl font-bold text-white">
          {t("playbook.title")}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={copyPlaybook}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
          >
            <span aria-hidden="true">📋</span>
            {copied ? t("playbook.copied") : t("playbook.copy")}
          </button>
          <button
            onClick={downloadPlaybook}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
          >
            <span aria-hidden="true">⬇️</span>
            {t("playbook.download")}
          </button>
        </div>
      </div>
      <p className="text-sm text-slate-400 mb-5">{t("playbook.desc")}</p>

      <div className="space-y-5">
        {playbook.map((dp) => {
          const dr = result.dimensionResults.find((d) => d.dimension === dp.dimension);
          return (
            <div
              key={dp.dimension}
              className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 sm:p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <span aria-hidden="true">{dr?.emoji}</span>
                <h3 className="font-semibold text-white">{dimLabel(t, diagnostic, dp.dimension)}</h3>
                <span className="text-red-400 font-bold text-sm">{dr?.rawScore ?? 0}/100</span>
              </div>

              <ol className="space-y-4">
                {dp.tactics.map((tac, i) => (
                  <li key={tac.title} className="rounded-lg border border-slate-700/70 bg-slate-900/50 p-3.5">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-300">
                          {i + 1}
                        </span>
                        <h4 className="font-semibold text-white text-sm leading-snug">{tac.title}</h4>
                      </div>
                      <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${effortClass[tac.effort] ?? "text-slate-400 bg-slate-700/40"}`}>
                        {tac.effort}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-2 leading-relaxed">{tac.why}</p>
                    <ul className="space-y-1 mb-2">
                      {tac.steps.map((step) => (
                        <li key={step} className="flex items-start gap-2 text-sm text-slate-300">
                          {/* Neutral bullet (no directional arrow) so it reads correctly in RTL. */}
                          <span className="text-brand-400 mt-0.5" aria-hidden="true">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span>📈 {t("playbook.measure")}: <strong className="text-slate-300">{tac.metric}</strong></span>
                      <span>⏳ {tac.horizon}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </div>
    </section>
  );
}
