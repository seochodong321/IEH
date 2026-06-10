"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DISTRICTS } from "@/lib/constants";
import { regionTier } from "@/lib/region";
import { cn } from "@/lib/utils";
import type { District } from "@/lib/types";

// 인천 약식 실루엣 (viewBox 0~100). 바다 위에 강화도·영종도·본토(송도 반도)·옹진 섬.
// 정밀 경계가 아니라 "한눈에 인천"으로 읽히게 한 형태 + 권역 카운트 버블.

// 본토 해안선 (시계방향) — 북부, 동측 돌출(계양·부평), 송도 반도(남측 돌출), 서해안 만입
const MAINLAND =
  "34,13 52,11 64,13 74,18 84,28 86,42 82,54 76,66 66,73 56,80 50,87 43,82 40,73 33,67 29,59 27,50 31,42 26,34 29,25 31,18";

const GANGHWA = "6,5 18,3 26,8 27,15 20,20 10,18 5,11"; // 강화도 (북서 큰 섬)
const YEONGJONG = "3,38 14,35 21,41 22,50 16,56 6,53 2,45"; // 영종도 (서측 섬, 공항)

const ONGJIN_ISLES = [
  { cx: 14, cy: 70, r: 2.2 },
  { cx: 9, cy: 77, r: 1.6 },
  { cx: 18, cy: 82, r: 2 },
  { cx: 24, cy: 87, r: 1.4 },
  { cx: 10, cy: 85, r: 1.3 },
];

// 버블 위치 (본토/섬 위에)
const POS: Record<District, { x: number; y: number }> = {
  ganghwa: { x: 15, y: 11 }, // 강화군
  yeongjong: { x: 12, y: 46 }, // 영종구
  seo: { x: 33, y: 33 }, // 서해구
  geomdan: { x: 47, y: 18 }, // 검단구
  gyeyang: { x: 70, y: 24 }, // 계양구
  bupyeong: { x: 76, y: 46 }, // 부평구
  jemulpo: { x: 37, y: 58 }, // 제물포구
  michuhol: { x: 54, y: 55 }, // 미추홀구
  namdong: { x: 72, y: 62 }, // 남동구
  yeonsu: { x: 50, y: 77 }, // 연수구(송도)
  ongjin: { x: 16, y: 79 }, // 옹진군
};

const LAND = "#dcefe1";
const COAST = "#8fc4ab";

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
      style={{ aspectRatio: "1 / 1" }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 size-full"
      >
        {/* 바다 잔물결 느낌의 옅은 라인 (장식) */}
        <text
          x="78"
          y="92"
          fontSize="4"
          fill="#9cc3e0"
          fontWeight="600"
        >
          서해
        </text>

        {/* 육지 */}
        <polygon
          points={MAINLAND}
          fill={LAND}
          stroke={COAST}
          strokeWidth="0.9"
          strokeLinejoin="round"
        />
        <polygon
          points={GANGHWA}
          fill={LAND}
          stroke={COAST}
          strokeWidth="0.9"
          strokeLinejoin="round"
        />
        <polygon
          points={YEONGJONG}
          fill={LAND}
          stroke={COAST}
          strokeWidth="0.9"
          strokeLinejoin="round"
        />
        {ONGJIN_ISLES.map((i, idx) => (
          <circle
            key={idx}
            cx={i.cx}
            cy={i.cy}
            r={i.r}
            fill={LAND}
            stroke={COAST}
            strokeWidth="0.6"
          />
        ))}
      </svg>

      {/* 권역 카운트 버블 (클릭/호버) */}
      {DISTRICTS.map((d) => {
        const count = counts[d.value] ?? 0;
        const pos = POS[d.value];
        const size = 20 + Math.min(count, 12) * 2;
        const on = hovered === d.value || selected === d.value;
        return (
          <button
            key={d.value}
            type="button"
            onClick={() => handle(d.value)}
            onMouseEnter={() => setHovered(d.value)}
            onMouseLeave={() => setHovered(null)}
            title={`${d.label} ${count}건`}
            aria-label={`${d.label} ${count}건`}
            className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <span
              className={cn(
                "flex items-center justify-center rounded-full font-bold text-white shadow ring-2 transition-transform",
                on ? "scale-110 ring-blue-400" : "ring-white/90",
                regionTier(count).fill,
              )}
              style={{
                width: size,
                height: size,
                fontSize: Math.round(size * 0.42),
              }}
            >
              {count}
            </span>
            <span
              className={cn(
                "mt-0.5 rounded bg-white/85 px-1 text-[9px] leading-tight font-medium",
                on ? "text-foreground" : "text-slate-600",
              )}
            >
              {d.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
