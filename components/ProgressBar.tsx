"use client";

interface ProgressBarProps {
  current: number;
  total: number;
  stageName: string;
  stageEmoji: string;
}

export default function ProgressBar({
  current,
  total,
  stageName,
  stageEmoji,
}: ProgressBarProps) {
  const percent = Math.round((current / total) * 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-300">
          {stageEmoji} {stageName}
        </span>
        <span className="text-sm text-slate-400">
          {current} / {total}
        </span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div
          className="bg-brand-500 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
