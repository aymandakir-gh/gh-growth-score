"use client";

import { useState, useEffect } from "react";
import { usePostHog } from "posthog-js/react";
import { type Diagnostic, type DiagnosticResult } from "@/lib/engine";
import {
  compareDiagnosticToBenchmark,
  INDUSTRIES,
  DEFAULT_INDUSTRY,
  isValidIndustry,
} from "@/lib/benchmarks";
import { getDimensionRecommendation } from "@/lib/recommendations";
import ScoreGauge from "./ScoreGauge";
import StageScoreCard from "./StageScoreCard";
import ExperimentCard from "./ExperimentCard";
import PlaybookSection from "./PlaybookSection";
import ShareCard from "./ShareCard";
import EmailGate from "./EmailGate";
import { useI18n } from "@/lib/i18n-context";
import { dimLabel } from "@/lib/labels";

interface ResultsDashboardProps {
  diagnostic: Diagnostic;
  result: DiagnosticResult;
  /** True when opened from a shared ?r= link — skips the email gate. */
  shared?: boolean;
  /** True inside the embeddable widget — ungated, no shared banner. */
  embedded?: boolean;
}

function ScoreLegend() {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs text-slate-400 mt-2">
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-full bg-red-500 inline-block" aria-hidden="true" />
        <span>{t("results.legend.critical")}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" aria-hidden="true" />
        <span>{t("results.legend.needsWork")}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-full bg-green-500 inline-block" aria-hidden="true" />
        <span>{t("results.legend.good")}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" aria-hidden="true" />
        <span>{t("results.legend.excellent")}</span>
      </div>
    </div>
  );
}

function SharedBanner() {
  const { t } = useI18n();
  return (
    <section className="rounded-xl border border-brand-500/30 bg-brand-500/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <p className="text-sm text-slate-300">
        <span className="font-semibold text-white">{t("results.shared.title")}</span>{" "}
        {t("results.shared.desc")}
      </p>
      <a
        href="/"
        className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-colors"
      >
        {t("results.shared.cta")}
      </a>
    </section>
  );
}

function BenchmarkComparison({
  diagnostic,
  result,
  industry,
  onIndustryChange,
}: {
  diagnostic: Diagnostic;
  result: DiagnosticResult;
  industry: string;
  onIndustryChange: (id: string) => void;
}) {
  const { t } = useI18n();
  const dimScores = result.dimensionResults.reduce(
    (acc, s) => {
      acc[s.dimension] = s.rawScore;
      return acc;
    },
    {} as Record<string, number>
  );
  const cmp = compareDiagnosticToBenchmark(diagnostic, dimScores, industry);

  function deltaLabel(delta: number) {
    if (delta > 0) return `+${delta}`;
    return String(delta);
  }
  function deltaClass(status: string) {
    if (status === "above") return "text-green-400";
    if (status === "below") return "text-red-400";
    return "text-slate-400";
  }

  return (
    <section aria-labelledby="benchmark-heading">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
        <h2 id="benchmark-heading" className="text-lg sm:text-xl font-bold text-white">
          {t("results.compare.title")}
        </h2>
        <div className="flex items-center gap-2">
          <label htmlFor="industry-select" className="text-xs text-slate-400">
            {t("results.compare.industry")}
          </label>
          <select
            id="industry-select"
            value={industry}
            onChange={(e) => onIndustryChange(e.target.value)}
            className="text-xs rounded-md bg-slate-900 border border-slate-700 text-slate-200 px-2 py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            {INDUSTRIES.map((ind) => (
              <option key={ind.id} value={ind.id}>
                {ind.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-sm text-slate-400 mb-4">
        Your score vs. the typical median per stage.{" "}
        <span className="text-slate-400">
          Medians are directional estimates (see{" "}
          <a
            href="https://github.com/aymandakir-gh/gh-growth-score/blob/main/datasets/benchmarks.md"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-slate-400"
          >
            benchmarks
          </a>
          ).
        </span>
      </p>

      <div className="rounded-xl border border-slate-700 bg-slate-800/40 divide-y divide-slate-800">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold text-white">{t("results.compare.overall")}</span>
          <span className="flex items-baseline gap-2 text-sm">
            <span className="text-white font-bold">{cmp.overallScore}</span>
            <span className="text-slate-400">vs {cmp.overallMedian} median</span>
            <span className={`font-semibold ${deltaClass(cmp.overallStatus)}`}>
              {deltaLabel(cmp.overallDelta)}
            </span>
          </span>
        </div>
        {cmp.dimensions.map((s) => (
          <div key={s.key} className="flex items-center justify-between px-4 py-2.5">
            <span className="text-sm text-slate-300">{s.label}</span>
            <span className="flex items-baseline gap-2 text-sm">
              <span className="text-slate-200 font-medium">{s.score}</span>
              <span className="text-slate-400">vs {s.median}</span>
              <span className={`font-semibold w-12 text-right ${deltaClass(s.status)}`}>
                {deltaLabel(s.delta)}
              </span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ResultsDashboard({ diagnostic, result, shared = false, embedded = false }: ResultsDashboardProps) {
  const { t } = useI18n();
  const posthog = usePostHog();
  const [emailUnlocked, setEmailUnlocked] = useState(shared || embedded);
  const [industry, setIndustry] = useState<string>(DEFAULT_INDUSTRY);

  // Apply ?industry= deep-link on mount (non-PII view state, like ?lang=).
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("industry");
    if (fromUrl && isValidIndustry(fromUrl)) setIndustry(fromUrl);
  }, []);

  function handleIndustryChange(id: string) {
    setIndustry(id);
    try {
      const url = new URL(window.location.href);
      if (id === DEFAULT_INDUSTRY) url.searchParams.delete("industry");
      else url.searchParams.set("industry", id);
      window.history.replaceState({}, "", url);
    } catch {
      // non-fatal
    }
  }

  const colorByKey = new Map(diagnostic.dimensions.map((d) => [d.key, d.color]));

  function handleEmailSuccess(email: string) {
    setEmailUnlocked(true);
    posthog?.capture("score_completed", {
      diagnostic: diagnostic.id,
      score: result.overallScore,
      bottleneck_stages: result.bottlenecks,
      experiment_count: result.experiments.length,
    });
    posthog?.identify(email, { email });
  }

  return (
    <div className="space-y-8 sm:space-y-10 animate-fade-in">
      <section className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-semibold tracking-wide uppercase mb-2">
          {diagnostic.emoji} {diagnostic.name}
        </div>
        <ScoreGauge score={result.overallScore} />
        <ScoreLegend />
      </section>

      {shared && !embedded && <SharedBanner />}

      {!emailUnlocked ? (
        <EmailGate
          overallScore={result.overallScore}
          onSuccess={handleEmailSuccess}
        />
      ) : (
        <div className="space-y-8 sm:space-y-10 animate-slide-up">
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
              {t("results.stageBreakdown")}
            </h2>
            <p className="text-sm text-slate-400 mb-5">
              {t("results.stageBreakdown.desc")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {result.dimensionResults
                .slice()
                .sort((a, b) => a.rawScore - b.rawScore)
                .map((dimResult, idx) => (
                  <StageScoreCard
                    key={dimResult.dimension}
                    result={dimResult}
                    animationDelay={idx * 80}
                  />
                ))}
            </div>
          </section>

          <BenchmarkComparison
            diagnostic={diagnostic}
            result={result}
            industry={industry}
            onIndustryChange={handleIndustryChange}
          />

          <section
            className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 sm:p-5"
            aria-label="Top bottlenecks and recommendations"
          >
            <div className="flex items-start gap-3">
              <span className="text-xl sm:text-2xl flex-shrink-0" aria-hidden="true">⚠️</span>
              <div className="w-full">
                <h3 className="font-semibold text-white mb-1">
                  {t("results.bottlenecks.title", { count: result.bottlenecks.length })}
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  {t("results.bottlenecks.desc")}
                </p>
                <div className="space-y-3">
                  {result.bottlenecks.map((key) => {
                    const sr = result.dimensionResults.find((s) => s.dimension === key);
                    if (!sr) return null;
                    const rec = getDimensionRecommendation(diagnostic, key, sr.rawScore);
                    return (
                      <div
                        key={key}
                        className="rounded-lg border border-slate-700/70 bg-slate-900/50 p-3.5"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span aria-hidden="true">{sr.emoji}</span>
                          <span className="font-semibold text-white">{dimLabel(t, diagnostic, key)}</span>
                          <span className="text-red-400 font-bold text-sm">{sr.rawScore}/100</span>
                        </div>
                        <p className="text-sm text-slate-300 font-medium">{rec.headline}</p>
                        <p className="text-sm text-slate-400 mt-1">{rec.action}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
              {t("results.experiments.title")}
            </h2>
            <p className="text-sm text-slate-400 mb-5">
              {t("results.experiments.desc")}
            </p>
            <div className="space-y-3 sm:space-y-4">
              {result.experiments.map((exp, idx) => (
                <ExperimentCard
                  key={exp.title}
                  experiment={exp}
                  rank={idx + 1}
                  label={dimLabel(t, diagnostic, exp.dimension)}
                  colorStem={colorByKey.get(exp.dimension)}
                />
              ))}
            </div>
          </section>

          <PlaybookSection diagnostic={diagnostic} result={result} />

          <ShareCard diagnostic={diagnostic} result={result} industry={industry} />

          <section className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5 sm:p-6 text-center">
            <p className="text-slate-400 text-sm leading-relaxed">
              {t("results.footer.oss")}{" "}
              <a
                href="https://github.com/aymandakir-gh/gh-growth-score"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-400 underline hover:text-brand-300 transition-colors"
              >
                {t("results.footer.fork")}
              </a>
              .
            </p>
            <p className="text-xs text-slate-400 mt-2">
              {t("results.footer.questions")}{" "}
              <a
                href="https://growthackers.io"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-300 transition-colors"
              >
                growthackers.io
              </a>
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
