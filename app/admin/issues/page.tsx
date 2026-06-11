import Link from "next/link";
import { ArrowLeft, ExternalLink, Inbox, Pencil } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { getIssues } from "@/lib/data/issues";
import { IssueActions } from "@/components/issue-actions";
import { formatDate } from "@/lib/event-utils";

export const dynamic = "force-dynamic";

export default async function AdminIssuesPage() {
  await requireAuth();
  const issues = await getIssues("open");

  return (
    <div className="space-y-5">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        행사 관리로
      </Link>

      <div>
        <h1 className="text-2xl font-semibold">신고 처리</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          접수된 신고 {issues.length}건 · 행사 정보 오류·일정 변경 제보입니다.
          확인 후 수정하거나 삭제하세요.
        </p>
      </div>

      {issues.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-card p-12 text-center ring-1 ring-foreground/10">
          <Inbox className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">처리할 신고가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((i) => (
            <div
              key={i.id}
              className="rounded-xl bg-card p-4 ring-1 ring-foreground/10"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/events/${i.eventId}`}
                    className="inline-flex items-center gap-1 font-semibold hover:underline"
                  >
                    {i.eventTitle}
                    <ExternalLink className="size-3.5 shrink-0" />
                  </Link>
                  <p className="mt-2 text-sm whitespace-pre-wrap">{i.message}</p>
                </div>
                <IssueActions id={i.id} />
              </div>
              <p className="mt-3 flex flex-wrap items-center gap-x-2 border-t pt-2 text-xs text-muted-foreground">
                <span>연락처: {i.reporterContact ?? "미기재"}</span>
                <span>· {formatDate(i.createdAt.slice(0, 10))} 접수</span>
                <Link
                  href={`/admin/${i.eventId}/edit`}
                  className="inline-flex items-center gap-0.5 text-foreground hover:underline"
                >
                  <Pencil className="size-3" />
                  행사 수정
                </Link>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
