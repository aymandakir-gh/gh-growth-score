"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { Locale, RTL_LOCALES, translations, LOCALE_LABELS } from "./i18n";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const SUPPORTED_LOCALES = new Set(Object.keys(translations)) as Set<Locale>;

/** Read ?lang= from the current URL; falls back to "en" if absent or unknown. */
function getLocaleFromUrl(): Locale {
  if (typeof window === "undefined") return "en";
  const param = new URLSearchParams(window.location.search).get("lang");
  return param && SUPPORTED_LOCALES.has(param as Locale) ? (param as Locale) : "en";
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface I18nContextValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (locale: Locale) => void;
  /** Translate a key; supports {var} interpolation via vars arg */
  t: (key: string, vars?: Record<string, string | number>) => string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const I18nContext = createContext<I18nContextValue | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function I18nProvider({ children }: { children: ReactNode }) {
  // Initialise from ?lang= URL param so html[lang] is correct on first client
  // render — suppressHydrationWarning on <html> handles the SSR "en" mismatch.
  const [locale, setLocaleState] = useState<Locale>(getLocaleFromUrl);

  const dir: "ltr" | "rtl" = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";

  // Sync dir + lang on <html> so screen readers and CSS inherit correctly
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [locale, dir]);

  // Re-sync locale on browser back/forward (popstate changes ?lang= in URL)
  useEffect(() => {
    const onPopState = () => {
      const next = getLocaleFromUrl();
      setLocaleState(next);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    // Persist to URL via ?lang= — no localStorage, per GH global defaults
    const url = new URL(window.location.href);
    url.searchParams.set("lang", newLocale);
    history.replaceState(null, "", url.toString());
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const dict = translations[locale];
      const fallback = translations["en"];
      let str = dict[key] ?? fallback[key] ?? key;
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        });
      }
      return str;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, dir, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used inside <I18nProvider>");
  }
  return ctx;
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports for convenience
// ─────────────────────────────────────────────────────────────────────────────

export type { Locale };
export { LOCALE_LABELS };
