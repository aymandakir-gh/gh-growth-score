"use client";

import { useState, useCallback } from "react";
import {
  QUESTIONS,
  STAGE_CONFIGS,
  AnswerValue,
  Stage,
  ScoringResult,
  scoreSubmission,
} from "@/lib/scoring";
import QuestionCard from "./QuestionCard";
import ProgressBar from "./ProgressBar";

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

  const handleAnswer = useCallback(
    (questionId: string, value: AnswerValue) => {
      const newAnswers = { ...answers, [questionId]: value };
      setAnswers(newAnswers);

      // Auto-advance after a tiny delay so the selection visually registers
      setTimeout(() => {
        const nextInStage = currentQuestionInStage + 1;

        if (nextInStage < stageQuestions.length) {
          // More questions in this stage
          setCurrentQuestionInStage(nextInStage);
        } else {
          // Move to next stage
          const nextStageIdx = currentStageIdx + 1;
          if (nextStageIdx < STAGE_CONFIGS.length) {
            setCurrentStageIdx(nextStageIdx);
            setCurrentQuestionInStage(0);
          } else {
            // All done — compute result
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
      <div className="animate-fade-in text-center space-y-6">
        {/* Hero */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 text-xs font-semibold tracking-wide uppercase">
            Free Growth Audit
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            What&apos;s Your Growth
            <br />
            <span className="text-brand-400">Health Score?</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
            Answer 15 diagnostic questions across the 5 AARRR stages. Get a
            0–100 score per stage, identify your top bottlenecks, and receive 3
            ICE-prioritized experiments to fix them.
          </p>
        </div>

        {/* Stage pills */}
        <div className="flex flex-wrap justify-center gap-2">
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
        <div className="grid sm:grid-cols-3 gap-3 text-left max-w-xl mx-auto">
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

        {/* CTA */}
        <div className="pt-2">
          <button
            onClick={() => setPhase("quiz")}
            className="px-8 py-4 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-lg transition-all duration-200 hover:scale-105 active:scale-100 shadow-lg shadow-brand-900/50"
          >
            Start Free Audit →
          </button>
          <p className="text-xs text-slate-600 mt-3">
            Takes ~3 minutes. No signup required to start.
          </p>
        </div>
      </div>
    );
  }

  // Quiz phase
  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      {/* Stage header */}
      <div>
        <div className="flex items-center justify-between mb-4">
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

        {/* Overall progress */}
        <div className="w-full bg-slate-700 rounded-full h-1.5 mb-4">
          <div
            className="bg-brand-500 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${(totalAnswered / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Stage progress dots */}
        <div className="flex items-center gap-2 mb-2">
          {STAGE_CONFIGS.map((cfg, idx) => {
            const stageQs = QUESTIONS.filter((q) => q.stage === cfg.stage);
            const stageAnswered = stageQs.filter((q) => answers[q.id] !== undefined).length;
            const isDone = stageAnswered === stageQs.length;
            const isCurrent = idx === currentStageIdx;
            return (
              <div key={cfg.stage} className="flex items-center gap-1">
                <div
                  className={`w-2 h-2 rounded-full transition-all ${
                    isDone
                      ? "bg-brand-500"
                      : isCurrent
                      ? "bg-brand-400 scale-125"
                      : "bg-slate-700"
                  }`}
                />
                {idx < STAGE_CONFIGS.length - 1 && (
                  <div className={`w-6 h-px ${isDone ? "bg-brand-500/50" : "bg-slate-700"}`} />
                )}
              </div>
            );
          })}
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
          ← Back
        </button>
      )}
    </div>
  );
}
