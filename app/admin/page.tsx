import Link from "next/link";
import { Flag, Inbox, LogOut, Plus } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { logout } from "@/actions/auth";
import { getEvents } from "@/lib/data/events";
import { getPendingCount } from "@/lib/data/submissions";
import { getOpenIssueCount } from "@/lib/data/issues";
import { AdminEventTable } from "@/components/admin-event-table";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAuth();
  const [events, pendingReports, openIssues] = await Promise.all([
    getEvents(),
    getPendingCount(),
    getOpenIssueCount(),
  ]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">행사 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            총 {events.length}건 · 등록 · 수정 · 삭제
          </p>
        </div>
        <div className="flex items-center gap-2">
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              <LogOut className="size-4" />
              로그아웃
            </Button>
          </form>
          <Link
            href="/admin/reports"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Inbox className="size-4" />
            제보 검토
            {pendingReports > 0 ? (
              <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-medium text-white">
                {pendingReports}
              </span>
            ) : null}
          </Link>
          <Link
            href="/admin/issues"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Flag className="size-4" />
            신고 처리
            {openIssues > 0 ? (
              <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-medium text-white">
                {openIssues}
              </span>
            ) : null}
          </Link>
          <Link
            href="/admin/new"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            <Plus className="size-4" />
            행사 등록
          </Link>
        </div>
      </div>

      <AdminEventTable events={events} />
    </div>
  );
}
