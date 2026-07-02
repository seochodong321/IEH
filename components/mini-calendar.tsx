"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WEEKDAYS_KO } from "@/lib/constants";
import { occursOn } from "@/lib/event-utils";
import { regionTier } from "@/lib/region";
import { cn } from "@/lib/utils";
import type { EventSummary } from "@/lib/types";

export function MiniCalendar({
  events,
  today,
}: {
  events: EventSummary[];
  today: string;
}) {
  const router = useRouter();
  const [y, m] = today.split("-").map(Number);
  const [cursor, setCursor] = useState(() => new Date(y, m - 1, 1));

  const days = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(cursor), { weekStartsOn: 0 });
    const gridEnd = endOfWeek(endOfMonth(cursor), { weekStartsOn: 0 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [cursor]);

  const countByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const day of days) {
      const key = format(day, "yyyy-MM-dd");
      let n = 0;
      for (const e of events) if (occursOn(e, key)) n++;
      if (n > 0) map.set(key, n);
    }
    return map;
  }, [days, events]);

  const currentMonth = cursor.getMonth();
  const monthLabel = `${cursor.getFullYear()}년 ${cursor.getMonth() + 1}월`;

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() =>
              setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
            }
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-[92px] text-center text-sm font-medium">
            {monthLabel}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() =>
              setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
            }
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7"
          onClick={() => setCursor(new Date(y, m - 1, 1))}
        >
          이번 달
        </Button>
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] text-muted-foreground">
        {WEEKDAYS_KO.map((w, i) => (
          <div
            key={w}
            className={cn(
              "py-1",
              i === 0 && "text-red-500",
              i === 6 && "text-blue-500",
            )}
          >
            {w}
          </div>
        ))}
      </div>

      <div className="grid flex-1 auto-rows-fr grid-cols-7 gap-y-1">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const count = countByDay.get(key) ?? 0;
          const inMonth = day.getMonth() === currentMonth;
          const isToday = key === today;
          const dow = day.getDay();

          return (
            <button
              key={key}
              type="button"
              disabled={count === 0}
              onClick={() => router.push(`/events?from=${key}&to=${key}`)}
              className={cn(
                "flex h-full min-h-11 flex-col items-center gap-0.5 rounded-md p-1 text-xs transition-colors",
                count > 0 && "cursor-pointer hover:bg-muted",
                !inMonth && "opacity-40",
              )}
            >
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full",
                  isToday && "bg-primary font-medium text-primary-foreground",
                  !isToday && dow === 0 && inMonth && "text-red-500",
                  !isToday && dow === 6 && inMonth && "text-blue-500",
                )}
              >
                {day.getDate()}
              </span>
              {count > 0 ? (
                // 지역 분포와 같은 색 단계(건수 많을수록 진하게)로 강조
                <span
                  className={cn(
                    "rounded px-1 text-[10px] leading-tight font-medium text-white",
                    regionTier(count).fill,
                  )}
                >
                  {count}건
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
