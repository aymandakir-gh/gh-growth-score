"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  type Diagnostic,
  type AnswerValue,
  type DiagnosticResult,
  scoreDiagnostic,
} from "@/lib/engine";
import QuestionCard from "./QuestionCard";
import StageProgress from "./StageProgress";
import { useI18n } from "@/lib/i18n-context";
import { dimLabel, dimDesc } from "@/lib/labels";

interface GrowthQuizProps {
  diagnostic: Diagnostic;
  diagnostics: Diagnostic[];
  onSelectDiagnostic: (id: string) => void;
  onComplete: (result: DiagnosticResult) => void;
}

type QuizPhase = "intro" | "quiz";

export default function GrowthQuiz({
  diagnostic,
  diagnostics,
  onSelectDiagnostic,
  onComplete,
}: GrowthQuizProps) {
  const { t } = useI18n();
  const [phase, setPhase] = useState<QuizPhase>("intro");
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [currentQuestionInStage, setCurrentQuestionInStage] = useState(0);
  // Pending "advance to next question" timer — cancelled if the user navigates
  // (Back) before it fires, so a late advance can't override the navigation.
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);

  const DIMS = diagnostic.dimensions;
  const QS = diagnostic.questions;

  const currentStageConfig = DIMS[currentStageIdx];
  const stageQuestions = QS.filter(
    (q) => q.dimension === currentStageConfig?.key
  );
  const currentQuestion = stageQuestions[currentQuestionInStage];
  const totalAnswered = Object.keys(answers).length;
  const totalQuestions = QS.length;

  const completedStageIdxs = DIMS.reduce<number[]>((acc, cfg, idx) => {
    const stageQs = QS.filter((q) => q.dimension === cfg.key);
    const allAnswered = stageQs.every((q) => answers[q.id] !== undefined);
    if (allAnswered && stageQs.length > 0) acc.push(idx);
    return acc;
  }, []);

  const handleAnswer = useCallback(
    (questionId: string, value: AnswerValue) => {
      const newAnswers = { ...answers, [questionId]: value };
      setAnswers(newAnswers);

      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      advanceTimer.current = setTimeout(() => {
        const nextInStage = currentQuestionInStage + 1;
        if (nextInStage < stageQuestions.length) {
          setCurrentQuestionInStage(nextInStage);
        } else {
          const nextStageIdx = currentStageIdx + 1;
          if (nextStageIdx < DIMS.length) {
            setCurrentStageIdx(nextStageIdx);
            setCurrentQuestionInStage(0);
          } else {
            onComplete(scoreDiagnostic(diagnostic, newAnswers));
          }
        }
      }, 180);
    },
    [answers, currentQuestionInStage, currentStageIdx, stageQuestions.length, DIMS.length, diagnostic, onComplete]
  );

  function handleBack() {
    // Cancel any in-flight auto-advance so it can't override this navigation.
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    if (currentQuestionInStage > 0) {
      setCurrentQuestionInStage(currentQuestionInStage - 1);
    } else if (currentStageIdx > 0) {
      const prevStageIdx = currentStageIdx - 1;
      const prevStageConfig = DIMS[prevStageIdx];
      const prevStageQuestions = QS.filter((q) => q.dimension === prevStageConfig.key);
      setCurrentStageIdx(prevStageIdx);
      setCurrentQuestionInStage(prevStageQuestions.length - 1);
    }
  }

  // ── Intro ─────────────────────────────────────────────────────────────────
  if (phase === "intro") {
    const isAarrr = diagnostic.id === "aarrr";
    return (
      <div className="animate-fade-in">
        {/* Diagnostic picker */}
        <div
          className="flex flex-wrap justify-center gap-2 mb-8"
          role="group"
          aria-label={t("quiz.a11y.chooseDiagnostic")}
        >
          {diagnostics.map((d) => {
            const active = d.id === diagnostic.id;
            return (
              <button
                key={d.id}
                onClick={() => onSelectDiagnostic(d.id)}
                aria-pressed={active}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold transition-colors ${
                  active
                    ? "border-brand-500 bg-brand-500/15 text-white"
                    : "border-slate-700 bg-slate-800/60 text-slate-300 hover:border-brand-500/50 hover:text-white"
                }`}
              >
                <span aria-hidden="true">{d.emoji}</span>
                {d.shortName}
              </button>
            );
          })}
        </div>

        {/* Hero */}
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-semibold tracking-wide uppercase">
            {t("quiz.badge")}
          </div>
          {isAarrr ? (
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              {t("quiz.hero.title1")}
              <br />
              <span className="text-brand-400">{t("quiz.hero.title2")}</span>
            </h1>
          ) : (
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              {diagnostic.name}
            </h1>
          )}
          <p className="text-slate-400 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            {isAarrr ? t("quiz.hero.subtitle") : diagnostic.tagline}
          </p>
        </div>

        {/* Dimension pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {DIMS.map((cfg) => (
            <span
              key={cfg.key}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-sm"
            >
              <span aria-hidden="true">{cfg.emoji}</span>
              {dimLabel(t, diagnostic, cfg.key)}
            </span>
          ))}
        </div>

        {/* What you get */}
        <div className="grid sm:grid-cols-3 gap-3 text-start max-w-xl mx-auto mb-8">
          {(
            [
              { icon: "📊", titleKey: "quiz.feature.stageScores", descKey: "quiz.feature.stageScores.desc" },
              { icon: "🔍", titleKey: "quiz.feature.bottleneck", descKey: "quiz.feature.bottleneck.desc" },
              { icon: "🧪", titleKey: "quiz.feature.experiments", descKey: "quiz.feature.experiments.desc" },
            ] as const
          ).map((item) => (
            <div
              key={item.titleKey}
              className="rounded-xl border border-slate-700 bg-slate-800/60 p-4"
            >
              <div className="text-2xl mb-1" aria-hidden="true">
                {item.icon}
              </div>
              <div className="text-sm font-semibold text-white mb-0.5">
                {t(item.titleKey)}
              </div>
              <div className="text-xs text-slate-400 leading-snug">
                {t(item.descKey)}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center pt-2">
          <button
            onClick={() => setPhase("quiz")}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-lg transition-all duration-200 hover:scale-105 active:scale-100 shadow-lg shadow-brand-900/50"
          >
            {t("quiz.cta")}
          </button>
          <p className="text-xs text-slate-400 mt-3">{t("quiz.cta.note")}</p>
        </div>
      </div>
    );
  }

  // ── Quiz ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <StageProgress
        dimensions={DIMS}
        currentStageIdx={currentStageIdx}
        completedStageIdxs={completedStageIdxs}
        labelFor={(key) => dimLabel(t, diagnostic, key)}
      />

      {/* Stage header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">
              {currentStageConfig.emoji}
            </span>
            <div>
              <div className="text-sm font-bold text-white">
                {dimLabel(t, diagnostic, currentStageConfig.key)}
              </div>
              <div className="text-xs text-slate-400">
                {dimDesc(t, diagnostic, currentStageConfig.key)}
              </div>
            </div>
          </div>
          <span className="text-sm font-semibold text-slate-400">
            {t("results.progress", { answered: totalAnswered, total: totalQuestions })}
          </span>
        </div>

        <div
          className="w-full bg-slate-700 rounded-full h-1.5"
          role="progressbar"
          aria-valuenow={totalAnswered}
          aria-valuemax={totalQuestions}
          aria-label={t("quiz.a11y.progress")}
        >
          <div
            className="bg-brand-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${(totalAnswered / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {currentQuestion && (
        <QuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          currentAnswer={answers[currentQuestion.id]}
          questionIndex={currentQuestionInStage}
          totalInStage={stageQuestions.length}
          onAnswer={handleAnswer}
        />
      )}

      {(currentStageIdx > 0 || currentQuestionInStage > 0) && (
        <button
          onClick={handleBack}
          className="text-sm text-slate-400 hover:text-slate-300 transition-colors flex items-center gap-1"
          aria-label={t("quiz.a11y.back")}
        >
          {t("quiz.back")}
        </button>
      )}
    </div>
  );
}
