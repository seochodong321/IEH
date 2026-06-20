"use client";

import { useRouter } from "next/navigation";
import { Repeat, Star } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryBadge, StatusBadge } from "@/components/event-badges";
import { districtLabel } from "@/lib/constants";
import { formatDate, recurrenceLabel } from "@/lib/event-utils";
import type { EventRecord } from "@/lib/types";

export function EventTable({ events }: { events: EventRecord[] }) {
  const router = useRouter();

  if (events.length === 0) {
    return (
      <div className="rounded-xl bg-card p-10 text-center text-sm text-muted-foreground ring-1 ring-foreground/10">
        조건에 맞는 행사가 없습니다.
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
            <TableHead className="hidden sm:table-cell">시작일</TableHead>
            <TableHead className="hidden lg:table-cell">종료일</TableHead>
            <TableHead className="hidden md:table-cell">장소</TableHead>
            <TableHead className="hidden sm:table-cell">권역</TableHead>
            <TableHead className="hidden xl:table-cell">주최</TableHead>
            <TableHead className="hidden xl:table-cell">주관</TableHead>
            <TableHead>상태</TableHead>
            <TableHead className="hidden pr-4 text-center sm:table-cell">
              주요
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((e) => (
            <TableRow
              key={e.id}
              className="cursor-pointer hover:bg-muted"
              onClick={() => router.push(`/events/${e.id}`)}
            >
              <TableCell className="max-w-[240px] pl-4 font-medium">
                <div className="truncate">{e.title}</div>
                {recurrenceLabel(e) ? (
                  <div className="flex items-center gap-1 text-[11px] font-normal text-muted-foreground">
                    <Repeat className="size-3" />
                    {recurrenceLabel(e)}
                  </div>
                ) : null}
              </TableCell>
              <TableCell>
                <CategoryBadge value={e.category} />
              </TableCell>
              <TableCell className="hidden text-muted-foreground sm:table-cell">
                {formatDate(e.startDate)}
              </TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">
                {formatDate(e.endDate)}
              </TableCell>
              <TableCell className="hidden max-w-[180px] truncate md:table-cell">
                {e.venue}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {districtLabel(e.district)}
              </TableCell>
              <TableCell className="hidden max-w-[140px] truncate text-muted-foreground xl:table-cell">
                {e.organizer}
              </TableCell>
              <TableCell className="hidden max-w-[140px] truncate text-muted-foreground xl:table-cell">
                {e.host}
              </TableCell>
              <TableCell>
                <StatusBadge startDate={e.startDate} endDate={e.endDate} />
              </TableCell>
              <TableCell className="hidden pr-4 text-center sm:table-cell">
                {e.isFeatured ? (
                  <Star className="mx-auto size-4 fill-amber-400 text-amber-400" />
                ) : (
                  <span className="text-muted-foreground">–</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
