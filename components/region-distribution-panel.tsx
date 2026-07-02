"use client";

import { useMemo, useState } from "react";
import { BarChart3, Map as MapIcon } from "lucide-react";
import { RegionBars, RegionLegend } from "@/components/region-bars";
import { RegionMap } from "@/components/region-map";
import { districtCounts } from "@/lib/region";
import { cn } from "@/lib/utils";
import type { EventSummary } from "@/lib/types";

type View = "map" | "bar";

export function RegionDistributionPanel({ events }: { events: EventSummary[] }) {
  const [view, setView] = useState<View>("map");
  const counts = useMemo(() => districtCounts(events), [events]);

  const toggleBtn = (value: View, label: string, Icon: typeof MapIcon) => (
    <button
      type="button"
      onClick={() => setView(value)}
      aria-pressed={view === value}
      className={cn(
        "flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors",
        view === value
          ? "bg-background font-medium text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );

  return (
    <section className="flex flex-col rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-semibold">지역별 행사 분포</h2>
        <div className="flex rounded-lg bg-muted p-0.5">
          {toggleBtn("map", "지도", MapIcon)}
          {toggleBtn("bar", "그래프", BarChart3)}
        </div>
      </div>

      <div className="flex-1">
        {view === "map" ? (
          <div className="flex h-full items-center justify-center">
            <RegionMap counts={counts} />
          </div>
        ) : (
          <RegionBars counts={counts} />
        )}
      </div>

      <RegionLegend />
    </section>
  );
}
