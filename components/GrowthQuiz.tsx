"use client";

import { useState, useCallback } from "react";
import {
  QUESTIONS,
  STAGE_CONFIGS,
  AnswerValue,
  ScoringResult,
  scoreSubmission,
} from "@/lib/scoring";
import QuestionCard from "./QuestionCard";
import ProgressBar from "./ProgressBar";
import StageProgress from "./StageProgress";

interface GrowthQuizProps {
  onComplete: (result: ScoringResult) => void;
}

type QuizPhase = "intro" | "quiz" | "complete";

export default function GrowthQuiz({ onComplete }: GrowthQuizProps) {
  const [phase, setPhase] = useState<QuizPhase>("intro");
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [currentQuestionInStage, setCurrentQuestionInStage] = useState(0);

  const currentStageConfig = STAGE_CONFIGS[currentStageIdx];
  const stageQuestions = QUESTIONS.filter(
    (q) => q.stage === currentStageConfig?.stage
  );
  const currentQuestion = stageQuestions[currentQuestionInStage];
  const totalAnswered = Object.keys(answers).length;
  const totalQuestions = QUESTIONS.length;

  // Compute which stages are fully completed
  const completedStageIdxs = STAGE_CONFIGS.reduce<number[]>((acc, cfg, idx) => {
    const stageQs = QUESTIONS.filter((q) => q.stage === cfg.stage);
    const allAnswered = stageQs.every((q) => answers[q.id] !== undefined);
    if (allAnswered && stageQs.length > 0) acc.push(idx);
    return acc;
  }, []);

  const handleAnswer = useCallback(
    (questionId: string, value: AnswerValue) => {
      const newAnswers = { ...answers, [questionId]: value };
      setAnswers(newAnswers);

      // Auto-advance after a tiny delay so the selection visually registers
      setTimeout(() => {
        const nextInStage = currentQuestionInStage + 1;

        if (nextInStage < stageQuestions.length) {
          setCurrentQuestionInStage(nextInStage);
        } else {
          const nextStageIdx = currentStageIdx + 1;
          if (nextStageIdx < STAGE_CONFIGS.length) {
            setCurrentStageIdx(nextStageIdx);
            setCurrentQuestionInStage(0);
          } else {
            const result = scoreSubmission(newAnswers);
            onComplete(result);
          }
        }
      }, 180);
    },
    [answers, currentQuestionInStage, currentStageIdx, stageQuestions.length, onComplete]
  );

  function handleBack() {
    if (currentQuestionInStage > 0) {
      setCurrentQuestionInStage(currentQuestionInStage - 1);
    } else if (currentStageIdx > 0) {
      const prevStageIdx = currentStageIdx - 1;
      const prevStageConfig = STAGE_CONFIGS[prevStageIdx];
      const prevStageQuestions = QUESTIONS.filter(
        (q) => q.stage === prevStageConfig.stage
      );
      setCurrentStageIdx(prevStageIdx);
      setCurrentQuestionInStage(prevStageQuestions.length - 1);
    }
  }

  if (phase === "intro") {
    return (
      <div className="animate-fade-in">
        {/* Hero */}
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-semibold tracking-wide uppercase">
            Free Growth Audit
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
            What&apos;s Your Growth
            <br />
            <span className="text-brand-400">Health Score?</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
            Answer 15 diagnostic questions across the 5 AARRR stages. Get a
            0&ndash;100 score per stage, identify your top bottlenecks, and receive 3
            ICE-prioritized experiments to fix them.
          </p>
        </div>

        {/* Stage pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {STAGE_CONFIGS.map((cfg) => (
            <span
              key={cfg.stage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-sm"
            >
              {cfg.emoji} {cfg.label}
            </span>
          ))}
        </div>

        {/* What you get */}
        <div className="grid sm:grid-cols-3 gap-3 text-left max-w-xl mx-auto mb-8">
          {[
            { icon: "📊", title: "Stage Scores", desc: "0–100 score for each of the 5 AARRR stages" },
            { icon: "🔍", title: "Bottleneck Analysis", desc: "Top 3 weakest stages ranked by impact" },
            { icon: "🧪", title: "ICE Experiments", desc: "3 prioritized experiments targeted at your gaps" },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-700 bg-slate-800/60 p-4"
            >
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-sm font-semibold text-white mb-0.5">{item.title}</div>
              <div className="text-xs text-slate-400 leading-snug">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* How it works — 3 steps */}
        <div className="max-w-xl mx-auto mb-8">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest text-center mb-4">
            How it works
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-start gap-4 sm:gap-0">
            {[
              { step: "1", label: "Answer 15 questions", desc: "One per AARRR stage — takes ~3 min" },
              { step: "2", label: "Get your AARRR score", desc: "0–100 per stage, weighted overall" },
              { step: "3", label: "See your roadmap", desc: "Bottlenecks + 3 ICE experiments to fix them" },
            ].map((item, idx) => (
              <div key={item.step} className="flex sm:flex-col items-start sm:items-center gap-3 sm:gap-2 sm:flex-1 sm:text-center relative">
                {idx < 2 && (
                  <div className="hidden sm:block absolute left-3/4 top-4 w-1/2 h-px bg-slate-700 z-0" />
                )}
                <div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center">
                  {item.step}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{item.label}</div>
                  <div className="text-xs text-slate-500 leading-snug mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-2">
          <button
            onClick={() => setPhase("quiz")}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-lg transition-all duration-200 hover:scale-105 active:scale-100 shadow-lg shadow-brand-900/50"
          >
            Start Free Audit &rarr;
          </button>
          <p className="text-xs text-slate-600 mt-3">
            Takes ~3 minutes &middot; No signup required &middot; 100% free
          </p>
        </div>
      </div>
    );
  }

  // Quiz phase
  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      {/* AARRR Stage progress bar */}
      <StageProgress
        currentStageIdx={currentStageIdx}
        completedStageIdxs={completedStageIdxs}
      />

      {/* Stage header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{currentStageConfig.emoji}</span>
            <div>
              <div className="text-sm font-bold text-white">{currentStageConfig.label}</div>
              <div className="text-xs text-slate-500">{currentStageConfig.description}</div>
            </div>
          </div>
          <span className="text-sm font-semibold text-slate-400">
            {totalAnswered}/{totalQuestions}
          </span>
        </div>

        {/* Overall progress bar */}
        <div className="w-full bg-slate-700 rounded-full h-1.5">
          <div
            className="bg-brand-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${(totalAnswered / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
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

      {/* Back button */}
      {(currentStageIdx > 0 || currentQuestionInStage > 0) && (
        <button
          onClick={handleBack}
          className="text-sm text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
        >
          &larr; Back
        </button>
      )}
    </div>
  );
}
