"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { type Diagnostic, type DiagnosticResult, scoreDiagnostic } from "@/lib/engine";
import { getDiagnosticOrDefault, decodeShareToken, listDiagnostics } from "@/lib/diagnostics";
import { EMBED_HEIGHT_MESSAGE, clampEmbedHeight } from "@/lib/embed";
import GrowthQuiz from "@/components/GrowthQuiz";
import ResultsDashboard from "@/components/ResultsDashboard";
import { useI18n } from "@/lib/i18n-context";

type AppPhase = "quiz" | "results";

const DIAGNOSTICS = listDiagnostics();

/**
 * The embeddable widget surface — the full audit with minimal chrome, safe to
 * iframe on any site. Ungated. Posts its height to the parent frame so the host
 * iframe can auto-resize (height integer only — no PII).
 */
export default function EmbedClient() {
  const { t } = useI18n();
  const rootRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<AppPhase>("quiz");
  const [diagnostic, setDiagnostic] = useState<Diagnostic>(getDiagnosticOrDefault(undefined));
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  // Post our content height to the parent frame (for iframe auto-resize).
  const reportHeight = useCallback(() => {
    if (typeof window === "undefined" || window.parent === window) return;
    const h = rootRef.current?.scrollHeight ?? document.body.scrollHeight;
    try {
      window.parent.postMessage(
        { type: EMBED_HEIGHT_MESSAGE, height: clampEmbedHeight(h) },
        "*" // height integer only — no PII; host origin is arbitrary
      );
    } catch {
      // non-fatal
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("r");
    if (token) {
      const decoded = decodeShareToken(token);
      if (decoded) {
        setDiagnostic(decoded.diagnostic);
        setResult(scoreDiagnostic(decoded.diagnostic, decoded.answers));
        setPhase("results");
        return;
      }
    }
    const d = params.get("d");
    if (d) setDiagnostic(getDiagnosticOrDefault(d));
  }, []);

  // Keep the parent iframe sized to our content.
  useEffect(() => {
    reportHeight();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => reportHeight()) : null;
    if (ro && rootRef.current) ro.observe(rootRef.current);
    window.addEventListener("resize", reportHeight);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", reportHeight);
    };
  }, [reportHeight, phase, result]);

  function handleSelectDiagnostic(id: string) {
    setDiagnostic(getDiagnosticOrDefault(id));
    setResult(null);
    setPhase("quiz");
  }

  function handleComplete(r: DiagnosticResult) {
    setResult(r);
    setPhase("results");
  }

  return (
    <div ref={rootRef} className="min-h-[1px] px-4 sm:px-6 py-6">
      <div className="max-w-2xl mx-auto">
        {phase === "quiz" ? (
          <GrowthQuiz
            diagnostic={diagnostic}
            diagnostics={DIAGNOSTICS}
            onSelectDiagnostic={handleSelectDiagnostic}
            onComplete={handleComplete}
          />
        ) : result ? (
          <ResultsDashboard diagnostic={diagnostic} result={result} embedded />
        ) : null}

        <div className="mt-8 pt-4 border-t border-slate-800/60 text-center">
          <a
            href="https://github.com/aymandakir-gh/gh-growth-score"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-brand-400 transition-colors"
          >
            {t("embed.poweredBy")}
          </a>
        </div>
      </div>
    </div>
  );
}
