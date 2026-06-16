import { describe, it, expect } from "vitest";
import {
  LANGUAGES,
  LOCALE_LABELS,
  RTL_LOCALES,
  translations,
  getLangDir,
  isValidLang,
  type LangCode,
  type Locale,
} from "../i18n";

// ─────────────────────────────────────────────────────────────────────────────
// These tests validate the REAL i18n API in lib/i18n.ts:
//   - 9 P1 locales: en, ar, it, nl, zh, es, fr, de, pt-br
//   - translations are FLAT dot-keyed dictionaries (Record<Locale, Record<string,string>>)
//     consumed via t("nav.title") — not a nested object.
// (The previous version of this file tested an aspirational nested `UITranslations`
//  shape with codes "zh-CN"/"pt-BR" that this codebase never shipped. Rewritten to
//  match the live implementation, mirroring the W6 LanguageSelector test rewrite.)
// ─────────────────────────────────────────────────────────────────────────────

const ALL_CODES: Locale[] = ["en", "ar", "it", "nl", "zh", "es", "fr", "de", "pt-br"];

// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGES array
// ─────────────────────────────────────────────────────────────────────────────

describe("LANGUAGES", () => {
  it("contains exactly 9 entries (P1 set)", () => {
    expect(LANGUAGES).toHaveLength(9);
  });

  it("includes English as the first entry", () => {
    expect(LANGUAGES[0].code).toBe("en");
  });

  it("includes all required P1 language codes", () => {
    const codes = LANGUAGES.map((l) => l.code);
    for (const code of ALL_CODES) {
      expect(codes).toContain(code);
    }
  });

  it("every entry has a non-empty label and flag", () => {
    for (const lang of LANGUAGES) {
      expect(lang.label.length).toBeGreaterThan(0);
      expect(lang.flag.length).toBeGreaterThan(0);
    }
  });

  it("Arabic is marked rtl; all others are ltr", () => {
    for (const lang of LANGUAGES) {
      if (lang.code === "ar") {
        expect(lang.dir).toBe("rtl");
      } else {
        expect(lang.dir).toBe("ltr");
      }
    }
  });

  it("has no duplicate codes", () => {
    const codes = LANGUAGES.map((l) => l.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("every code has a matching LOCALE_LABELS entry", () => {
    for (const lang of LANGUAGES) {
      expect(LOCALE_LABELS[lang.code]).toBe(lang.label);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getLangDir
// ─────────────────────────────────────────────────────────────────────────────

describe("getLangDir", () => {
  it("returns 'rtl' for Arabic", () => {
    expect(getLangDir("ar")).toBe("rtl");
  });

  it("returns 'ltr' for English", () => {
    expect(getLangDir("en")).toBe("ltr");
  });

  it("returns 'ltr' for all non-Arabic P1 languages", () => {
    const ltrCodes: LangCode[] = ["en", "it", "nl", "zh", "es", "fr", "de", "pt-br"];
    for (const code of ltrCodes) {
      expect(getLangDir(code)).toBe("ltr");
    }
  });

  it("only Arabic is registered as an RTL locale", () => {
    expect(RTL_LOCALES).toEqual(["ar"]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// isValidLang
// ─────────────────────────────────────────────────────────────────────────────

describe("isValidLang", () => {
  it("returns true for all P1 language codes", () => {
    for (const code of ALL_CODES) {
      expect(isValidLang(code)).toBe(true);
    }
  });

  it("returns false for an unknown code", () => {
    expect(isValidLang("xx")).toBe(false);
  });

  it("returns false for an empty string", () => {
    expect(isValidLang("")).toBe(false);
  });

  it("returns false for a case-mismatched code", () => {
    expect(isValidLang("EN")).toBe(false);
    expect(isValidLang("AR")).toBe(false);
    expect(isValidLang("PT-BR")).toBe(false);
  });

  it("returns false for a SQL-injection-style string", () => {
    expect(isValidLang("'; DROP TABLE --")).toBe(false);
  });

  it("returns false for a script-tag injection attempt", () => {
    expect(isValidLang('<script>alert("xss")</script>')).toBe(false);
  });

  it("returns false for null-like strings", () => {
    expect(isValidLang("null")).toBe(false);
    expect(isValidLang("undefined")).toBe(false);
  });

  it("returns false for prototype keys (no prototype pollution leak)", () => {
    expect(isValidLang("toString")).toBe(false);
    expect(isValidLang("constructor")).toBe(false);
    expect(isValidLang("__proto__")).toBe(false);
  });

  it("returns false for P2 codes not yet in the P1 set", () => {
    expect(isValidLang("ja")).toBe(false);
    expect(isValidLang("ko")).toBe(false);
    expect(isValidLang("zh-TW")).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// translations — flat-key shape completeness
// ─────────────────────────────────────────────────────────────────────────────

describe("translations", () => {
  it("has a translation entry for every P1 language code", () => {
    for (const code of ALL_CODES) {
      expect(translations[code]).toBeDefined();
    }
  });

  it("every locale exposes the nav.title and nav.openSource keys", () => {
    for (const code of ALL_CODES) {
      expect(typeof translations[code]["nav.title"]).toBe("string");
      expect(translations[code]["nav.title"].length).toBeGreaterThan(0);
      expect(typeof translations[code]["nav.openSource"]).toBe("string");
      expect(translations[code]["nav.openSource"].length).toBeGreaterThan(0);
    }
  });

  it("English translation matches expected baseline values", () => {
    expect(translations.en["nav.title"]).toBe("Growth Health Score");
    expect(translations.en["nav.openSource"]).toBe("Open source · MIT");
  });

  it("Arabic translation is localized and differs from English", () => {
    expect(translations.ar["nav.title"]).not.toBe(translations.en["nav.title"]);
  });

  it("every locale has the exact same key set as English (no missing/orphan keys)", () => {
    const enKeys = Object.keys(translations.en).sort();
    for (const code of ALL_CODES) {
      const keys = Object.keys(translations[code]).sort();
      expect(keys).toEqual(enKeys);
    }
  });

  it("no translation value is undefined or an empty string", () => {
    for (const code of ALL_CODES) {
      for (const value of Object.values(translations[code])) {
        expect(value).toBeDefined();
        expect(value.length).toBeGreaterThan(0);
      }
    }
  });

  it("translations count matches LANGUAGES count (no orphaned entries)", () => {
    expect(Object.keys(translations)).toHaveLength(LANGUAGES.length);
  });
});
