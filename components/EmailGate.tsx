"use client";

import { useState } from "react";

interface EmailGateProps {
  overallScore: number;
  onSuccess: (email: string) => void;
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
    <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-950/80 to-slate-900 p-8 text-center">
      <div className="text-4xl mb-3">📊</div>
      <h2 className="text-2xl font-bold text-white mb-2">
        Your score is ready
      </h2>
      <p className="text-slate-400 mb-1">
        You scored <span className="text-brand-400 font-bold text-xl">{overallScore}/100</span> overall.
      </p>
      <p className="text-slate-400 text-sm mb-6">
        Enter your email to unlock the full breakdown — stage scores, top
        bottlenecks, and 3 ICE-prioritized experiments to fix them.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3 text-left max-w-sm mx-auto">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            First Name
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Alex"
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
            className="w-full px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-colors"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !email}
          className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Unlocking…
            </>
          ) : (
            "Unlock My Full Report →"
          )}
        </button>

        <p className="text-center text-xs text-slate-600 pt-1">
          No spam. We respect your inbox.
        </p>
      </form>
    </div>
  );
}
