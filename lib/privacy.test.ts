import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Guardrails for the privacy-first promise. These assert source-level invariants
// that are easy to regress and hard to catch otherwise. Comments are stripped
// before scanning so accurate explanatory comments don't trip the checks.

const root = resolve(__dirname, "..");

function code(p: string): string {
  const raw = readFileSync(resolve(root, p), "utf8");
  return raw
    .replace(/\/\*[\s\S]*?\*\//g, "") // block comments
    .replace(/(^|[^:])\/\/.*$/gm, "$1"); // line comments (keep "://" in URLs)
}

describe("privacy invariants", () => {
  it("client never identifies PostHog with the raw email", () => {
    // No posthog.identify(...) from the browser (would ship PII + persist an
    // email-keyed identity in localStorage/cookie).
    expect(code("components/ResultsDashboard.tsx")).not.toMatch(/\.identify\s*\(/);
  });

  it("locale is never read from or written to localStorage", () => {
    for (const f of ["lib/i18n-context.tsx", "lib/i18n.ts", "components/LanguageSelector.tsx"]) {
      expect(code(f)).not.toMatch(/localStorage/);
    }
  });

  it("the embed posts only a height beacon, never answers/PII", () => {
    const src = code("components/EmbedClient.tsx");
    const posts = src.match(/postMessage\([\s\S]*?\)/g) ?? [];
    expect(posts.length).toBeGreaterThan(0);
    for (const p of posts) {
      expect(p).toMatch(/EMBED_HEIGHT_MESSAGE|height/);
      expect(p).not.toMatch(/answers|email/);
    }
  });
});
