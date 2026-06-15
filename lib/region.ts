import { DISTRICTS } from "@/lib/constants";
import type { District, EventRecord } from "@/lib/types";

/** 권역별 행사 건수 (모든 권역을 0으로 초기화해 반환) */
export function districtCounts(
  events: Pick<EventRecord, "district">[],
): Record<District, number> {
  const counts = {} as Record<District, number>;
  for (const d of DISTRICTS) counts[d.value] = 0;
  for (const e of events) counts[e.district] = (counts[e.district] ?? 0) + 1;
  return counts;
}

/**
 * 건수 구간별 색상 단계 — 앱 톤(블루→인디고→바이올렛).
 * 지도 버블(hex)·그래프 막대(fill)·범례(label)가 모두 이 표 하나를 쓴다.
 */
export const REGION_TIERS = [
  { min: 10, fill: "bg-violet-600", hex: "#7c3aed", label: "10건 이상" },
  { min: 5, fill: "bg-indigo-600", hex: "#4f46e5", label: "5~9건" },
  { min: 2, fill: "bg-blue-500", hex: "#3b82f6", label: "2~4건" },
  { min: 0, fill: "bg-sky-400", hex: "#38bdf8", label: "1건 이하" },
] as const;

export function regionTier(count: number) {
  return REGION_TIERS.find((t) => count >= t.min) ?? REGION_TIERS[3];
}
