"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, DISTRICTS, STATUSES, labelRecord } from "@/lib/constants";
import { addDays, weekRange } from "@/lib/event-utils";
import { cn } from "@/lib/utils";

interface InitialFilters {
  query?: string;
  category?: string;
  status?: string;
  district?: string;
  from?: string;
  to?: string;
  sort?: string;
  includeEnded?: boolean;
  featured?: boolean;
}

let debounceTimer: ReturnType<typeof setTimeout>;

const categoryItems = { all: "전체 유형", ...labelRecord(CATEGORIES) };
const statusItems = { all: "전체 상태", ...labelRecord(STATUSES) };
const districtItems = { all: "전체 권역", ...labelRecord(DISTRICTS) };
const sortItems = {
  start: "시작일순",
  created: "등록순",
  status: "상태순",
};

export function EventFilters({
  initial,
  today,
}: {
  initial: InitialFilters;
  today: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParams = useCallback(
    (changes: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (!value || value === "all") params.delete(key);
        else params.set(key, value);
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams],
  );

  const setParam = (key: string, value: string) => setParams({ [key]: value });

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => setParam("q", value), 300);
  };

  const week = weekRange(today);
  const weekendStart = addDays(week.start, 5); // 토
  const isTodayActive = initial.from === today && initial.to === today;
  const isWeekActive = initial.from === week.start && initial.to === week.end;
  const isWeekendActive =
    initial.from === weekendStart && initial.to === week.end;
  const isOngoingActive = initial.status === "ongoing";

  const quickChips: {
    label: string;
    active: boolean;
    onClick: () => void;
  }[] = [
    {
      label: "오늘",
      active: isTodayActive,
      onClick: () =>
        setParams({ from: today, to: today, status: undefined }),
    },
    {
      label: "이번 주",
      active: isWeekActive,
      onClick: () =>
        setParams({ from: week.start, to: week.end, status: undefined }),
    },
    {
      label: "이번 주말",
      active: isWeekendActive,
      onClick: () =>
        setParams({ from: weekendStart, to: week.end, status: undefined }),
    },
    {
      label: "진행 중",
      active: isOngoingActive,
      onClick: () =>
        setParams({ status: "ongoing", from: undefined, to: undefined }),
    },
    {
      label: "주요",
      active: Boolean(initial.featured),
      onClick: () =>
        setParams({ featured: initial.featured ? undefined : "1" }),
    },
  ];

  const hasFilters = Boolean(
    initial.query ||
      initial.category ||
      initial.status ||
      initial.district ||
      initial.from ||
      initial.to ||
      (initial.sort && initial.sort !== "start") ||
      initial.includeEnded ||
      initial.featured,
  );

  return (
    <div className="space-y-2.5">
      {/* 빠른 필터 + 정렬 + 종료포함 */}
      <div className="flex flex-wrap items-center gap-2">
        {quickChips.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={c.onClick}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              c.active
                ? "border-blue-600 bg-blue-600 text-white"
                : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {c.label}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <label className="flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={Boolean(initial.includeEnded)}
              onChange={(e) =>
                setParams({ ended: e.target.checked ? "1" : undefined })
              }
              className="size-3.5 accent-blue-600"
            />
            종료 행사 포함
          </label>
          <Select
            items={sortItems}
            value={initial.sort ?? "start"}
            onValueChange={(v) => setParam("sort", String(v))}
          >
            <SelectTrigger className="h-8 w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(sortItems).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 상세 필터 */}
      <div className="flex flex-wrap items-center gap-2">
        <Select
          items={categoryItems}
          value={initial.category ?? "all"}
          onValueChange={(v) => setParam("category", String(v))}
        >
          <SelectTrigger className="h-9 w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 유형</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={districtItems}
          value={initial.district ?? "all"}
          onValueChange={(v) => setParam("district", String(v))}
        >
          <SelectTrigger className="h-9 w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 권역</SelectItem>
            {DISTRICTS.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={statusItems}
          value={initial.status ?? "all"}
          onValueChange={(v) => setParam("status", String(v))}
        >
          <SelectTrigger className="h-9 w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 상태</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1.5">
          <Input
            type="date"
            aria-label="시작 기간"
            defaultValue={initial.from ?? ""}
            key={`from-${initial.from ?? ""}`}
            onChange={(e) => setParam("from", e.target.value)}
            className="h-9 w-[150px]"
          />
          <span className="text-muted-foreground">~</span>
          <Input
            type="date"
            aria-label="종료 기간"
            defaultValue={initial.to ?? ""}
            key={`to-${initial.to ?? ""}`}
            onChange={(e) => setParam("to", e.target.value)}
            className="h-9 w-[150px]"
          />
        </div>

        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            defaultValue={initial.query ?? ""}
            onChange={onSearchChange}
            placeholder="행사명 · 장소 · 주최 · 주관 검색"
            className="h-9 pl-8"
          />
        </div>

        {hasFilters ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-9"
            onClick={() => router.push(pathname)}
          >
            <X className="size-4" />
            초기화
          </Button>
        ) : null}
      </div>
    </div>
  );
}
