// ─────────────────────────────────────────────────────────────────────────────
// Diagnostic registry + multi-diagnostic share codec.
//
// One place that knows about every diagnostic. The share codec lives here (not
// in engine.ts) because decoding a token requires looking the diagnostic up by
// id. Pure + Edge-safe.
//
// Token formats (all carry ONLY answer digits + a diagnostic tag — no PII):
//   "1.<15 digits>"        → AARRR (v1, legacy-compatible; AARRR keeps emitting this)
//   "2.<diagId>.<digits>"  → any diagnostic (v2, self-describing)
//   <base64 JSON>          → AARRR (pre-1.1 legacy)
// ─────────────────────────────────────────────────────────────────────────────

import {
  type Diagnostic,
  type AnswerValue,
  encodeAnswers,
  parseAnswerDigits,
} from "../engine";
import { AARRR_DIAGNOSTIC, decodeResultFromURL } from "../scoring";
import { PLG_DIAGNOSTIC } from "./plg";

export const DEFAULT_DIAGNOSTIC_ID = "aarrr";

/** Every diagnostic, keyed by id. Order = display order in the picker. */
export const DIAGNOSTICS: Record<string, Diagnostic> = {
  aarrr: AARRR_DIAGNOSTIC,
  plg: PLG_DIAGNOSTIC,
};

/** All diagnostics in display order. */
export function listDiagnostics(): Diagnostic[] {
  return Object.values(DIAGNOSTICS);
}

/** Look up a diagnostic by id (or slug). Returns undefined when unknown. */
export function getDiagnostic(id: string | null | undefined): Diagnostic | undefined {
  if (!id) return undefined;
  return DIAGNOSTICS[id];
}

/** Look up a diagnostic by id, falling back to the default (AARRR). */
export function getDiagnosticOrDefault(id: string | null | undefined): Diagnostic {
  return getDiagnostic(id) ?? DIAGNOSTICS[DEFAULT_DIAGNOSTIC_ID];
}

export interface DecodedShare {
  diagnosticId: string;
  diagnostic: Diagnostic;
  answers: Record<string, AnswerValue>;
}

/**
 * Encode answers into a share token for a diagnostic.
 * AARRR emits the legacy "1.<digits>" form (back-compat); every other
 * diagnostic emits the self-describing "2.<id>.<digits>" form.
 */
export function encodeResultToken(
  diagnostic: Diagnostic,
  answers: Record<string, AnswerValue>
): string {
  const digits = encodeAnswers(diagnostic, answers);
  if (diagnostic.id === DEFAULT_DIAGNOSTIC_ID) return `1.${digits}`;
  return `2.${diagnostic.id}.${digits}`;
}

/**
 * Decode any share token into its diagnostic + answers. Returns null for
 * malformed/unknown tokens. Back-compatible with v1 and legacy base64 (AARRR).
 */
export function decodeShareToken(token: string | null | undefined): DecodedShare | null {
  if (typeof token !== "string" || token.length === 0) return null;

  // v2: "2.<diagId>.<digits>"
  if (token.startsWith("2.")) {
    const rest = token.slice(2);
    const dot = rest.indexOf(".");
    if (dot === -1) return null;
    const id = rest.slice(0, dot);
    const digits = rest.slice(dot + 1);
    const diagnostic = getDiagnostic(id);
    if (!diagnostic) return null;
    const answers = parseAnswerDigits(diagnostic, digits);
    if (!answers) return null;
    return { diagnosticId: id, diagnostic, answers };
  }

  // v1 "1.<digits>" + legacy base64 → AARRR (handled by scoring.ts).
  const decoded = decodeResultFromURL(token);
  if (!decoded) return null;
  return {
    diagnosticId: DEFAULT_DIAGNOSTIC_ID,
    diagnostic: AARRR_DIAGNOSTIC,
    answers: decoded.answers,
  };
}
