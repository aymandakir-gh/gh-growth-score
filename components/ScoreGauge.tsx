"use client";

import { getScoreLabel } from "@/lib/scoring";

interface ScoreGaugeProps {
  score: number;
  size?: "sm" | "lg";
}

const urgencyColors = {
  critical: { ring: "#ef4444", text: "text-red-400", bg: "bg-red-500/10" },
  "needs-work": { ring: "#f59e0b", text: "text-yellow-400", bg: "bg-yellow-500/10" },
  good: { ring: "#22c55e", text: "text-green-400", bg: "bg-green-500/10" },
  excellent: { ring: "#10b981", text: "text-emerald-400", bg: "bg-emerald-500/10" },
};

export default function ScoreGauge({ score, size = "lg" }: ScoreGaugeProps) {
  const { label, description, urgency } = getScoreLabel(score);
  const colors = urgencyColors[urgency];

  const radius = size === "lg" ? 70 : 50;
  const stroke = size === "lg" ? 10 : 8;
  const viewBox = size === "lg" ? 160 : 120;
  const center = viewBox / 2;

  // Arc from 210deg to 330deg (240-degree sweep starting bottom-left)
  const startAngle = -210;
  const endAngle = startAngle + 240 * (score / 100);

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad),
    };
  }

  function describeArc(cx: number, cy: number, r: number, sAngle: number, eAngle: number) {
    const s = polarToCartesian(cx, cy, r, sAngle);
    const e = polarToCartesian(cx, cy, r, eAngle);
    const largeArc = eAngle - sAngle > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  }

  const trackPath = describeArc(center, center, radius, startAngle, startAngle + 240);
  const scorePath = score > 0
    ? describeArc(center, center, radius, startAngle, endAngle)
    : "";

  const fontSize = size === "lg" ? 36 : 26;
  const labelSize = size === "lg" ? 13 : 11;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: viewBox, height: viewBox * 0.82 }}>
        <svg
          width={viewBox}
          height={viewBox * 0.82}
          viewBox={`0 0 ${viewBox} ${viewBox * 0.82}`}
          className="overflow-visible"
        >
          {/* Track */}
          <path
            d={trackPath}
            fill="none"
            stroke="#1e293b"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          {/* Score arc */}
          {scorePath && (
            <path
              d={scorePath}
              fill="none"
              stroke={colors.ring}
              strokeWidth={stroke}
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 6px ${colors.ring}66)`,
              }}
            />
          )}
          {/* Score number */}
          <text
            x={center}
            y={center - 4}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={fontSize}
            fontWeight="bold"
            fill="white"
            fontFamily="Inter, system-ui, sans-serif"
          >
            {score}
          </text>
          {/* /100 label */}
          <text
            x={center}
            y={center + fontSize * 0.65}
            textAnchor="middle"
            fontSize={labelSize}
            fill="#64748b"
            fontFamily="Inter, system-ui, sans-serif"
          >
            / 100
          </text>
        </svg>
      </div>

      <div className="text-center mt-2">
        <div className={`text-lg font-bold ${colors.text}`}>{label}</div>
        <div className="text-sm text-slate-400 max-w-xs mt-0.5 leading-snug">
          {description}
        </div>
      </div>
    </div>
  );
}
