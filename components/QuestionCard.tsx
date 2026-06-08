"use client";

import { Question, AnswerValue } from "@/lib/scoring";

interface QuestionCardProps {
  question: Question;
  currentAnswer: AnswerValue | undefined;
  questionIndex: number;
  totalInStage: number;
  onAnswer: (questionId: string, value: AnswerValue) => void;
}

export default function QuestionCard({
  question,
  currentAnswer,
  questionIndex,
  totalInStage,
  onAnswer,
}: QuestionCardProps) {
  return (
    <div className="animate-slide-up">
      <div className="mb-2 text-xs font-semibold tracking-widest text-brand-400 uppercase">
        Question {questionIndex + 1} of {totalInStage}
      </div>

      <h2 className="text-xl font-semibold text-white mb-2 leading-snug">
        {question.text}
      </h2>

      {question.hint && (
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          {question.hint}
        </p>
      )}

      <div className="space-y-3">
        {question.options.map((option, idx) => {
          const value = idx as AnswerValue;
          const isSelected = currentAnswer === value;

          return (
            <button
              key={idx}
              onClick={() => onAnswer(question.id, value)}
              className={`
                w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200
                flex items-start gap-3 group
                ${
                  isSelected
                    ? "border-brand-500 bg-brand-500/15 text-white"
                    : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-brand-500/50 hover:bg-slate-800 hover:text-white"
                }
              `}
            >
              {/* Option indicator dot */}
              <span
                className={`
                  mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
                  transition-all duration-200
                  ${
                    isSelected
                      ? "border-brand-500 bg-brand-500"
                      : "border-slate-600 group-hover:border-brand-400"
                  }
                `}
              >
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-white block" />
                )}
              </span>

              <span className="text-sm leading-relaxed">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
