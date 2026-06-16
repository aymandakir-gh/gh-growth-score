"use client";

import { type EngineExperiment } from "@/lib/engine";

interface ExperimentCardProps {
  experiment: EngineExperiment;
  rank: number;
  /** Display label for the experiment's dimension (localized). */
  label: string;
  /** Tailwind color stem of the dimension, for the chip. */
  colorStem?: string;
}

const stemColors: Record<string, string> = {
  blue: "text-blue-400 bg-blue-500/15",
  purple: "text-purple-400 bg-purple-500/15",
  green: "text-green-400 bg-green-500/15",
  yellow: "text-yellow-400 bg-yellow-500/15",
  orange: "text-orange-400 bg-orange-500/15",
};

const rankStyles = [
  "border-yellow-500/40 bg-yellow-500/5",
  "border-slate-500/40 bg-slate-500/5",
  "border-orange-700/40 bg-orange-900/5",
];

export default function ExperimentCard({
  experiment,
  rank,
  label,
  colorStem,
}: ExperimentCardProps) {
  const chipColor = stemColors[colorStem ?? ""] ?? "text-slate-400 bg-slate-500/15";
  const borderStyle = rankStyles[rank - 1] ?? "border-slate-700 bg-slate-800/40";

  return (
    <div className={`rounded-xl border p-5 ${borderStyle}`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-300">
            {rank}
          </span>
          <h3 className="font-semibold text-white text-base leading-snug">
            {experiment.title}
          </h3>
        </div>

        {/* ICE badge */}
        <div className="flex-shrink-0 text-center">
          <div className="text-lg font-bold text-brand-400">{experiment.ice}</div>
          <div className="text-xs text-slate-400 leading-none">ICE</div>
        </div>
      </div>

      <p className="text-sm text-slate-400 leading-relaxed mb-4">
        {experiment.description}
      </p>

      {/* Metrics row */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${chipColor}`}>
          {label}
        </span>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>
            Impact <strong className="text-slate-300">{experiment.impact}/10</strong>
          </span>
          <span>
            Confidence <strong className="text-slate-300">{experiment.confidence}/10</strong>
          </span>
          <span>
            Effort <strong className="text-slate-300">{experiment.effort}/10</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
