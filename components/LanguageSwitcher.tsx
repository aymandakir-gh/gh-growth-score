"use client";

import { useI18n, LOCALE_LABELS, Locale } from "@/lib/i18n-context";

const LOCALES = Object.keys(LOCALE_LABELS) as Locale[];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="relative inline-flex items-center">
      <label htmlFor="lang-switcher" className="sr-only">
        Select language
      </label>
      <select
        id="lang-switcher"
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className={`
          appearance-none bg-slate-800/80 border border-slate-700
          text-slate-300 text-xs font-medium rounded-lg
          px-3 py-1.5 pe-7
          cursor-pointer transition-colors
          hover:border-brand-500/60 hover:text-white
          focus:outline-none focus:ring-2 focus:ring-brand-500/40
        `}
        aria-label="Select language"
      >
        {LOCALES.map((loc) => (
          <option key={loc} value={loc}>
            {LOCALE_LABELS[loc]}
          </option>
        ))}
      </select>
      {/* Chevron icon — pointer-events:none so select stays clickable */}
      <span
        className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
        aria-hidden="true"
      >
        ▾
      </span>
    </div>
  );
}
