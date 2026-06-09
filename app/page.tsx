"use client";

import { useState, useEffect } from "react";
import {
  ScoringResult,
  decodeResultFromURL,
  scoreSubmission,
} from "@/lib/scoring";
import GrowthQuiz from "@/components/GrowthQuiz";
import ResultsDashboard from "@/components/ResultsDashboard";
import LanguageSelector from "@/components/LanguageSelector";
import {
  translations,
  getLangDir,
  isValidLang,
  type LangCode,
} from "@/lib/i18n";

type AppPhase = "quiz" | "results";

// Canonical GitHub repo URL (org: aymandakir-gh)
const GITHUB_URL = "https://github.com/aymandakir-gh/gh-growth-score";

export default function HomePage() {
  const [phase, setPhase] = useState<AppPhase>("quiz");
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [lang, setLang] = useState<LangCode>("en");

  // On mount: hydrate language from URL param, then check for share token
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Language
    const langParam = params.get("lang");
    if (langParam && isValidLang(langParam)) {
      setLang(langParam);
      document.documentElement.setAttribute("dir", getLangDir(langParam));
      document.documentElement.setAttribute("lang", langParam);
    }

    // Share token — decode and rehydrate quiz result
    const token = params.get("r");
    if (token) {
      const decoded = decodeResultFromURL(token);
      if (decoded) {
        const rehydrated = scoreSubmission(decoded.answers);
        setResult(rehydrated);
        setPhase("results");
      }
    }
  }, []);

  function handleLangChange(newLang: LangCode) {
    setLang(newLang);
    // SSR / prerender guard — history and window are browser-only
    if (typeof window === "undefined") return;
    // Persist selection in URL without page reload (no localStorage per policy)
    const params = new URLSearchParams(window.location.search);
    if (newLang === "en") {
      params.delete("lang");
    } else {
      params.set("lang", newLang);
    }
    const qs = params.toString();
    history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }

  function handleQuizComplete(scoringResult: ScoringResult) {
    setResult(scoringResult);
    setPhase("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const t = translations[lang];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-2 text-white font-bold text-base hover:text-brand-400 transition-colors"
          >
            <span className="text-xl" aria-hidden="true">📊</span>
            <span>{t.nav.title}</span>
          </a>

          <div className="flex items-center gap-3">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-slate-400 hover:text-brand-400 transition-colors hidden sm:block"
            >
              {t.nav.openSource}
            </a>
            <LanguageSelector
              current={lang}
              onChange={handleLangChange}
              label={t.selectLanguage}
            />
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
            <span className="text-slate-600">{t.footer.openSource}</span>
            <span className="text-slate-700" aria-hidden="true">·</span>
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
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              {t.footer.github}
            </a>
            <a
              href="https://growthackers.io/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              {t.footer.privacy}
            </a>
            <span className="text-slate-700">{t.footer.license}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
