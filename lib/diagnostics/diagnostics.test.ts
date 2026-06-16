import { describe, it, expect } from "vitest";
import {
  DIAGNOSTICS,
  DEFAULT_DIAGNOSTIC_ID,
  listDiagnostics,
  getDiagnostic,
  getDiagnosticOrDefault,
  encodeResultToken,
  decodeShareToken,
} from "./index";
import { type AnswerValue } from "../engine";

function answersAll(diagnosticId: string, value: AnswerValue): Record<string, AnswerValue> {
  const a: Record<string, AnswerValue> = {};
  for (const q of DIAGNOSTICS[diagnosticId].questions) a[q.id] = value;
  return a;
}

describe("diagnostic registry", () => {
  it("contains aarrr and plg", () => {
    expect(Object.keys(DIAGNOSTICS).sort()).toEqual(["aarrr", "plg"]);
    expect(DEFAULT_DIAGNOSTIC_ID).toBe("aarrr");
  });

  it("listDiagnostics returns them in display order (aarrr first)", () => {
    expect(listDiagnostics().map((d) => d.id)).toEqual(["aarrr", "plg"]);
  });

  it("getDiagnostic resolves known ids, undefined otherwise", () => {
    expect(getDiagnostic("plg")?.id).toBe("plg");
    expect(getDiagnostic("nope")).toBeUndefined();
    expect(getDiagnostic(null)).toBeUndefined();
  });

  it("getDiagnosticOrDefault falls back to AARRR", () => {
    expect(getDiagnosticOrDefault("nope").id).toBe("aarrr");
    expect(getDiagnosticOrDefault("plg").id).toBe("plg");
  });
});

describe("multi-diagnostic share codec", () => {
  it("AARRR encodes to the legacy v1 form (1.<digits>)", () => {
    const token = encodeResultToken(DIAGNOSTICS.aarrr, answersAll("aarrr", 2));
    expect(token).toMatch(/^1\.[0-4]{15}$/);
  });

  it("PLG encodes to the self-describing v2 form (2.plg.<digits>)", () => {
    const token = encodeResultToken(DIAGNOSTICS.plg, answersAll("plg", 2));
    expect(token).toMatch(/^2\.plg\.[0-4]{15}$/);
  });

  it("round-trips every diagnostic", () => {
    for (const d of listDiagnostics()) {
      const answers = answersAll(d.id, 3);
      const token = encodeResultToken(d, answers);
      const decoded = decodeShareToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded!.diagnosticId).toBe(d.id);
      expect(decoded!.answers).toEqual(answers);
    }
  });

  it("decodes the canonical v1 AARRR token (back-compat)", () => {
    const decoded = decodeShareToken("1.342013402230114");
    expect(decoded).not.toBeNull();
    expect(decoded!.diagnosticId).toBe("aarrr");
    expect(Object.keys(decoded!.answers)).toHaveLength(15);
  });

  it("decodes legacy base64-JSON tokens as AARRR", () => {
    const legacy = btoa(JSON.stringify({ a: answersAll("aarrr", 4), s: 100, t: "" }));
    const decoded = decodeShareToken(legacy);
    expect(decoded).not.toBeNull();
    expect(decoded!.diagnosticId).toBe("aarrr");
  });

  it("rejects malformed / unknown tokens", () => {
    expect(decodeShareToken("")).toBeNull();
    expect(decodeShareToken(null)).toBeNull();
    expect(decodeShareToken("garbage!!!")).toBeNull();
    expect(decodeShareToken("2.unknown.000000000000000")).toBeNull();
    expect(decodeShareToken("2.plg.")).toBeNull();
    expect(decodeShareToken("2.plg.999")).toBeNull(); // wrong length
    expect(decodeShareToken("2.plg.00000000000000009")).toBeNull(); // digit out of range
    expect(decodeShareToken("1.999")).toBeNull(); // wrong length for AARRR
  });

  it("rejects legacy base64 tokens with a null/array answers field (regression)", () => {
    // `typeof null === "object"` once let `{"a":null}` decode to answers:null,
    // which then crashed scoreDiagnostic on render. Must be rejected.
    expect(decodeShareToken(btoa('{"a":null,"s":42}'))).toBeNull();
    expect(decodeShareToken(btoa('{"a":[],"s":42}'))).toBeNull();
    expect(decodeShareToken(btoa('{"a":"x","s":42}'))).toBeNull();
    expect(decodeShareToken(btoa('null'))).toBeNull();
  });

  it("carries no PII — token is only a tag plus answer digits", () => {
    const token = encodeResultToken(DIAGNOSTICS.plg, answersAll("plg", 1));
    // Whole token is the tag "2.plg." followed by answer digits only — no email,
    // name, free text, or timestamp can appear.
    expect(/^2\.plg\.[0-4]+$/.test(token)).toBe(true);
    const payload = token.slice("2.plg.".length);
    expect(/^[0-4]+$/.test(payload)).toBe(true);
  });
});
