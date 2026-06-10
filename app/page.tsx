"use client";

import { useState, useEffect } from "react";
import posthog from "posthog-js";
import { ScoringResult, decodeResultFromURL, scoreSubmission } from "@/lib/scoring";
import GrowthQuiz from "@/components/GrowthQuiz";
import ResultsDashboard from "@/components/ResultsDashboard";
import LanguageSelector from "@/components/LanguageSelector";
import { useI18n } from "@/lib/i18n-context";

type AppPhase = "quiz" | "results";

export default function HomePage() {
  const { t } = useI18n();
  const [phase, setPhase] = useState<AppPhase>("quiz");
  const [result, setResult] = useState<ScoringResult | null>(null);

  // Hydrate from URL share token on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("r");
    if (token) {
      const decoded = decodeResultFromURL(token);
      if (decoded) {
        const rehydrated = scoreSubmission(decoded.answers);
        setResult(rehydrated);
        setPhase("results");

        // demo_used — user opened a shared result link
        try {
          posthog.capture("demo_used", { score: rehydrated.overallScore });
        } catch {
          // graceful degrade — PostHog may not be initialised yet on first paint
        }
      }
    }
  }, []);

  function handleQuizComplete(scoringResult: ScoringResult) {
    setResult(scoringResult);
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
          <GrowthQuiz onComplete={handleQuizComplete} />
        ) : result ? (
          <ResultsDashboard result={result} />
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 mt-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span className="text-slate-600">{t("nav.openSource")}</span>
            <span className="text-slate-700">·</span>
            <a
              href="https://growthackers.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-400 transition-colors"
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
            <span className="text-slate-700">MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
