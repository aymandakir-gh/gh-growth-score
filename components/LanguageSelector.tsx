"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { Locale, LOCALE_LABELS, RTL_LOCALES } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n-context";

const LOCALES = Object.keys(LOCALE_LABELS) as Locale[];

// ─── Icons ───────────────────────────────────────────────────────────────────

function GlobeIcon() {
  return (
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
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
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
      className={`hidden sm:block transition-transform duration-150 ${open ? "rotate-180" : ""}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CheckIcon() {
  return (
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
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

const LISTBOX_ID = "language-selector-listbox";
const BUTTON_ID = "language-selector-btn";

/**
 * LanguageSelector
 *
 * Globe icon button + dropdown listbox for 9 P1 languages.
 * Reads and sets locale via useI18n() — no prop drilling required.
 *
 * Languages: EN (default), IT, AR (RTL), NL, ZH, ES, FR, DE, PT-BR.
 *
 * a11y: WCAG 2.1 AA
 * - aria-haspopup="listbox", aria-expanded, aria-controls
 * - role="listbox" on <ul>, role="option" + aria-selected on each <li>
 * - AR option carries dir="rtl"
 * - html[dir] + html[lang] updated by I18nProvider (useEffect in i18n-context)
 * - Keyboard: Enter/Space/ArrowDown opens; ArrowUp/Down navigates;
 *   Enter/Space selects; Escape closes and returns focus to trigger
 *
 * Persistence: React state only. localStorage omitted per SKILL guardrail.
 */
export default function LanguageSelector() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const currentLabel = LOCALE_LABELS[locale];
  const currentIdx = LOCALES.indexOf(locale);
  // Display short code: "EN", "AR", "ZH", "PT" etc.
  const displayCode = locale.split("-")[0].toUpperCase();

  // ── Close on outside click ─────────────────────────────────────────────────
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // ── Set initial focus index when dropdown opens ────────────────────────────
  useEffect(() => {
    if (open) {
      setFocusedIdx(currentIdx >= 0 ? currentIdx : 0);
    } else {
      setFocusedIdx(-1);
    }
  }, [open, currentIdx]);

  // ── Scroll focused item into view ─────────────────────────────────────────
  useEffect(() => {
    if (!open || focusedIdx < 0 || !listRef.current) return;
    const item = listRef.current.children[focusedIdx] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [open, focusedIdx]);

  const selectLocale = useCallback(
    (loc: Locale) => {
      setLocale(loc);
      setOpen(false);
      buttonRef.current?.focus();
    },
    [setLocale]
  );

  // ── Trigger button keyboard handler ───────────────────────────────────────
  function handleButtonKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    switch (e.key) {
      case "Enter":
      case " ":
      case "ArrowDown":
        e.preventDefault();
        setOpen(true);
        break;
      case "ArrowUp":
        e.preventDefault();
        setOpen(true);
        break;
      case "Escape":
        setOpen(false);
        break;
    }
  }

  // ── Listbox keyboard handler ───────────────────────────────────────────────
  function handleListKeyDown(e: KeyboardEvent<HTMLUListElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIdx((i) => Math.min(i + 1, LOCALES.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIdx((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusedIdx >= 0) selectLocale(LOCALES[focusedIdx]);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  return (
    <div ref={containerRef} className="relative">
      {/* ── Trigger ── */}
      <button
        ref={buttonRef}
        id={BUTTON_ID}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={LISTBOX_ID}
        aria-label={`Language: ${currentLabel}. Change language`}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleButtonKeyDown}
        className={`
          flex items-center gap-1.5
          px-2.5 py-1.5 rounded-md
          text-xs font-medium
          transition-colors cursor-pointer select-none
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500
          ${
            open
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }
        `}
      >
        <GlobeIcon />
        <span className="hidden sm:inline">{displayCode}</span>
        <ChevronIcon open={open} />
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <ul
          ref={listRef}
          id={LISTBOX_ID}
          role="listbox"
          aria-labelledby={BUTTON_ID}
          aria-label="Select language"
          tabIndex={-1}
          onKeyDown={handleListKeyDown}
          className="
            absolute end-0 top-full mt-1 z-50
            w-48 max-h-72 overflow-y-auto
            bg-slate-900 border border-slate-700 rounded-lg shadow-xl
            py-1 focus:outline-none
          "
        >
          {LOCALES.map((loc, idx) => {
            const isSelected = locale === loc;
            const isFocused = focusedIdx === idx;
            const isRtl = RTL_LOCALES.includes(loc);

            return (
              <li
                key={loc}
                id={`lang-option-${loc}`}
                role="option"
                aria-selected={isSelected}
                dir={isRtl ? "rtl" : "ltr"}
                tabIndex={isFocused ? 0 : -1}
                onClick={() => selectLocale(loc)}
                onMouseEnter={() => setFocusedIdx(idx)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selectLocale(loc);
                  }
                }}
                className={`
                  flex items-center gap-2.5
                  px-3 py-2 text-sm cursor-pointer select-none
                  transition-colors focus-visible:outline-none
                  ${isFocused ? "bg-slate-800 text-white" : ""}
                  ${
                    isSelected
                      ? "bg-brand-600/20 text-brand-300 font-medium"
                      : !isFocused
                      ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                      : ""
                  }
                `}
              >
                <span>{LOCALE_LABELS[loc]}</span>
                {isSelected && <CheckIcon />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
