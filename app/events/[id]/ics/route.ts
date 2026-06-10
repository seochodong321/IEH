import { getEventById } from "@/lib/data/events";
import { eventToICS } from "@/lib/ics";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(eventToICS(event), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="event-${id}.ics"`,
    },
  });
}
