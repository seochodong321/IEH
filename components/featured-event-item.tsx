import Link from "next/link";
import { CalendarDays, MapPin, Repeat, Star } from "lucide-react";
import { CategoryBadge } from "@/components/event-badges";
import { EventThumb } from "@/components/event-thumb";
import { formatDateRange, recurrenceLabel } from "@/lib/event-utils";
import type { EventRecord } from "@/lib/types";

export function FeaturedEventItem({ event }: { event: EventRecord }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex gap-3 rounded-lg p-2 transition-colors hover:bg-muted/60"
    >
      <EventThumb
        category={event.category}
        imageUrl={event.imageUrl}
        className="size-16 shrink-0 rounded-lg"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <CategoryBadge value={event.category} />
        </div>
        <h4 className="mt-1 truncate font-semibold group-hover:text-primary">
          {event.title}
        </h4>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5 shrink-0" />
          {formatDateRange(event.startDate, event.endDate)}
        </p>
        {recurrenceLabel(event) ? (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Repeat className="size-3.5 shrink-0" />
            {recurrenceLabel(event)}
          </p>
        ) : (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{event.venue}</span>
          </p>
        )}
      </div>
      <Star className="size-4 shrink-0 fill-amber-400 text-amber-400" />
    </Link>
  );
}
