"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Repeat } from "lucide-react";
import { RegionMap } from "@/components/region-map";
import { RegionLegend } from "@/components/region-bars";
import { CategoryBadge, StatusBadge } from "@/components/event-badges";
import { districtCounts } from "@/lib/region";
import { DISTRICT_MAP } from "@/lib/constants";
import { formatDateRange, recurrenceLabel } from "@/lib/event-utils";
import type { District, EventSummary } from "@/lib/types";

export function MapExplorer({ events }: { events: EventSummary[] }) {
  const counts = useMemo(() => districtCounts(events), [events]);
  const [selected, setSelected] = useState<District | null>(null);

  const selectedEvents = useMemo(
    () =>
      selected
        ? events
            .filter((e) => e.district === selected)
            .sort((a, b) => a.startDate.localeCompare(b.startDate))
        : [],
    [events, selected],
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* 지도 */}
      <div className="flex flex-col rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <RegionMap
          counts={counts}
          selected={selected}
          onSelect={(d) => setSelected((s) => (s === d ? null : d))}
        />
        <RegionLegend />
      </div>

      {/* 선택 권역 행사 */}
      <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        {selected ? (
          <>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="font-semibold">
                {DISTRICT_MAP[selected].label}{" "}
                <span className="text-muted-foreground">
                  · {selectedEvents.length}건
                </span>
              </h2>
              <Link
                href={`/events?district=${selected}`}
                className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground"
              >
                목록에서 보기 <ArrowRight className="size-3.5" />
              </Link>
            </div>
            {selectedEvents.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                등록된 행사가 없습니다.
              </p>
            ) : (
              <ul className="divide-y">
                {selectedEvents.map((e) => (
                  <li key={e.id}>
                    <Link
                      href={`/events/${e.id}`}
                      className="flex items-center gap-3 py-2.5 transition-colors hover:bg-muted/50"
                    >
                      <StatusBadge
                        startDate={e.startDate}
                        endDate={e.endDate}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">
                          {e.title}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          {recurrenceLabel(e) ? (
                            <>
                              <Repeat className="size-3" />
                              {recurrenceLabel(e)}
                            </>
                          ) : (
                            formatDateRange(e.startDate, e.endDate)
                          )}
                        </span>
                      </span>
                      <CategoryBadge value={e.category} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 text-center">
            <MapPin className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              지도에서 권역을 선택하면
              <br />
              해당 권역의 행사가 여기에 표시됩니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
