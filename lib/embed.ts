// ─────────────────────────────────────────────────────────────────────────────
// Embeddable-widget helpers (pure, testable).
//
// The actual loader is public/embed.js (a static, dependency-free <script> that
// any site drops in). This module holds the *pure* pieces — building the iframe
// src from the script's data-* attributes and validating the auto-resize height
// beacon — so they're unit-tested. public/embed.js mirrors this logic inline
// (it can't import, being a static file); keep the two in sync.
//
// Privacy: the height beacon carries ONLY a type tag + an integer height. No
// answers, no PII. The iframe src carries only non-PII view state (d/lang/r).
// ─────────────────────────────────────────────────────────────────────────────

export const EMBED_HEIGHT_MESSAGE = "gh-embed-height";
export const EMBED_MIN_HEIGHT = 320;
export const EMBED_MAX_HEIGHT = 20000;

export interface EmbedConfig {
  diagnostic?: string; // ?d=
  lang?: string; // ?lang=
  token?: string; // ?r= (share a specific result)
}

/** Build the `/embed` iframe URL from a base origin + data-* config. */
export function buildEmbedSrc(base: string, config: EmbedConfig): string {
  const trimmed = base.replace(/\/+$/, "");
  const params = new URLSearchParams();
  if (config.diagnostic) params.set("d", config.diagnostic);
  if (config.lang) params.set("lang", config.lang);
  if (config.token) params.set("r", config.token);
  const qs = params.toString();
  return `${trimmed}/embed${qs ? `?${qs}` : ""}`;
}

/** Type-guard for a valid auto-resize height beacon (paranoid by design). */
export function isHeightBeacon(
  data: unknown
): data is { type: string; height: number } {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    d.type === EMBED_HEIGHT_MESSAGE &&
    typeof d.height === "number" &&
    Number.isFinite(d.height) &&
    d.height > 0
  );
}

/** Clamp a reported height into a sane range. */
export function clampEmbedHeight(height: number): number {
  return Math.min(EMBED_MAX_HEIGHT, Math.max(EMBED_MIN_HEIGHT, Math.ceil(height)));
}
