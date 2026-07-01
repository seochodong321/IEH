import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  RefreshCw,
  Star,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { FeaturedEventItem } from "@/components/featured-event-item";
import { MiniCalendar } from "@/components/mini-calendar";
import { RegionDistributionPanel } from "@/components/region-distribution-panel";
import { EventTable } from "@/components/event-table";
import { DashboardPosts } from "@/components/dashboard-posts";
import { Panel } from "@/components/panel";
import { getAllEvents } from "@/lib/data/events";
import { getPosts } from "@/lib/data/posts";
import {
  compareByStatus,
  computeStatus,
  getStats,
  monthRange,
  todayKST,
  toEventSummary,
  weekRange,
} from "@/lib/event-utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const today = todayKST();
  const [events, posts] = await Promise.all([getAllEvents(), getPosts(6)]);
  const stats = getStats(events, today);
  const featuredCount = events.filter((e) => e.isFeatured).length;
  const week = weekRange(today);
  const month = monthRange(today);

  // 주요 행사 패널: 종료된 축제는 빼고 진행 중·예정만 가까운 순서로 노출
  // (종료되면 자동으로 밀려나고 다음 주요 축제가 올라온다)
  const featured = events
    .filter(
      (e) =>
        e.isFeatured && computeStatus(e.startDate, e.endDate, today) !== "ended",
    )
    .sort((a, b) => compareByStatus(a, b, today))
    .slice(0, 5);

  const recent = [...events]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  // 캘린더·지역분포 패널엔 경량 모델만 넘긴다 (RSC 페이로드 절감)
  const summaries = events.map(toEventSummary);

  const latestUpdate = events.reduce(
    (max, e) => (e.updatedAt > max ? e.updatedAt : max),
    events[0]?.updatedAt ?? new Date().toISOString(),
  );
  const lastUpdated = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(latestUpdate));

  return (
    <div className="space-y-6">
      {/* 히어로 헤더 */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            인천의 모든 행사·축제를 한눈에!
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            인천에서 열리는 행사·축제·공연을 한 곳에서 확인하세요.
          </p>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <RefreshCw className="size-3.5" />
          최종 업데이트: {lastUpdated}
        </p>
      </div>

      {/* 통계 카드 */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="오늘 행사"
          value={stats.today}
          sub="오늘 진행"
          icon={CalendarDays}
          accentClass="bg-blue-100 text-blue-700"
          href={`/events?from=${today}&to=${today}`}
        />
        <StatCard
          label="이번 주 행사"
          value={stats.week}
          sub="이번 주 전체"
          icon={CalendarRange}
          accentClass="bg-violet-100 text-violet-700"
          href={`/events?from=${week.start}&to=${week.end}`}
        />
        <StatCard
          label="이번 달 행사"
          value={stats.month}
          sub="이번 달 전체"
          icon={CalendarCheck}
          accentClass="bg-amber-100 text-amber-700"
          href={`/events?from=${month.start}&to=${month.end}`}
        />
        <StatCard
          label="주요 행사"
          value={featuredCount}
          sub="전체 행사 중"
          icon={Star}
          accentClass="bg-rose-100 text-rose-700"
          href="/events?featured=1"
        />
        <StatCard
          label="진행 중 행사"
          value={stats.ongoing}
          sub="현재 진행중"
          icon={Activity}
          accentClass="bg-emerald-100 text-emerald-700"
          href="/events?status=ongoing"
        />
      </section>

      {/* 3단 패널 */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Panel
          title="주요 행사"
          action={
            <Link
              href="/events"
              className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground"
            >
              더보기 <ArrowRight className="size-3.5" />
            </Link>
          }
          bodyClassName="space-y-1"
        >
          {featured.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              주요 행사가 없습니다.
            </p>
          ) : (
            featured.map((event) => (
              <FeaturedEventItem key={event.id} event={event} />
            ))
          )}
        </Panel>

        <Panel title="행사 일정 캘린더">
          <MiniCalendar events={summaries} today={today} />
        </Panel>

        <RegionDistributionPanel events={summaries} />
      </section>

      <DashboardPosts posts={posts} />

      {/* 하단: 최근 등록 행사 (가장 아래) */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">최근 등록 행사</h2>
          <Link
            href="/events"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            전체 행사 더보기 <ArrowRight className="size-4" />
          </Link>
        </div>
        <EventTable events={recent} />
      </section>
    </div>
  );
}
