"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { LANGUAGES, getLangDir, type LangCode } from "@/lib/i18n";

interface Props {
  current: LangCode;
  onChange: (lang: LangCode) => void;
  /** Accessible label for the button and listbox (translated by caller) */
  label: string;
}

/**
 * Globe icon + language dropdown.
 * - Mobile: globe icon only
 * - sm+: globe + 2-letter language code + chevron
 * - a11y: role=listbox, aria-haspopup, aria-expanded, keyboard (Escape/Enter/Space)
 * - RTL: updates document.documentElement dir+lang on change
 * - Persistence: caller handles URL param (no localStorage per guardrail)
 */
export default function LanguageSelector({ current, onChange, label }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === current) ?? LANGUAGES[0];

  // Close on outside click/focus
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    },
    []
  );

  function select(code: LangCode) {
    onChange(code);
    setOpen(false);
    buttonRef.current?.focus();
    // Update document direction and lang attribute for RTL support
    const dir = getLangDir(code);
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", code);
  }

  // Display the code segment: "EN", "AR", "ZH", "PT"
  const displayCode = currentLang.code.split("-")[0].toUpperCase();

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 transition-colors"
      >
        {/* Globe SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>

        <span className="hidden sm:inline">{displayCode}</span>

        {/* Chevron */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
          className={`hidden sm:block transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute end-0 mt-1 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden py-1"
        >
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === current;
            return (
              <li
                key={lang.code}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onClick={() => select(lang.code)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    select(lang.code);
                  }
                }}
                className={`flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer transition-colors focus-visible:outline-none focus-visible:bg-slate-700 ${
                  isSelected
                    ? "bg-brand-600/20 text-brand-300 font-medium"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span aria-hidden="true" className="text-base leading-none">
                  {lang.flag}
                </span>
                <span>{lang.label}</span>
                {isSelected && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    focusable="false"
                    className="ms-auto text-brand-400 shrink-0"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
