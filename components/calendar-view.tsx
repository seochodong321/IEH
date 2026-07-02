"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
import { CategoryBadge, StatusBadge } from "@/components/event-badges";
import { CATEGORY_MAP, WEEKDAYS_KO, districtLabel } from "@/lib/constants";
import { occursOn } from "@/lib/event-utils";
import { cn } from "@/lib/utils";
import type { EventSummary } from "@/lib/types";

// 월요일 시작 그리드에 맞춰 회전 (일요일을 맨 뒤로)
const WEEKDAYS = [...WEEKDAYS_KO.slice(1), WEEKDAYS_KO[0]];

export function CalendarView({
  events,
  today,
}: {
  events: EventSummary[];
  today: string;
}) {
  const [y, m] = today.split("-").map(Number);
  // cursor: 표시 중인 달의 1일
  const [cursor, setCursor] = useState(() => new Date(y, m - 1, 1));
  const [selected, setSelected] = useState<string>(today);

  const days = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const gridEnd = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [cursor]);

  // 하루 칸 안에서는 기간이 짧은 행사부터 — 장기(상설) 행사가 매일
  // 상단을 차지해 그날의 단기 행사를 가리지 않도록 한다.
  const sorted = useMemo(() => {
    const span = (e: EventSummary) =>
      new Date(e.endDate).getTime() - new Date(e.startDate).getTime();
    return [...events].sort(
      (a, b) =>
        span(a) - span(b) ||
        a.startDate.localeCompare(b.startDate) ||
        a.title.localeCompare(b.title),
    );
  }, [events]);

  // 각 날짜(YYYY-MM-DD)에 걸치는 행사 목록
  const byDay = useMemo(() => {
    const map = new Map<string, EventSummary[]>();
    for (const day of days) {
      const key = format(day, "yyyy-MM-dd");
      map.set(
        key,
        sorted.filter((e) => occursOn(e, key)),
      );
    }
    return map;
  }, [days, sorted]);

  const monthLabel = `${cursor.getFullYear()}년 ${cursor.getMonth() + 1}월`;
  const currentMonth = cursor.getMonth();

  const goPrev = () =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  const goNext = () =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  const goToday = () => {
    setCursor(new Date(y, m - 1, 1));
    setSelected(today);
  };

  const selectedEvents =
    byDay.get(selected) ?? sorted.filter((e) => occursOn(e, selected));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="size-8" onClick={goPrev}>
            <ChevronLeft className="size-4" />
          </Button>
          <h2 className="min-w-[120px] text-center text-lg font-semibold">
            {monthLabel}
          </h2>
          <Button variant="outline" size="icon" className="size-8" onClick={goNext}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={goToday}>
          오늘
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <div className="grid grid-cols-7 border-b text-center text-xs font-medium">
          {WEEKDAYS.map((w, i) => (
            <div
              key={w}
              className={cn(
                "py-2",
                i === 5 && "text-blue-600",
                i === 6 && "text-red-600",
              )}
            >
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayEvents = byDay.get(key) ?? [];
            const inMonth = day.getMonth() === currentMonth;
            const dow = day.getDay(); // 0=일 6=토
            const isToday = key === today;
            const isSelected = key === selected;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(key)}
                className={cn(
                  "flex min-h-[92px] flex-col gap-1 border-b border-r p-1.5 text-left transition-colors last:border-r-0 hover:bg-muted/50 [&:nth-child(7n)]:border-r-0",
                  !inMonth && "bg-muted/20 text-muted-foreground",
                  isSelected && "bg-primary/5 ring-1 ring-inset ring-primary/40",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                    dow === 0 && inMonth && "text-red-600",
                    dow === 6 && inMonth && "text-blue-600",
                    isToday && "bg-primary text-primary-foreground",
                  )}
                >
                  {day.getDate()}
                </span>
                <div className={cn("space-y-0.5", !inMonth && "opacity-45")}>
                  {dayEvents.slice(0, 3).map((e) => (
                    <div
                      key={e.id}
                      className={cn(
                        "flex items-center gap-1 truncate rounded px-1 py-0.5 text-[11px] leading-tight",
                        CATEGORY_MAP[e.category].badgeClass,
                      )}
                    >
                      <span className="truncate">{e.title}</span>
                    </div>
                  ))}
                  {dayEvents.length > 3 ? (
                    <div className="px-1 text-[11px] text-muted-foreground">
                      +{dayEvents.length - 3}건
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
          {format(new Date(`${selected}T00:00:00`), "yyyy.MM.dd")} (
          {WEEKDAYS[(new Date(`${selected}T00:00:00`).getDay() + 6) % 7]}) 행사 ·{" "}
          {selectedEvents.length}건
        </h3>
        {selectedEvents.length === 0 ? (
          <div className="rounded-xl bg-card p-6 text-center text-sm text-muted-foreground ring-1 ring-foreground/10">
            해당 날짜에 행사가 없습니다.
          </div>
        ) : (
          <div className="divide-y rounded-xl bg-card ring-1 ring-foreground/10">
            {selectedEvents.map((e) => (
              <Link
                key={e.id}
                href={`/events/${e.id}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
              >
                <StatusBadge startDate={e.startDate} endDate={e.endDate} />
                <span className="min-w-0 flex-1 truncate font-medium">
                  {e.title}
                </span>
                <CategoryBadge value={e.category} />
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  {districtLabel(e.district)} · {e.venue}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
