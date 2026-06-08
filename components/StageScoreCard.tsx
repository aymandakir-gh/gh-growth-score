"use client";

import { StageResult } from "@/lib/scoring";

const colorMap: Record<string, { bar: string; badge: string; text: string; bg: string }> = {
  blue:   { bar: "bg-blue-500",   badge: "bg-blue-500/20 text-blue-300",   text: "text-blue-400",   bg: "border-blue-500/30" },
  purple: { bar: "bg-purple-500", badge: "bg-purple-500/20 text-purple-300", text: "text-purple-400", bg: "border-purple-500/30" },
  green:  { bar: "bg-green-500",  badge: "bg-green-500/20 text-green-300",  text: "text-green-400",  bg: "border-green-500/30" },
  yellow: { bar: "bg-yellow-500", badge: "bg-yellow-500/20 text-yellow-300", text: "text-yellow-400", bg: "border-yellow-500/30" },
  orange: { bar: "bg-orange-500", badge: "bg-orange-500/20 text-orange-300", text: "text-orange-400", bg: "border-orange-500/30" },
};

interface StageScoreCardProps {
  result: StageResult;
  animationDelay?: number;
}

function getScoreColor(score: number): string {
  if (score < 30) return "text-red-400";
  if (score < 55) return "text-yellow-400";
  if (score < 75) return "text-green-400";
  return "text-emerald-400";
}

export default function StageScoreCard({ result, animationDelay = 0 }: StageScoreCardProps) {
  const colors = colorMap[result.color] ?? colorMap.blue;

  return (
    <div
      className={`
        rounded-xl border bg-slate-800/60 p-5 transition-all duration-300
        ${result.isBottleneck ? "border-red-500/40 ring-1 ring-red-500/20" : colors.bg}
      `}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{result.emoji}</span>
          <div>
            <div className="font-semibold text-white text-sm">{result.label}</div>
            <div className="text-xs text-slate-500">Weight: {Math.round(result.weight * 100)}%</div>
          </div>
        </div>

        <div className="text-right">
          <div className={`text-2xl font-bold ${getScoreColor(result.rawScore)}`}>
            {result.rawScore}
          </div>
          <div className="text-xs text-slate-500">/ 100</div>
        </div>
      </div>

      {/* Score bar */}
      <div className="w-full bg-slate-700 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ease-out ${
            result.isBottleneck ? "bg-red-500" : colors.bar
          }`}
          style={{ width: `${result.rawScore}%` }}
        />
      </div>

      {/* Bottleneck badge */}
      {result.isBottleneck && (
        <div className="flex items-center gap-1.5 mt-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
            Top Bottleneck — fix this first
          </span>
        </div>
      )}
    </div>
  );
}
