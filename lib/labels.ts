// ─────────────────────────────────────────────────────────────────────────────
// Localized dimension labels/descriptions for any diagnostic.
//
// Resolution order (first hit wins):
//   1. dim.<diagnosticId>.<key>        — v2 per-diagnostic i18n keys (Slice 5+)
//   2. stage.<key>                     — legacy AARRR keys (already in 9 locales)
//   3. the descriptor's English label  — always present, honest fallback
//
// Keeps existing AARRR localization intact while supporting new diagnostics that
// don't yet have translated content.
// ─────────────────────────────────────────────────────────────────────────────

import type { Diagnostic } from "./engine";

type TFn = (key: string, vars?: Record<string, string | number>) => string;

export function dimLabel(t: TFn, diagnostic: Diagnostic, key: string): string {
  const fallback =
    diagnostic.dimensions.find((d) => d.key === key)?.label ?? key;
  const k1 = `dim.${diagnostic.id}.${key}`;
  const v1 = t(k1);
  if (v1 !== k1) return v1;
  const k2 = `stage.${key}`;
  const v2 = t(k2);
  if (v2 !== k2) return v2;
  return fallback;
}

export function dimDesc(t: TFn, diagnostic: Diagnostic, key: string): string {
  const fallback =
    diagnostic.dimensions.find((d) => d.key === key)?.description ?? "";
  const k1 = `dim.${diagnostic.id}.${key}.desc`;
  const v1 = t(k1);
  if (v1 !== k1) return v1;
  const k2 = `stage.${key}.desc`;
  const v2 = t(k2);
  if (v2 !== k2) return v2;
  return fallback;
}
