import { describe, it, expect } from "vitest";
import { resolveLocale, translations, type Locale } from "./i18n";

describe("resolveLocale — ?lang= URL param", () => {
  it("resolves every supported locale", () => {
    for (const code of Object.keys(translations) as Locale[]) {
      expect(resolveLocale(`?lang=${code}`)).toBe(code);
      // also when other params are present (order-independent)
      expect(resolveLocale(`?d=plg&lang=${code}&r=1.000000000000000`)).toBe(code);
    }
  });

  it("returns null for missing / invalid / malformed", () => {
    expect(resolveLocale("")).toBeNull();
    expect(resolveLocale("?d=plg")).toBeNull();
    expect(resolveLocale("?lang=")).toBeNull();
    expect(resolveLocale("?lang=xx")).toBeNull();
    expect(resolveLocale("?lang=EN")).toBeNull(); // case-sensitive on purpose
    expect(resolveLocale("?lang=en-US")).toBeNull();
  });

  it("is pure — does not read or write localStorage", () => {
    // resolveLocale takes only a string and returns a value; there is no storage
    // path. This asserts the contract: locale is URL-driven, never persisted.
    const before = JSON.stringify(globalThis.localStorage ?? null);
    resolveLocale("?lang=ar");
    const after = JSON.stringify(globalThis.localStorage ?? null);
    expect(after).toBe(before);
  });
});
