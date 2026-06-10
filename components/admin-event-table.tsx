import Link from "next/link";
import { Pencil, Star } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryBadge, StatusBadge } from "@/components/event-badges";
import { DeleteEventButton } from "@/components/delete-event-button";
import { buttonVariants } from "@/components/ui/button";
import { DISTRICT_MAP } from "@/lib/constants";
import { formatDateRange } from "@/lib/event-utils";
import { cn } from "@/lib/utils";
import type { EventRecord } from "@/lib/types";

export function AdminEventTable({ events }: { events: EventRecord[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl bg-card p-10 text-center text-sm text-muted-foreground ring-1 ring-foreground/10">
        등록된 행사가 없습니다. “행사 등록”으로 첫 행사를 추가하세요.
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4">행사명</TableHead>
            <TableHead>유형</TableHead>
            <TableHead>기간</TableHead>
            <TableHead>권역</TableHead>
            <TableHead>상태</TableHead>
            <TableHead className="pr-4 text-right">관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((e) => (
            <TableRow key={e.id}>
              <TableCell className="max-w-[260px] truncate pl-4 font-medium">
                <Link
                  href={`/events/${e.id}`}
                  className="inline-flex items-center gap-1.5 hover:underline"
                >
                  {e.isFeatured ? (
                    <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
                  ) : null}
                  <span className="truncate">{e.title}</span>
                </Link>
              </TableCell>
              <TableCell>
                <CategoryBadge value={e.category} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDateRange(e.startDate, e.endDate)}
              </TableCell>
              <TableCell>{DISTRICT_MAP[e.district].label}</TableCell>
              <TableCell>
                <StatusBadge startDate={e.startDate} endDate={e.endDate} />
              </TableCell>
              <TableCell className="pr-4">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/admin/${e.id}/edit`}
                    aria-label="수정"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                      "size-8 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Pencil className="size-4" />
                  </Link>
                  <DeleteEventButton id={e.id} title={e.title} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
