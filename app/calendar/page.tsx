import { CalendarView } from "@/components/calendar-view";
import { getAllEvents } from "@/lib/data/events";
import { todayKST, toEventSummary } from "@/lib/event-utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "캘린더" };

export default async function CalendarPage() {
  const events = await getAllEvents();
  const today = todayKST();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">캘린더</h1>
      <CalendarView events={events.map(toEventSummary)} today={today} />
    </div>
  );
}
