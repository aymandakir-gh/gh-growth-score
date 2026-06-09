import { describe, it, expect } from "vitest";
import {
  LANGUAGES,
  translations,
  getLangDir,
  isValidLang,
  type LangCode,
  type UITranslations,
} from "../i18n";

// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGES array
// ─────────────────────────────────────────────────────────────────────────────

describe("LANGUAGES", () => {
  it("contains exactly 9 entries (P1 set)", () => {
    expect(LANGUAGES).toHaveLength(9);
  });

  it("includes English as first entry", () => {
    expect(LANGUAGES[0].code).toBe("en");
  });

  it("includes all required P1 language codes", () => {
    const codes = LANGUAGES.map((l) => l.code);
    expect(codes).toContain("en");
    expect(codes).toContain("ar");
    expect(codes).toContain("it");
    expect(codes).toContain("nl");
    expect(codes).toContain("zh-CN");
    expect(codes).toContain("es");
    expect(codes).toContain("fr");
    expect(codes).toContain("de");
    expect(codes).toContain("pt-BR");
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
    const ltrCodes: LangCode[] = ["en", "it", "nl", "zh-CN", "es", "fr", "de", "pt-BR"];
    for (const code of ltrCodes) {
      expect(getLangDir(code)).toBe("ltr");
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// isValidLang
// ─────────────────────────────────────────────────────────────────────────────

describe("isValidLang", () => {
  it("returns true for all P1 language codes", () => {
    const validCodes = ["en", "ar", "it", "nl", "zh-CN", "es", "fr", "de", "pt-BR"];
    for (const code of validCodes) {
      expect(isValidLang(code)).toBe(true);
    }
  });

  it("returns false for an unknown code", () => {
    expect(isValidLang("xx")).toBe(false);
  });

  it("returns false for an empty string", () => {
    expect(isValidLang("")).toBe(false);
  });

  it("returns false for a partial match (case sensitivity)", () => {
    expect(isValidLang("EN")).toBe(false);
    expect(isValidLang("AR")).toBe(false);
    expect(isValidLang("ZH-CN")).toBe(false);
  });

  it("returns false for a SQL injection-style string", () => {
    expect(isValidLang("'; DROP TABLE --")).toBe(false);
  });

  it("returns false for a script tag injection attempt", () => {
    expect(isValidLang('<script>alert("xss")</script>')).toBe(false);
  });

  it("returns false for null-like strings", () => {
    expect(isValidLang("null")).toBe(false);
    expect(isValidLang("undefined")).toBe(false);
  });

  it("returns false for P2 codes not yet in P1 set", () => {
    expect(isValidLang("ja")).toBe(false);
    expect(isValidLang("ko")).toBe(false);
    expect(isValidLang("zh-TW")).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// translations — shape completeness
// ─────────────────────────────────────────────────────────────────────────────

describe("translations", () => {
  const allCodes: LangCode[] = ["en", "ar", "it", "nl", "zh-CN", "es", "fr", "de", "pt-BR"];

  it("has a translation entry for every P1 language code", () => {
    for (const code of allCodes) {
      expect(translations[code]).toBeDefined();
    }
  });

  it("every translation has the required UITranslations shape", () => {
    for (const code of allCodes) {
      const t: UITranslations = translations[code];
      // nav
      expect(typeof t.nav.title).toBe("string");
      expect(t.nav.title.length).toBeGreaterThan(0);
      expect(typeof t.nav.openSource).toBe("string");
      expect(t.nav.openSource.length).toBeGreaterThan(0);
      // footer
      expect(typeof t.footer.openSource).toBe("string");
      expect(typeof t.footer.github).toBe("string");
      expect(typeof t.footer.privacy).toBe("string");
      expect(typeof t.footer.license).toBe("string");
      // selectLanguage
      expect(typeof t.selectLanguage).toBe("string");
      expect(t.selectLanguage.length).toBeGreaterThan(0);
    }
  });

  it("English translation matches expected values", () => {
    expect(translations.en.nav.title).toBe("Growth Health Score");
    expect(translations.en.footer.github).toBe("GitHub");
    expect(translations.en.selectLanguage).toBe("Select language");
  });

  it("Arabic translation is non-empty and different from English", () => {
    expect(translations.ar.nav.title).not.toBe(translations.en.nav.title);
    expect(translations.ar.selectLanguage).not.toBe(translations.en.selectLanguage);
  });

  it("no translation key is accidentally undefined or empty string", () => {
    for (const code of allCodes) {
      const t = translations[code];
      const flat = [
        t.nav.title,
        t.nav.openSource,
        t.footer.openSource,
        t.footer.github,
        t.footer.privacy,
        t.footer.license,
        t.selectLanguage,
      ];
      for (const val of flat) {
        expect(val).toBeDefined();
        expect(val.length).toBeGreaterThan(0);
      }
    }
  });

  it("translations count matches LANGUAGES count (no orphaned entries)", () => {
    const translationKeys = Object.keys(translations);
    expect(translationKeys).toHaveLength(LANGUAGES.length);
  });
});
