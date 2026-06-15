import Link from "next/link";
import {
  Activity,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  Heart,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { RegionBars } from "@/components/region-bars";
import { Panel } from "@/components/panel";
import { CategoryBadge } from "@/components/event-badges";
import { getAllEvents } from "@/lib/data/events";
import { computeStatus, todayKST } from "@/lib/event-utils";
import { districtCounts } from "@/lib/region";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "통계 현황" };

export default async function StatsPage() {
  const today = todayKST();
  const year = Number(today.slice(0, 4));
  const curMonth = Number(today.slice(5, 7));
  const events = await getAllEvents();

  let ongoing = 0;
  let upcoming = 0;
  let ended = 0;
  for (const e of events) {
    const s = computeStatus(e.startDate, e.endDate, today);
    if (s === "ongoing") ongoing++;
    else if (s === "upcoming") upcoming++;
    else ended++;
  }

  const catCounts = CATEGORIES.map((c) => ({
    ...c,
    count: events.filter((e) => e.category === c.value).length,
  })).sort((a, b) => b.count - a.count);
  const catMax = Math.max(1, ...catCounts.map((c) => c.count));

  const months = Array.from({ length: 12 }, (_, i) => ({
    m: i + 1,
    count: events.filter(
      (e) =>
        Number(e.startDate.slice(0, 4)) === year &&
        Number(e.startDate.slice(5, 7)) === i + 1,
    ).length,
  }));
  const monthMax = Math.max(1, ...months.map((m) => m.count));

  const topLiked = [...events]
    .filter((e) => e.likes > 0)
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 5);

  const districts = districtCounts(events);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">통계 현황</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          등록된 행사 {events.length}건 기준 · {year}년
        </p>
      </div>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="전체 행사"
          value={events.length}
          icon={CalendarDays}
          accentClass="bg-slate-100 text-slate-700"
        />
        <StatCard
          label="진행 중"
          value={ongoing}
          icon={Activity}
          accentClass="bg-emerald-100 text-emerald-700"
        />
        <StatCard
          label="예정"
          value={upcoming}
          icon={CalendarClock}
          accentClass="bg-blue-100 text-blue-700"
        />
        <StatCard
          label="종료"
          value={ended}
          icon={CalendarCheck}
          accentClass="bg-neutral-100 text-neutral-600"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Panel title="행사유형별">
          <ul className="space-y-2">
            {catCounts.map((c) => (
              <li key={c.value} className="flex items-center gap-2 text-sm">
                <span className="w-14 shrink-0">
                  <CategoryBadge value={c.value} />
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", c.dotClass)}
                    style={{ width: `${(c.count / catMax) * 100}%` }}
                  />
                </div>
                <span className="w-7 shrink-0 text-right tabular-nums">
                  {c.count}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="권역별">
          <RegionBars counts={districts} />
        </Panel>
      </section>

      <Panel title={`월별 행사 (${year}년 · 시작월 기준)`}>
        <div className="flex h-44 gap-1.5">
          {months.map((m) => {
            const isCur = m.m === curMonth;
            return (
              <div key={m.m} className="flex flex-1 flex-col items-center gap-1">
                <span className="h-3 text-[10px] tabular-nums text-muted-foreground">
                  {m.count > 0 ? m.count : ""}
                </span>
                {/* 빈 달도 트랙이 보이도록 — 막대 없음 = 0건임을 명확히 */}
                <div className="flex w-full flex-1 items-end rounded-t bg-muted/50">
                  <div
                    className={cn(
                      "w-full rounded-t",
                      isCur ? "bg-blue-600" : "bg-blue-400/80",
                    )}
                    style={{ height: `${(m.count / monthMax) * 100}%` }}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px]",
                    isCur
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {m.m}월
                </span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          막대가 비어 있는 달은 해당 월에 <b>시작하는</b> 행사가 없다는
          뜻입니다. (여러 달에 걸친 행사는 시작월에만 집계)
        </p>
      </Panel>

      <Panel title="인기 행사 (좋아요순)">
        {topLiked.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            아직 좋아요가 없습니다.
          </p>
        ) : (
          <ol className="divide-y">
            {topLiked.map((e, i) => (
              <li key={e.id}>
                <Link
                  href={`/events/${e.id}`}
                  className="flex items-center gap-3 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <span className="w-5 text-center text-sm font-semibold text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {e.title}
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-sm text-rose-600">
                    <Heart className="size-4 fill-rose-500 text-rose-500" />
                    {e.likes}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </Panel>
    </div>
  );
}
