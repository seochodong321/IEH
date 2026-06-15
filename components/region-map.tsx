"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DISTRICT_MAP } from "@/lib/constants";
import { DISTRICT_SHAPES, MAP_H, MAP_W } from "@/lib/incheon-geo";
import { regionTier } from "@/lib/region";
import type { District } from "@/lib/types";

// 모던 버블맵: 행정경계는 차분한 배경(연한 회색 + 얇은 경계),
// 그 위에 건수 버블(앱 톤 블루→바이올렛, 크기=건수)이 떠 있다.

// 버블 위치 미세조정 (중심점이 어색한 좁은 구만)
const ADJ: Partial<Record<District, { dx?: number; dy?: number }>> = {
  jemulpo: { dx: -8, dy: 2 },
  michuhol: { dx: 14, dy: 4 },
  ongjin: { dy: -6 },
  seo: { dy: 6 },
};

// 건수 → 버블 색. 0건만 회색, 나머지는 공용 티어 표를 따른다.
function bubbleColor(count: number): string {
  return count === 0 ? "#cbd5e1" : regionTier(count).hex;
}

const LAND = "#e9eef4"; // 차분한 배경 땅
const LAND_HOVER = "#dbeafe"; // blue-100
const LAND_STROKE = "#cdd6e0"; // slate-200~300
const LAND_STROKE_HOVER = "#60a5fa"; // blue-400

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
      className="relative w-full overflow-hidden rounded-lg bg-slate-50 ring-1 ring-slate-100"
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
              dy="2"
              stdDeviation="2.2"
              floodColor="#1e293b"
              floodOpacity="0.22"
            />
          </filter>
        </defs>

        {/* 배경 땅 (차분) */}
        {DISTRICT_SHAPES.map((s) => {
          const on = hovered === s.value || selected === s.value;
          return (
            <path
              key={s.value}
              d={s.d}
              className="cursor-pointer transition-[fill,stroke]"
              fill={on ? LAND_HOVER : LAND}
              stroke={on ? LAND_STROKE_HOVER : LAND_STROKE}
              strokeWidth={on ? 2 : 1}
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
          const r = (17 + Math.min(count, 12) * 1.7) * (on ? 1.12 : 1);
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
                fill={bubbleColor(count)}
                fillOpacity={count === 0 ? 0.7 : 0.95}
                stroke="#ffffff"
                strokeWidth={on ? 3 : 2}
                filter="url(#bubbleShadow)"
              />
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={r * 0.92}
                fontWeight="800"
                fill="#ffffff"
              >
                {count}
              </text>
              <text
                x={cx}
                y={cy + r + 15}
                textAnchor="middle"
                fontSize="16"
                fontWeight="700"
                fill="#475569"
                stroke="#f8fafc"
                strokeWidth="3"
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
