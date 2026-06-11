"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DISTRICT_MAP } from "@/lib/constants";
import { DISTRICT_SHAPES, MAP_H, MAP_W } from "@/lib/incheon-geo";
import type { District } from "@/lib/types";

// 실제 행정경계(lib/incheon-geo.ts) 위에 건수 버블을 얹은 인천 2군 9구 지도.
// 구역은 건수별 톤온톤 연한 음영, 버블은 진한 포인트색 — 앱 톤앤매너에 맞춤.

// 버블 위치 미세조정 (중심점이 어색한 좁은 구만)
const ADJ: Partial<Record<District, { dx?: number; dy?: number }>> = {
  jemulpo: { dx: -2, dy: 4 },
  ongjin: { dy: -6 },
  seo: { dy: 6 },
  michuhol: { dx: 8 },
};

// 건수 구간별 색 (구역 연한 음영 / 버블 진한 색) — 같은 색 계열로 톤온톤
function tier(count: number): { fill: string; bubble: string } {
  if (count >= 10) return { fill: "#ffe4e6", bubble: "#f43f5e" }; // rose
  if (count >= 5) return { fill: "#ffedd5", bubble: "#fb923c" }; // orange
  if (count >= 2) return { fill: "#fef3c7", bubble: "#fbbf24" }; // amber
  if (count >= 1) return { fill: "#d1fae5", bubble: "#10b981" }; // emerald
  return { fill: "#eef2f6", bubble: "#94a3b8" }; // 0건: slate
}

const HOVER_FILL = "#dbeafe"; // blue-100
const HOVER_STROKE = "#2563eb"; // blue-600
const BASE_STROKE = "#cbd5e1"; // slate-300

export function RegionMap({
  counts,
  selected,
  onSelect,
}: {
  counts: Record<District, number>;
  selected?: District | null;
  onSelect?: (d: District) => void;
}) {
  const router = useRouter();
  const [hovered, setHovered] = useState<District | null>(null);
  const handle = (d: District) =>
    onSelect ? onSelect(d) : router.push(`/events?district=${d}`);

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg bg-sky-50 ring-1 ring-sky-100"
      style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}
    >
      <svg
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 size-full"
      >
        <defs>
          <filter id="bubbleShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="0"
              dy="1.5"
              stdDeviation="1.6"
              floodColor="#0f172a"
              floodOpacity="0.28"
            />
          </filter>
        </defs>

        <text x={MAP_W - 86} y={MAP_H - 26} fontSize="22" fill="#a8cdea" fontWeight="700">
          서해
        </text>

        {/* 구역 면 */}
        {DISTRICT_SHAPES.map((s) => {
          const count = counts[s.value] ?? 0;
          const on = hovered === s.value || selected === s.value;
          return (
            <path
              key={s.value}
              d={s.d}
              className="cursor-pointer transition-[fill,stroke]"
              fill={on ? HOVER_FILL : tier(count).fill}
              stroke={on ? HOVER_STROKE : BASE_STROKE}
              strokeWidth={on ? 2.5 : 1.1}
              strokeLinejoin="round"
              onMouseEnter={() => setHovered(s.value)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handle(s.value)}
            />
          );
        })}

        {/* 버블 + 라벨 */}
        {DISTRICT_SHAPES.map((s) => {
          const count = counts[s.value] ?? 0;
          const on = hovered === s.value || selected === s.value;
          const cx = s.lx + (ADJ[s.value]?.dx ?? 0);
          const cy = s.ly + (ADJ[s.value]?.dy ?? 0);
          const r = (18 + Math.min(count, 10) * 1.6) * (on ? 1.12 : 1);
          return (
            <g
              key={s.value + "-b"}
              className="cursor-pointer"
              onMouseEnter={() => setHovered(s.value)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handle(s.value)}
            >
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={tier(count).bubble}
                stroke={on ? "#60a5fa" : "#ffffff"}
                strokeWidth={on ? 3.5 : 2.5}
                filter="url(#bubbleShadow)"
              />
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={r * 0.9}
                fontWeight="800"
                fill="#ffffff"
              >
                {count}
              </text>
              <text
                x={cx}
                y={cy + r + 15}
                textAnchor="middle"
                fontSize="16.5"
                fontWeight="700"
                fill="#334155"
                stroke="#ffffff"
                strokeWidth="3.2"
                paintOrder="stroke"
              >
                {DISTRICT_MAP[s.value].label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
