"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DISTRICT_MAP } from "@/lib/constants";
import { DISTRICT_SHAPES, MAP_H, MAP_W } from "@/lib/incheon-geo";
import type { District } from "@/lib/types";

// 실제 행정경계 기반 인천 2군 9구 지도 (lib/incheon-geo.ts 생성 데이터 사용).
// 건수별 음영 + 라벨, 클릭/호버/선택.

// 라벨 표시 설정: 글자 크기 / 위치 미세조정 (좁은 구는 작게·살짝 이동)
const LABEL: Record<District, { fs: number; dx?: number; dy?: number }> = {
  ganghwa: { fs: 26 },
  ongjin: { fs: 18, dy: -34 },
  yeongjong: { fs: 26 },
  geomdan: { fs: 20 },
  seo: { fs: 20, dy: 8 },
  gyeyang: { fs: 16, dy: -6 },
  bupyeong: { fs: 16 },
  jemulpo: { fs: 12, dx: -26, dy: 18 },
  michuhol: { fs: 13, dx: 12 },
  namdong: { fs: 16, dy: 6 },
  yeonsu: { fs: 18, dy: 10 },
};

function tierFill(count: number): string {
  if (count >= 10) return "#fda4af"; // rose-300
  if (count >= 5) return "#fdba74"; // orange-300
  if (count >= 2) return "#fde047"; // yellow-300
  if (count >= 1) return "#fef9c3"; // yellow-100
  return "#f1f5f9"; // slate-100
}

const HOVER_FILL = "#93c5fd"; // blue-300
const HOVER_STROKE = "#1d4ed8"; // blue-700
const BASE_STROKE = "#64748b"; // slate-500

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
        <text x={MAP_W - 90} y={MAP_H - 30} fontSize="24" fill="#9cc3e0" fontWeight="700">
          서해
        </text>

        {/* 면 (호버 중인 구역은 맨 뒤에 한 번 더 그려 외곽선이 위로 오게) */}
        {DISTRICT_SHAPES.map((s) => {
          const count = counts[s.value] ?? 0;
          const on = hovered === s.value || selected === s.value;
          return (
            <path
              key={s.value}
              d={s.d}
              className="cursor-pointer transition-[fill]"
              fill={on ? HOVER_FILL : tierFill(count)}
              stroke={on ? HOVER_STROKE : BASE_STROKE}
              strokeWidth={on ? 3 : 1.2}
              strokeLinejoin="round"
              onMouseEnter={() => setHovered(s.value)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handle(s.value)}
            />
          );
        })}

        {/* 라벨 */}
        {DISTRICT_SHAPES.map((s) => {
          const count = counts[s.value] ?? 0;
          const cfg = LABEL[s.value];
          const x = s.lx + (cfg.dx ?? 0);
          const y = s.ly + (cfg.dy ?? 0);
          return (
            <g
              key={s.value + "-label"}
              className="pointer-events-none select-none"
            >
              <text
                x={x}
                y={y}
                textAnchor="middle"
                fontSize={cfg.fs}
                fontWeight="700"
                fill="#1e293b"
                stroke="#ffffff"
                strokeWidth="3"
                paintOrder="stroke"
              >
                {DISTRICT_MAP[s.value].label}
              </text>
              <text
                x={x}
                y={y + cfg.fs * 0.95}
                textAnchor="middle"
                fontSize={Math.max(11, cfg.fs * 0.78)}
                fontWeight="600"
                fill="#475569"
                stroke="#ffffff"
                strokeWidth="2.5"
                paintOrder="stroke"
              >
                {count}건
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
