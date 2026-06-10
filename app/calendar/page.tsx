import { CalendarView } from "@/components/calendar-view";
import { getAllEvents } from "@/lib/data/events";
import { todayKST } from "@/lib/event-utils";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const events = await getAllEvents();
  const today = todayKST();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">캘린더</h1>
      <CalendarView events={events} today={today} />
    </div>
  );
}
