import { DISTRICTS } from "@/lib/constants";
import { regionTier, REGION_TIERS } from "@/lib/region";
import { cn } from "@/lib/utils";
import type { District } from "@/lib/types";

/** 건수 구간 색상 범례 (지도/그래프 패널 공통) */
export function RegionLegend() {
  return (
    <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 border-t pt-3 text-[11px] text-muted-foreground">
      {REGION_TIERS.map((t) => (
        <span key={t.label} className="flex items-center gap-1">
          <span className={cn("size-2 rounded-full", t.fill)} />
          {t.label}
        </span>
      ))}
    </div>
  );
}

export function RegionBars({ counts }: { counts: Record<District, number> }) {
  const rows = DISTRICTS.map((d) => ({
    label: d.label,
    count: counts[d.value] ?? 0,
  })).sort((a, b) => b.count - a.count);
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <ul className="flex h-full flex-col justify-between gap-2">
      {rows.map((r) => (
        <li key={r.label} className="flex items-center gap-2 text-sm">
          <span className="w-16 shrink-0 text-muted-foreground">{r.label}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full", regionTier(r.count).fill)}
              style={{ width: `${(r.count / max) * 100}%` }}
            />
          </div>
          <span className="w-7 shrink-0 text-right tabular-nums">{r.count}</span>
        </li>
      ))}
    </ul>
  );
}
