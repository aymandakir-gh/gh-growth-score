"use client";

import { useState, useEffect } from "react";
import posthog from "posthog-js";
import { type Diagnostic, type DiagnosticResult, scoreDiagnostic } from "@/lib/engine";
import {
  DEFAULT_DIAGNOSTIC_ID,
  getDiagnosticOrDefault,
  decodeShareToken,
  listDiagnostics,
} from "@/lib/diagnostics";
import GrowthQuiz from "@/components/GrowthQuiz";
import ResultsDashboard from "@/components/ResultsDashboard";
import LanguageSelector from "@/components/LanguageSelector";
import { useI18n } from "@/lib/i18n-context";

type AppPhase = "quiz" | "results";

const DIAGNOSTICS = listDiagnostics();

export default function HomeClient() {
  const { t } = useI18n();
  const [phase, setPhase] = useState<AppPhase>("quiz");
  const [diagnostic, setDiagnostic] = useState<Diagnostic>(
    getDiagnosticOrDefault(DEFAULT_DIAGNOSTIC_ID)
  );
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  // True when the current result was opened from a shared ?r= link, not taken
  // by this visitor. Shared views are ungated (no PII in the payload).
  const [fromShare, setFromShare] = useState(false);

  // Hydrate from URL share token (?r=) or pre-select a diagnostic (?d=) on load.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("r");
    if (token) {
      const decoded = decodeShareToken(token);
      if (decoded) {
        const rehydrated = scoreDiagnostic(decoded.diagnostic, decoded.answers);
        setDiagnostic(decoded.diagnostic);
        setResult(rehydrated);
        setFromShare(true);
        setPhase("results");
        try {
          posthog.capture("demo_used", {
            diagnostic: decoded.diagnosticId,
            score: rehydrated.overallScore,
          });
        } catch {
          // graceful degrade — PostHog may not be initialised on first paint
        }
        return;
      }
    }
    const d = params.get("d");
    if (d) setDiagnostic(getDiagnosticOrDefault(d));
  }, []);

  function handleSelectDiagnostic(id: string) {
    const next = getDiagnosticOrDefault(id);
    setDiagnostic(next);
    setResult(null);
    setFromShare(false);
    setPhase("quiz");
    // Reflect the choice in the URL (shareable, reload-stable) without reload.
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("d", next.id);
      url.searchParams.delete("r");
      window.history.replaceState({}, "", url);
    } catch {
      // non-fatal
    }
  }

  function handleQuizComplete(scoringResult: DiagnosticResult) {
    setResult(scoringResult);
    setFromShare(false);
    setPhase("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <a
            href="/"
            className="flex items-center gap-2 text-white font-bold text-base hover:text-brand-400 transition-colors shrink-0"
          >
            <span className="text-xl" aria-hidden="true">📊</span>
            <span>{t("nav.title")}</span>
          </a>

          <div className="flex items-center gap-3">
            <LanguageSelector />
            <a
              href="https://github.com/aymandakir-gh/gh-growth-score"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block text-xs font-semibold text-slate-400 hover:text-brand-400 transition-colors"
            >
              {t("nav.openSource")}
            </a>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 md:py-16">
        {phase === "quiz" ? (
          <GrowthQuiz
            diagnostic={diagnostic}
            diagnostics={DIAGNOSTICS}
            onSelectDiagnostic={handleSelectDiagnostic}
            onComplete={handleQuizComplete}
          />
        ) : result ? (
          <ResultsDashboard diagnostic={diagnostic} result={result} shared={fromShare} />
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 mt-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">{t("nav.openSource")}</span>
            <span className="text-slate-400">·</span>
            <a
              href="https://growthackers.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-400 transition-colors"
            >
              growthackers.io
            </a>
          </div>

          <div className="flex items-center gap-5">
            <a
              href="https://github.com/aymandakir-gh/gh-growth-score"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://growthackers.io/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              Privacy
            </a>
            <span className="text-slate-400">MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
