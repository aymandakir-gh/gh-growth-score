"use client";

import { type DimensionConfig } from "@/lib/engine";

interface StageProgressProps {
  dimensions: DimensionConfig[];
  currentStageIdx: number;
  completedStageIdxs: number[];
  /** Localized label resolver (falls back to the descriptor label). */
  labelFor?: (key: string) => string;
}

export default function StageProgress({ dimensions, currentStageIdx, completedStageIdxs, labelFor }: StageProgressProps) {
  const STAGE_CONFIGS = dimensions;
  const labelOf = (cfg: DimensionConfig) => labelFor?.(cfg.key) ?? cfg.label;
  return (
    <div className="w-full mb-6">
      {/* Desktop: full labels */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Connector line behind dots */}
        <div className="absolute top-3.5 left-0 right-0 h-px bg-slate-700 z-0" />

        {STAGE_CONFIGS.map((cfg, idx) => {
          const isDone = completedStageIdxs.includes(idx);
          const isCurrent = idx === currentStageIdx;

          return (
            <div key={cfg.key} className="relative z-10 flex flex-col items-center gap-1.5" style={{ width: `${100 / STAGE_CONFIGS.length}%` }}>
              {/* Dot */}
              <div
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isDone
                    ? "bg-brand-500 border-brand-500 text-white"
                    : isCurrent
                    ? "bg-slate-900 border-brand-400 text-brand-400 ring-2 ring-brand-400/30 scale-110"
                    : "bg-slate-800 border-slate-600 text-slate-400"
                }`}
              >
                {isDone ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{cfg.emoji}</span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-xs font-medium transition-colors ${
                  isDone
                    ? "text-brand-400"
                    : isCurrent
                    ? "text-white"
                    : "text-slate-400"
                }`}
              >
                {labelOf(cfg)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile: compact dots + current stage label */}
      <div className="flex sm:hidden items-center justify-center gap-1.5">
        {STAGE_CONFIGS.map((cfg, idx) => {
          const isDone = completedStageIdxs.includes(idx);
          const isCurrent = idx === currentStageIdx;

          return (
            <div key={cfg.key} className="flex items-center gap-1.5">
              <div
                className={`rounded-full transition-all duration-300 flex items-center justify-center ${
                  isDone
                    ? "w-5 h-5 bg-brand-500"
                    : isCurrent
                    ? "w-6 h-6 bg-slate-800 border-2 border-brand-400 ring-2 ring-brand-400/20"
                    : "w-4 h-4 bg-slate-700"
                }`}
              >
                {isDone && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {isCurrent && <span className="text-brand-400 text-xs">{cfg.emoji}</span>}
              </div>
              {idx < STAGE_CONFIGS.length - 1 && (
                <div className={`w-4 h-px transition-colors ${isDone ? "bg-brand-500/60" : "bg-slate-700"}`} />
              )}
            </div>
          );
        })}
        <span className="ml-2 text-xs font-semibold text-brand-400">
          {STAGE_CONFIGS[currentStageIdx] ? labelOf(STAGE_CONFIGS[currentStageIdx]) : ""}
        </span>
      </div>
    </div>
  );
}
