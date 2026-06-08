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

          {/* OSS footer note */}
          <section className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-6 text-center">
            <p className="text-slate-400 text-sm leading-relaxed">
              This tool is free and open-source —{" "}
              <a
                href="https://github.com/growthackers/gh-growth-score"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-400 hover:text-brand-300 transition-colors"
              >
                fork it on GitHub
              </a>
              .
            </p>
            <p className="text-xs text-slate-600 mt-2">
              Questions?{" "}
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
