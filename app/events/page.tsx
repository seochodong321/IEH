import { EventFilters } from "@/components/event-filters";
import { EventTable } from "@/components/event-table";
import { getEvents } from "@/lib/data/events";
import { todayKST } from "@/lib/event-utils";
import {
  CATEGORY_MAP,
  DISTRICT_MAP,
  STATUS_MAP,
} from "@/lib/constants";
import type {
  Category,
  District,
  EventFilters as EventFiltersType,
  EventStatus,
} from "@/lib/types";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function EventsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const str = (k: string) => (typeof sp[k] === "string" ? sp[k] : undefined);

  // 알려진 값만 통과시켜 잘못된 쿼리스트링으로 인한 오동작을 막는다.
  const rawCategory = str("category");
  const rawStatus = str("status");
  const rawDistrict = str("district");
  const category =
    rawCategory && rawCategory in CATEGORY_MAP
      ? (rawCategory as Category)
      : undefined;
  const status =
    rawStatus && rawStatus in STATUS_MAP ? (rawStatus as EventStatus) : undefined;
  const district =
    rawDistrict && rawDistrict in DISTRICT_MAP
      ? (rawDistrict as District)
      : undefined;
  const query = str("q");
  const from = str("from");
  const to = str("to");
  const rawSort = str("sort");
  const sort: EventFiltersType["sort"] =
    rawSort === "created" || rawSort === "status" ? rawSort : "start";
  const includeEnded = str("ended") === "1";
  const featured = str("featured") === "1";
  const today = todayKST();

  const events = await getEvents({
    query,
    category,
    status,
    district,
    from,
    to,
    sort,
    includeEnded,
    featured,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold">행사 목록</h1>
        <span className="text-sm text-muted-foreground">
          총 {events.length}건
        </span>
      </div>

      <EventFilters
        today={today}
        initial={{
          query,
          category,
          status,
          district,
          from,
          to,
          sort,
          includeEnded,
          featured,
        }}
      />

      <EventTable events={events} />
    </div>
  );
}
