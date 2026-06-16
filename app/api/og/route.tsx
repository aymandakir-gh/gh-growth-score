import type { ReactElement } from "react";
import { ImageResponse } from "next/og";
import { buildShareModel, type ShareModel } from "@/lib/share-model";

// Pure string codec + model → safe on the Edge runtime.
export const runtime = "edge";

// ─── Palette ─────────────────────────────────────────────────────────────────
const BG = "#0b1020";
const PANEL = "#0f172a";
const TRACK = "#1e293b";
const TEXT = "#e2e8f0";
const MUTED = "#94a3b8";
const FAINT = "#64748b";
const BRAND = "#5c68f5";

function scoreColor(score: number): string {
  if (score >= 70) return "#4ade80";
  if (score >= 40) return "#facc15";
  return "#f87171";
}

function deltaText(delta: number): string {
  if (delta > 0) return `+${delta} vs median`;
  if (delta < 0) return `${delta} vs median`;
  return "at median";
}

// ─── Pieces ──────────────────────────────────────────────────────────────────
function Header(title: string) {
  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
      },
      children: [
        {
          type: "div",
          props: {
            style: { display: "flex", alignItems: "center", gap: "14px" },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    width: "18px",
                    height: "18px",
                    borderRadius: "5px",
                    background: BRAND,
                    display: "flex",
                  },
                },
              },
              {
                type: "div",
                props: {
                  style: { color: TEXT, fontSize: "30px", fontWeight: 700 },
                  children: title,
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: { color: FAINT, fontSize: "24px" },
            children: "growthackers.io",
          },
        },
      ],
    },
  };
}

function StageBar(label: string, score: number, color: string, barWidth: number) {
  const filled = Math.max(6, Math.round((score / 100) * barWidth));
  return {
    type: "div",
    props: {
      style: { display: "flex", alignItems: "center", width: "100%", gap: "18px" },
      children: [
        {
          type: "div",
          props: {
            style: { color: MUTED, fontSize: "26px", width: "190px", display: "flex" },
            children: label,
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              width: `${barWidth}px`,
              height: "18px",
              background: TRACK,
              borderRadius: "9px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    width: `${filled}px`,
                    height: "18px",
                    background: color,
                    borderRadius: "9px",
                  },
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: { color: TEXT, fontSize: "26px", fontWeight: 700, width: "70px", display: "flex" },
            children: String(score),
          },
        },
      ],
    },
  };
}

function ScoreBlock(model: ShareModel) {
  return {
    type: "div",
    props: {
      style: { display: "flex", flexDirection: "column", gap: "6px" },
      children: [
        {
          type: "div",
          props: {
            style: { display: "flex", alignItems: "flex-end", gap: "14px" },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    color: scoreColor(model.overallScore),
                    fontSize: "150px",
                    fontWeight: 800,
                    lineHeight: "1",
                    display: "flex",
                  },
                  children: String(model.overallScore),
                },
              },
              {
                type: "div",
                props: {
                  style: { color: FAINT, fontSize: "44px", paddingBottom: "18px", display: "flex" },
                  children: "/100",
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: { display: "flex", alignItems: "center", gap: "16px" },
            children: [
              {
                type: "div",
                props: {
                  style: { color: TEXT, fontSize: "34px", fontWeight: 600, display: "flex" },
                  children: model.valid ? model.overallLabel : "Take the free audit",
                },
              },
              model.valid
                ? {
                    type: "div",
                    props: {
                      style: { color: MUTED, fontSize: "26px", display: "flex" },
                      children: deltaText(model.overallDelta),
                    },
                  }
                : { type: "div", props: { style: { display: "flex" }, children: "" } },
            ],
          },
        },
      ],
    },
  };
}

// ─── Social card (1200×630) ──────────────────────────────────────────────────
function SocialCard(model: ShareModel) {
  const barWidth = 360;
  return {
    type: "div",
    props: {
      style: {
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: BG,
        padding: "56px 64px",
        fontFamily: "sans-serif",
      },
      children: [
        Header(model.diagnosticName),
        {
          type: "div",
          props: {
            style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "48px" },
            children: [
              ScoreBlock(model),
              {
                type: "div",
                props: {
                  style: { display: "flex", flexDirection: "column", gap: "16px" },
                  children: model.dimensions.map((s) =>
                    StageBar(s.label, s.score, s.color, barWidth)
                  ),
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: { color: FAINT, fontSize: "24px", display: "flex" },
            children: model.valid
              ? `Free ${model.diagnosticShortName} diagnostic — see your bottlenecks + experiments`
              : model.diagnosticTagline,
          },
        },
      ],
    },
  };
}

// ─── Report card (1200×1500, downloadable) ───────────────────────────────────
function ReportCard(model: ShareModel) {
  const barWidth = 560;
  return {
    type: "div",
    props: {
      style: {
        width: "1200px",
        height: "1500px",
        display: "flex",
        flexDirection: "column",
        gap: "40px",
        background: BG,
        padding: "64px",
        fontFamily: "sans-serif",
      },
      children: [
        Header(model.diagnosticName),
        ScoreBlock(model),
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: "22px",
              background: PANEL,
              borderRadius: "20px",
              padding: "36px 40px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: { color: TEXT, fontSize: "30px", fontWeight: 700, display: "flex" },
                  children: `${model.diagnosticShortName} breakdown vs. industry median`,
                },
              },
              ...model.dimensions.map((s) =>
                StageBar(
                  `${s.label}${s.isBottleneck ? "  ⚠" : ""}`,
                  s.score,
                  s.color,
                  barWidth
                )
              ),
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              background: PANEL,
              borderRadius: "20px",
              padding: "36px 40px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: { color: TEXT, fontSize: "30px", fontWeight: 700, display: "flex" },
                  children: "Top experiments to run next",
                },
              },
              ...(model.experiments.length
                ? model.experiments.map((e, i) => ({
                    type: "div",
                    props: {
                      style: { color: MUTED, fontSize: "26px", display: "flex" },
                      children: `${i + 1}.  ${e.title}`,
                    },
                  }))
                : [
                    {
                      type: "div",
                      props: {
                        style: { color: MUTED, fontSize: "26px", display: "flex" },
                        children: "Complete the audit to get your prioritized experiments.",
                      },
                    },
                  ]),
            ],
          },
        },
        {
          type: "div",
          props: {
            style: { color: FAINT, fontSize: "22px", marginTop: "auto", display: "flex", flexDirection: "column", gap: "6px" },
            children: [
              {
                type: "div",
                props: { style: { display: "flex" }, children: `growthackers.io · free & open-source ${model.diagnosticShortName} diagnostic` },
              },
              {
                type: "div",
                props: { style: { display: "flex", color: "#475569" }, children: "Benchmark medians are directional estimates — see datasets/benchmarks.md" },
              },
            ],
          },
        },
      ],
    },
  };
}

export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("r");
  const variant = searchParams.get("v");
  const model = buildShareModel(token);

  const isReport = variant === "report";
  const element = isReport ? ReportCard(model) : SocialCard(model);
  const size = isReport
    ? { width: 1200, height: 1500 }
    : { width: 1200, height: 630 };

  return new ImageResponse(element as unknown as ReactElement, {
    ...size,
    headers: {
      // Stateless render from the URL token — cache aggressively at the edge.
      "cache-control": "public, max-age=86400, s-maxage=86400, immutable",
    },
  });
}
