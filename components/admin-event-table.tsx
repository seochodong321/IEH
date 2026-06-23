"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Copy, Pencil, Search, Star } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  CategoryBadge,
  PublishBadge,
  StatusBadge,
} from "@/components/event-badges";
import { DeleteEventButton } from "@/components/delete-event-button";
import { ApproveEventButton } from "@/components/approve-event-button";
import { buttonVariants } from "@/components/ui/button";
import { districtLabel } from "@/lib/constants";
import { formatDateRange } from "@/lib/event-utils";
import { cn } from "@/lib/utils";
import type { EventRecord } from "@/lib/types";

type PubFilter = "all" | "published" | "pending";

const PUB_FILTERS: { value: PubFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "published", label: "게시중" },
  { value: "pending", label: "대기" },
];

export function AdminEventTable({ events }: { events: EventRecord[] }) {
  const [query, setQuery] = useState("");
  const [pub, setPub] = useState<PubFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      if (pub === "published" && !e.published) return false;
      if (pub === "pending" && e.published) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q) ||
        e.host.toLowerCase().includes(q) ||
        districtLabel(e.district).toLowerCase().includes(q)
      );
    });
  }, [events, query, pub]);

  if (events.length === 0) {
    return (
      <div className="rounded-xl bg-card p-10 text-center text-sm text-muted-foreground ring-1 ring-foreground/10">
        등록된 행사가 없습니다. “행사 등록”으로 첫 행사를 추가하세요.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="행사명·장소·주최·권역 검색"
            className="h-9 pl-8"
          />
        </div>
        <div className="flex rounded-lg bg-muted p-0.5">
          {PUB_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setPub(f.value)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                pub === f.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-card ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">행사명</TableHead>
              <TableHead>유형</TableHead>
              <TableHead>기간</TableHead>
              <TableHead>권역</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>게시</TableHead>
              <TableHead className="pr-4 text-right">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  검색 결과가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((e) => (
                <TableRow
                  key={e.id}
                  className={cn(!e.published && "bg-amber-50/60")}
                >
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
                  <TableCell>{districtLabel(e.district)}</TableCell>
                  <TableCell>
                    <StatusBadge startDate={e.startDate} endDate={e.endDate} />
                  </TableCell>
                  <TableCell>
                    <PublishBadge published={e.published} />
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex items-center justify-end gap-1">
                      {!e.published ? <ApproveEventButton id={e.id} /> : null}
                      <Link
                        href={`/admin/new?from=${e.id}`}
                        aria-label="복제"
                        title="이 행사를 복제해 새로 등록"
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon" }),
                          "size-8 text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Copy className="size-4" />
                      </Link>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
