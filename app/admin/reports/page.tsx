import Link from "next/link";
import { ArrowLeft, Inbox } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { getSubmissions } from "@/lib/data/submissions";
import { ReportReviewActions } from "@/components/report-review-actions";
import { CategoryBadge } from "@/components/event-badges";
import { districtLabel } from "@/lib/constants";
import { formatDate, formatDateRange } from "@/lib/event-utils";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  await requireAuth();
  const pending = await getSubmissions("pending");

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
        <h1 className="text-2xl font-semibold">제보 검토</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          검토 대기 {pending.length}건 · “검토 후 등록”을 누르면 내용을 보완해
          행사로 게시할 수 있습니다.
        </p>
      </div>

      {pending.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-card p-12 text-center ring-1 ring-foreground/10">
          <Inbox className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            검토 대기 중인 제보가 없습니다.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((s) => (
            <div
              key={s.id}
              className="rounded-xl bg-card p-4 ring-1 ring-foreground/10"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold">{s.title}</h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    {s.category ? (
                      <CategoryBadge value={s.category} />
                    ) : (
                      <span className="text-xs">유형 미정</span>
                    )}
                    {s.district ? (
                      <span>{districtLabel(s.district)}</span>
                    ) : null}
                    {s.startDate ? (
                      <span>
                        {formatDateRange(s.startDate, s.endDate ?? s.startDate)}
                      </span>
                    ) : null}
                    {s.venue ? <span>· {s.venue}</span> : null}
                  </div>
                </div>
                <ReportReviewActions id={s.id} />
              </div>

              {s.description ? (
                <p className="mt-3 text-sm whitespace-pre-wrap">
                  {s.description}
                </p>
              ) : null}

              <p className="mt-3 border-t pt-2 text-xs text-muted-foreground">
                제보자: {s.reporterName ?? "익명"}
                {s.reporterContact ? ` · ${s.reporterContact}` : ""} ·{" "}
                {formatDate(s.createdAt.slice(0, 10))} 접수
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
