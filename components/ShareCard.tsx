"use client";

import { useState } from "react";
import { ScoringResult, encodeResultForURL } from "@/lib/scoring";

interface ShareCardProps {
  result: ScoringResult;
}

export default function ShareCard({ result }: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  const token = encodeResultForURL(result);
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?r=${token}`
      : `https://growth-score.growthackers.io/?r=${token}`;

  const summaryText = [
    `📊 My Growth Health Score: ${result.overallScore}/100`,
    ``,
    `AARRR Breakdown:`,
    ...result.stageResults.map(
      (s) => `${s.emoji} ${s.label}: ${s.rawScore}/100${s.isBottleneck ? " ⚠️" : ""}`
    ),
    ``,
    `Top bottlenecks: ${result.bottlenecks
      .map((b) => b.charAt(0).toUpperCase() + b.slice(1))
      .join(", ")}`,
    ``,
    `Get your free Growth Health Score → ${shareUrl}`,
  ].join("\n");

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select the input
    }
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  const tweetText = encodeURIComponent(
    `I scored ${result.overallScore}/100 on the Growth Health Score by @GrowthHackers\n\nTop bottlenecks: ${result.bottlenecks
      .map((b) => b.charAt(0).toUpperCase() + b.slice(1))
      .join(", ")}\n\nTake the free AARRR audit → `
  );
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}${encodeURIComponent(shareUrl)}`;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
      <h3 className="font-semibold text-white mb-1">Share your score</h3>
      <p className="text-sm text-slate-400 mb-4">
        Your results are encoded in the URL — no account needed to share.
      </p>

      {/* URL input */}
      <div className="flex gap-2 mb-3">
        <input
          readOnly
          value={shareUrl}
          className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-300 focus:outline-none font-mono truncate"
        />
        <button
          onClick={copyLink}
          className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors whitespace-nowrap"
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>

      {/* Action row */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={copySummary}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
        >
          <span>📋</span> Copy Summary
        </button>

        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
        >
          <span>𝕏</span> Share on X
        </a>

        <button
          onClick={() => {
            window.location.href = "/";
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
        >
          <span>🔄</span> Retake
        </button>
      </div>
    </div>
  );
}
