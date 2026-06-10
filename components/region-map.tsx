"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DISTRICTS } from "@/lib/constants";
import { regionTier } from "@/lib/region";
import { cn } from "@/lib/utils";
import type { District } from "@/lib/types";

// 인천 2군 9구의 대략적 지리 위치 (0~100 좌표, x=서→동, y=북→남).
const POS: Record<District, { x: number; y: number }> = {
  ganghwa: { x: 16, y: 11 },
  geomdan: { x: 43, y: 19 },
  gyeyang: { x: 68, y: 22 },
  seo: { x: 39, y: 38 },
  bupyeong: { x: 72, y: 42 },
  yeongjong: { x: 14, y: 49 },
  jemulpo: { x: 36, y: 57 },
  michuhol: { x: 55, y: 56 },
  namdong: { x: 72, y: 64 },
  yeonsu: { x: 49, y: 74 },
  ongjin: { x: 24, y: 84 },
};

const CELLS: { value: District; points: string }[] = [
  { value: "geomdan", points: "31,13 54,12 56,20 50,27 33,26 29,18" },
  { value: "gyeyang", points: "58,15 80,17 82,26 74,30 59,28 56,20" },
  { value: "seo", points: "28,29 50,29 52,40 47,47 30,47 26,38" },
  { value: "bupyeong", points: "61,31 83,32 84,46 80,53 63,52 60,40" },
  { value: "jemulpo", points: "27,49 46,49 47,60 40,67 29,64 25,55" },
  { value: "michuhol", points: "49,48 60,49 61,60 54,64 49,62" },
  { value: "namdong", points: "62,55 83,55 84,68 76,74 63,72 60,62" },
  { value: "yeonsu", points: "38,66 60,66 61,76 52,82 42,80 37,72" },
  { value: "ganghwa", points: "10,6 22,5 26,11 22,18 12,19 7,12" },
  { value: "yeongjong", points: "6,42 20,41 25,48 21,57 10,58 4,50" },
];

const ONGJIN_ISLES = [
  { cx: 22, cy: 83, r: 2.6 },
  { cx: 29, cy: 88, r: 2 },
  { cx: 26, cy: 79, r: 1.8 },
  { cx: 18, cy: 89, r: 1.6 },
];

function tierCellFill(count: number): string {
  if (count >= 10) return "#ffe4e6";
  if (count >= 5) return "#ffedd5";
  if (count >= 2) return "#fef3c7";
  return "#f1f5f9";
}

const HOVER_FILL = "#dbeafe";
const HOVER_STROKE = "#3b82f6";
const BASE_STROKE = "#cbd5e1";

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
  // onSelect가 있으면 선택 동작, 없으면 목록으로 이동(대시보드)
  const handle = (d: District) =>
    onSelect ? onSelect(d) : router.push(`/events?district=${d}`);

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg bg-white ring-1 ring-slate-100"
      style={{ aspectRatio: "1 / 1" }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 size-full"
      >
        {CELLS.map((c) => {
          const on = hovered === c.value || selected === c.value;
          return (
            <polygon
              key={c.value}
              points={c.points}
              className="cursor-pointer transition-colors"
              fill={on ? HOVER_FILL : tierCellFill(counts[c.value] ?? 0)}
              stroke={on ? HOVER_STROKE : BASE_STROKE}
              strokeWidth={on ? 1 : 0.6}
              strokeLinejoin="round"
              onMouseEnter={() => setHovered(c.value)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handle(c.value)}
            />
          );
        })}
        {ONGJIN_ISLES.map((i, idx) => {
          const on = hovered === "ongjin" || selected === "ongjin";
          return (
            <circle
              key={idx}
              cx={i.cx}
              cy={i.cy}
              r={i.r}
              className="cursor-pointer transition-colors"
              fill={on ? HOVER_FILL : tierCellFill(counts.ongjin ?? 0)}
              stroke={on ? HOVER_STROKE : BASE_STROKE}
              strokeWidth={on ? 0.9 : 0.5}
              onMouseEnter={() => setHovered("ongjin")}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handle("ongjin")}
            />
          );
        })}
      </svg>

      {DISTRICTS.map((d) => {
        const count = counts[d.value] ?? 0;
        const pos = POS[d.value];
        const size = 22 + Math.min(count, 10) * 2.2;
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
                "flex items-center justify-center rounded-full font-bold text-white shadow-sm ring-2 transition-transform",
                on ? "scale-110 ring-blue-400" : "ring-white",
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
                "mt-0.5 rounded bg-white/80 px-1 text-[9px] leading-tight font-medium",
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
