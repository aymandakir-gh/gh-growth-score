"use client";

import { useState } from "react";

interface EmailGateProps {
  overallScore: number;
  onSuccess: (email: string) => void;
}

function scoreColor(score: number) {
  if (score >= 70) return "text-green-400";
  if (score >= 40) return "text-yellow-400";
  return "text-red-400";
}

function scoreLabel(score: number) {
  if (score >= 70) return "Strong foundation";
  if (score >= 40) return "Room to grow";
  return "Critical gaps found";
}

export default function EmailGate({ overallScore, onSuccess }: EmailGateProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName, company, overallScore }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      onSuccess(email);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-950/80 to-slate-900 p-6 sm:p-8">
      {/* Score preview */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">📊</div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Your score is ready
        </h2>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className={`text-3xl font-bold ${scoreColor(overallScore)}`}>
            {overallScore}/100
          </span>
          <span className={`text-sm font-medium px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 ${scoreColor(overallScore)}`}>
            {scoreLabel(overallScore)}
          </span>
        </div>
        <p className="text-slate-400 text-sm mt-3 max-w-sm mx-auto">
          Enter your email to unlock the full breakdown &mdash; stage scores, top
          bottlenecks, and 3 ICE-prioritized experiments to fix them.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 max-w-sm mx-auto">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            First Name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Alex"
            autoComplete="given-name"
            className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Company <span className="text-slate-600">(optional)</span>
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Acme Inc."
            autoComplete="organization"
            className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Work Email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            aria-invalid={!!error}
            aria-describedby="email-error-msg"
            className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-colors"
          />
        </div>

        {error && (
          <p
            id="email-error-msg"
            role="alert"
            aria-live="polite"
            className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Unlocking&hellip;
            </>
          ) : (
            "Unlock My Full Report →"
          )}
        </button>

        {/* Privacy note */}
        <div className="flex items-start gap-2 pt-1">
          <svg className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-xs text-slate-500 leading-relaxed">
            We respect your privacy. No spam, ever. Your email is only used to send you your results. Unsubscribe anytime.
          </p>
        </div>
      </form>
    </div>
  );
}
