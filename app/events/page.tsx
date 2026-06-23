import { EventFilters } from "@/components/event-filters";
import { EventTable } from "@/components/event-table";
import { ExportCsvButton } from "@/components/export-csv-button";
import { getEvents } from "@/lib/data/events";
import { todayKST } from "@/lib/event-utils";
import { eventFiltersFromParams } from "@/lib/events-query";

export const dynamic = "force-dynamic";

export const metadata = { title: "행사 목록" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function EventsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const filters = eventFiltersFromParams(sp);
  const today = todayKST();
  const events = await getEvents(filters);

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold">행사 목록</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">총 {events.length}건</span>
          <ExportCsvButton />
        </div>
      </div>

      <EventFilters today={today} initial={filters} />

      <EventTable events={events} />
    </div>
  );
}
