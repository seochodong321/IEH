import { DISTRICTS } from "@/lib/constants";
import type { District, EventRecord } from "@/lib/types";

/** 권역별 행사 건수 (모든 권역을 0으로 초기화해 반환) */
export function districtCounts(events: EventRecord[]): Record<District, number> {
  const counts = {} as Record<District, number>;
  for (const d of DISTRICTS) counts[d.value] = 0;
  for (const e of events) counts[e.district] = (counts[e.district] ?? 0) + 1;
  return counts;
}

/** 건수 구간별 색상 (지도 버블 / 그래프 막대 공통) */
export function regionTier(count: number): { fill: string } {
  if (count >= 10) return { fill: "bg-rose-500" };
  if (count >= 5) return { fill: "bg-orange-400" };
  if (count >= 2) return { fill: "bg-amber-400" };
  return { fill: "bg-emerald-500" };
}

export const REGION_LEGEND = [
  { label: "10건 이상", fill: "bg-rose-500" },
  { label: "5~9건", fill: "bg-orange-400" },
  { label: "2~4건", fill: "bg-amber-400" },
  { label: "1건 이하", fill: "bg-emerald-500" },
];
