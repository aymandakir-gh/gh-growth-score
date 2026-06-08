"use client";

import { useState } from "react";
import { ScoringResult } from "@/lib/scoring";
import ScoreGauge from "./ScoreGauge";
import StageScoreCard from "./StageScoreCard";
import ExperimentCard from "./ExperimentCard";
import ShareCard from "./ShareCard";
import EmailGate from "./EmailGate";

interface ResultsDashboardProps {
  result: ScoringResult;
}

export default function ResultsDashboard({ result }: ResultsDashboardProps) {
  const [emailUnlocked, setEmailUnlocked] = useState(false);

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Overall score hero */}
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-semibold tracking-wide uppercase mb-2">
          Growth Health Score
        </div>
        <ScoreGauge score={result.overallScore} />
      </section>

      {/* Email gate — shows preview until unlocked */}
      {!emailUnlocked ? (
        <EmailGate
          overallScore={result.overallScore}
          onSuccess={() => setEmailUnlocked(true)}
        />
      ) : (
        <div className="space-y-10 animate-slide-up">
          {/* Stage breakdown */}
          <section>
            <h2 className="text-xl font-bold text-white mb-1">Stage Breakdown</h2>
            <p className="text-sm text-slate-400 mb-5">
              Weighted contributions to your overall score. Red stages are your primary bottlenecks.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

          {/* Top bottlenecks callout */}
          <section className="rounded-xl border border-red-500/30 bg-red-500/5 p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-white mb-1">
                  Your Top {result.bottlenecks.length} Bottlenecks
                </h3>
                <p className="text-sm text-slate-400 mb-3">
                  These stages are dragging down your overall score. Focus here first.
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.bottlenecks.map((stage) => {
                    const sr = result.stageResults.find((s) => s.stage === stage);
                    return sr ? (
                      <span
                        key={stage}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-300 text-sm font-medium"
                      >
                        {sr.emoji} {sr.label}
                        <span className="text-red-400 font-bold">{sr.rawScore}/100</span>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* ICE experiments */}
          <section>
            <h2 className="text-xl font-bold text-white mb-1">
              Your Top 3 Experiments
            </h2>
            <p className="text-sm text-slate-400 mb-5">
              ICE-prioritized (Impact × Confidence ÷ Effort). Higher score = run this first.
            </p>
            <div className="space-y-4">
              {result.experiments.map((exp, idx) => (
                <ExperimentCard key={exp.title} experiment={exp} rank={idx + 1} />
              ))}
            </div>
          </section>

          {/* Share */}
          <ShareCard result={result} />

          {/* GrowthHackers CTA */}
          <section className="rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-950 to-slate-900 p-8 text-center">
            <div className="text-3xl mb-3">🚀</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Want help implementing these experiments?
            </h2>
            <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto leading-relaxed">
              GrowthHackers is a growth agency that turns AARRR diagnostics into
              real, prioritized experiments — then runs them. We&apos;ve helped
              B2B SaaS companies go from stalled to scaling.
            </p>
            <a
              href="https://growthackers.io?utm_source=growth-score&utm_medium=tool&utm_campaign=results-cta"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all duration-200 hover:scale-105"
            >
              Talk to a Growth Expert →
            </a>
            <p className="text-xs text-slate-600 mt-4">
              Free 30-minute growth audit call. No commitment.
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
