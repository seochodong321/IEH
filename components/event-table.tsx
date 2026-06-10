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
import { DISTRICT_MAP } from "@/lib/constants";
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
            <TableHead>시작일</TableHead>
            <TableHead>종료일</TableHead>
            <TableHead>장소</TableHead>
            <TableHead>권역</TableHead>
            <TableHead>주최</TableHead>
            <TableHead>주관</TableHead>
            <TableHead>상태</TableHead>
            <TableHead className="pr-4 text-center">주요</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((e) => (
            <TableRow
              key={e.id}
              className="cursor-pointer"
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
              <TableCell className="text-muted-foreground">
                {formatDate(e.startDate)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(e.endDate)}
              </TableCell>
              <TableCell className="max-w-[180px] truncate">{e.venue}</TableCell>
              <TableCell>{DISTRICT_MAP[e.district].label}</TableCell>
              <TableCell className="max-w-[140px] truncate text-muted-foreground">
                {e.organizer}
              </TableCell>
              <TableCell className="max-w-[140px] truncate text-muted-foreground">
                {e.host}
              </TableCell>
              <TableCell>
                <StatusBadge startDate={e.startDate} endDate={e.endDate} />
              </TableCell>
              <TableCell className="pr-4 text-center">
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
