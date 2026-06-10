"use client";

import { useState } from "react";
import { usePostHog } from "posthog-js/react";
import { ScoringResult } from "@/lib/scoring";
import ScoreGauge from "./ScoreGauge";
import StageScoreCard from "./StageScoreCard";
import ExperimentCard from "./ExperimentCard";
import ShareCard from "./ShareCard";
import EmailGate from "./EmailGate";
import { useI18n } from "@/lib/i18n-context";

interface ResultsDashboardProps {
  result: ScoringResult;
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

export default function ResultsDashboard({ result }: ResultsDashboardProps) {
  const { t } = useI18n();
  const posthog = usePostHog();
  const [emailUnlocked, setEmailUnlocked] = useState(false);

  function handleEmailSuccess(email: string) {
    setEmailUnlocked(true);

    // score_completed — full report unlocked after email gate
    posthog?.capture("score_completed", {
      score: result.overallScore,
      bottleneck_stages: result.bottlenecks,
      experiment_count: result.experiments.length,
    });

    // Associate future events with this user
    posthog?.identify(email, { email });
  }

  return (
    <div className="space-y-8 sm:space-y-10 animate-fade-in">
      <section className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-semibold tracking-wide uppercase mb-2">
          {t("results.badge")}
        </div>
        <ScoreGauge score={result.overallScore} />
        <ScoreLegend />
      </section>

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
              {result.stageResults
                .sort((a, b) => a.rawScore - b.rawScore)
                .map((stageResult, idx) => (
                  <StageScoreCard
                    key={stageResult.stage}
                    result={stageResult}
                    animationDelay={idx * 80}
                  />
                ))}
            </div>
          </section>

          <section
            className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 sm:p-5"
            aria-label="Top bottlenecks"
          >
            <div className="flex items-start gap-3">
              <span className="text-xl sm:text-2xl flex-shrink-0" aria-hidden="true">⚠️</span>
              <div>
                <h3 className="font-semibold text-white mb-1">
                  {t("results.bottlenecks.title", {
                    count: result.bottlenecks.length,
                  })}
                </h3>
                <p className="text-sm text-slate-400 mb-3">
                  {t("results.bottlenecks.desc")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.bottlenecks.map((stage) => {
                    const sr = result.stageResults.find((s) => s.stage === stage);
                    return sr ? (
                      <span
                        key={stage}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-sm font-medium"
                      >
                        <span aria-hidden="true">{sr.emoji}</span>
                        {/* Stage label comes from scoring.ts — always EN; i18n future task */}
                        {sr.label}
                        <span className="text-red-400 font-bold">
                          {sr.rawScore}/100
                        </span>
                      </span>
                    ) : null;
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
                <ExperimentCard key={exp.title} experiment={exp} rank={idx + 1} />
              ))}
            </div>
          </section>

          <ShareCard result={result} />

          <section className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5 sm:p-6 text-center">
            <p className="text-slate-400 text-sm leading-relaxed">
              {t("results.footer.oss")}{" "}
              <a
                href="https://github.com/aymandakir-gh/gh-growth-score"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-400 hover:text-brand-300 transition-colors"
              >
                {t("results.footer.fork")}
              </a>
              .
            </p>
            <p className="text-xs text-slate-600 mt-2">
              {t("results.footer.questions")}{" "}
              <a
                href="https://growthackers.io"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-500 transition-colors"
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
