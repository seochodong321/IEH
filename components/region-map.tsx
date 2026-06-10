"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DISTRICT_MAP } from "@/lib/constants";
import type { District } from "@/lib/types";

// 인천 2군 9구 약식 지도. 공식 행정구역도를 참고해 손으로 근사 트레이스한 폴리곤.
// viewBox 0 0 760 880 (참고 이미지 비율). 정밀 GIS 아님 — 좌표는 미세조정 가능.

interface Shape {
  value: District;
  points: string;
  lx: number; // 라벨 중심 x
  ly: number; // 라벨 중심 y
  fs: number; // 라벨 글자 크기
}

const SHAPES: Shape[] = [
  {
    value: "ganghwa",
    points:
      "175,60 350,40 435,70 420,230 405,355 300,388 205,360 188,300 218,275 135,235 165,150 190,95",
    lx: 285,
    ly: 205,
    fs: 22,
  },
  {
    value: "yeongjong",
    points:
      "190,500 320,488 440,505 466,560 430,635 330,660 250,690 196,756 178,700 196,640 180,580",
    lx: 292,
    ly: 575,
    fs: 22,
  },
  {
    value: "geomdan",
    points: "425,258 500,248 575,260 608,300 575,375 490,388 435,360 425,300",
    lx: 508,
    ly: 320,
    fs: 20,
  },
  {
    value: "seo",
    points: "435,400 565,398 600,430 580,520 520,540 465,525 432,475 418,438",
    lx: 516,
    ly: 462,
    fs: 20,
  },
  {
    value: "gyeyang",
    points: "602,368 670,360 715,388 705,455 650,468 600,448",
    lx: 657,
    ly: 412,
    fs: 16,
  },
  {
    value: "bupyeong",
    points: "598,476 660,472 705,490 698,548 640,565 595,535",
    lx: 648,
    ly: 520,
    fs: 16,
  },
  {
    value: "jemulpo",
    points: "442,560 500,556 512,592 482,620 446,606 432,582",
    lx: 470,
    ly: 590,
    fs: 13,
  },
  {
    value: "michuhol",
    points: "512,588 580,582 600,615 580,660 525,662 502,622",
    lx: 548,
    ly: 626,
    fs: 14,
  },
  {
    value: "namdong",
    points: "602,558 690,560 712,610 700,665 650,705 602,668 596,608",
    lx: 652,
    ly: 632,
    fs: 16,
  },
  {
    value: "yeonsu",
    points:
      "452,628 560,638 605,672 608,735 572,800 505,832 458,800 442,725 448,668",
    lx: 534,
    ly: 722,
    fs: 20,
  },
  {
    value: "ongjin",
    points: "55,432 100,424 122,452 100,480 60,472 45,452",
    lx: 110,
    ly: 410,
    fs: 18,
  },
];

// 옹진군 부속 섬 (장식 — 클릭은 위 main 폴리곤/라벨)
const ONGJIN_DOTS = [
  { cx: 138, cy: 462, r: 10 },
  { cx: 158, cy: 500, r: 8 },
  { cx: 46, cy: 498, r: 8 },
  { cx: 112, cy: 510, r: 6 },
];

function tierFill(count: number): string {
  if (count >= 10) return "#fecdd3"; // rose-200
  if (count >= 5) return "#fed7aa"; // orange-200
  if (count >= 2) return "#fde68a"; // amber-200
  return "#e2e8f0"; // slate-200
}

const HOVER_FILL = "#bfdbfe"; // blue-200
const HOVER_STROKE = "#2563eb"; // blue-600
const BASE_STROKE = "#94a3b8"; // slate-400

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
      style={{ aspectRatio: "760 / 880" }}
    >
      <svg
        viewBox="0 0 760 880"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 size-full"
      >
        <text x="690" y="845" fontSize="26" fill="#9cc3e0" fontWeight="700">
          서해
        </text>

        {ONGJIN_DOTS.map((d, i) => (
          <circle
            key={i}
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            fill={tierFill(counts.ongjin ?? 0)}
            stroke={BASE_STROKE}
            strokeWidth="1.5"
          />
        ))}

        {SHAPES.map((s) => {
          const count = counts[s.value] ?? 0;
          const on = hovered === s.value || selected === s.value;
          return (
            <g
              key={s.value}
              className="cursor-pointer"
              onMouseEnter={() => setHovered(s.value)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handle(s.value)}
            >
              <polygon
                points={s.points}
                className="transition-colors"
                fill={on ? HOVER_FILL : tierFill(count)}
                stroke={on ? HOVER_STROKE : BASE_STROKE}
                strokeWidth={on ? 3 : 1.5}
                strokeLinejoin="round"
              />
              <text
                x={s.lx}
                y={s.ly}
                textAnchor="middle"
                fontSize={s.fs}
                fontWeight="700"
                fill="#1e293b"
                className="pointer-events-none select-none"
              >
                {DISTRICT_MAP[s.value].label}
              </text>
              <text
                x={s.lx}
                y={s.ly + s.fs + 3}
                textAnchor="middle"
                fontSize={s.fs * 0.82}
                fontWeight="600"
                fill="#64748b"
                className="pointer-events-none select-none"
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
