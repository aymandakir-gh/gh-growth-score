import { describe, it, expect } from "vitest";
import {
  buildEmbedSrc,
  isHeightBeacon,
  clampEmbedHeight,
  EMBED_HEIGHT_MESSAGE,
  EMBED_MIN_HEIGHT,
  EMBED_MAX_HEIGHT,
} from "./embed";

describe("buildEmbedSrc", () => {
  it("builds a bare /embed url with no config", () => {
    expect(buildEmbedSrc("https://x.io", {})).toBe("https://x.io/embed");
  });

  it("strips trailing slashes on the base", () => {
    expect(buildEmbedSrc("https://x.io//", {})).toBe("https://x.io/embed");
  });

  it("adds d / lang / r params when present", () => {
    const url = buildEmbedSrc("https://x.io", { diagnostic: "plg", lang: "fr", token: "2.plg.000000000000000" });
    expect(url).toContain("/embed?");
    expect(url).toContain("d=plg");
    expect(url).toContain("lang=fr");
    expect(url).toContain("r=2.plg.000000000000000");
  });
});

describe("isHeightBeacon", () => {
  it("accepts a valid beacon", () => {
    expect(isHeightBeacon({ type: EMBED_HEIGHT_MESSAGE, height: 740 })).toBe(true);
  });
  it("rejects junk / hostile payloads", () => {
    expect(isHeightBeacon(null)).toBe(false);
    expect(isHeightBeacon("740")).toBe(false);
    expect(isHeightBeacon({ type: "other", height: 740 })).toBe(false);
    expect(isHeightBeacon({ type: EMBED_HEIGHT_MESSAGE, height: "740" })).toBe(false);
    expect(isHeightBeacon({ type: EMBED_HEIGHT_MESSAGE, height: -1 })).toBe(false);
    expect(isHeightBeacon({ type: EMBED_HEIGHT_MESSAGE, height: Infinity })).toBe(false);
    // a beacon must not smuggle extra fields into something we trust
    expect(isHeightBeacon({ type: EMBED_HEIGHT_MESSAGE })).toBe(false);
  });
});

describe("clampEmbedHeight", () => {
  it("clamps to [min, max] and rounds up", () => {
    expect(clampEmbedHeight(10)).toBe(EMBED_MIN_HEIGHT);
    expect(clampEmbedHeight(999999)).toBe(EMBED_MAX_HEIGHT);
    expect(clampEmbedHeight(740.2)).toBe(741);
  });
});
