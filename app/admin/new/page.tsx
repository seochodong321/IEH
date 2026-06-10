import Link from "next/link";
import { ArrowLeft, Megaphone } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { createEventAction } from "@/actions/events";
import { getSubmissionById } from "@/lib/data/submissions";
import { EventForm } from "@/components/event-form";
import type { EventRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAuth();

  const sp = await searchParams;
  const submissionId =
    typeof sp.submission === "string" ? sp.submission : undefined;
  const submission = submissionId
    ? await getSubmissionById(submissionId)
    : null;

  const defaults: Partial<EventRecord> | undefined = submission
    ? {
        title: submission.title,
        category: submission.category ?? undefined,
        startDate: submission.startDate ?? undefined,
        endDate: submission.endDate ?? submission.startDate ?? undefined,
        venue: submission.venue ?? undefined,
        district: submission.district ?? undefined,
        organizer: submission.organizer ?? undefined,
        host: submission.host ?? undefined,
        description: submission.description ?? undefined,
        websiteUrl: submission.websiteUrl ?? undefined,
      }
    : undefined;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        href={submission ? "/admin/reports" : "/admin"}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {submission ? "제보 검토로" : "행사 관리로"}
      </Link>
      <h1 className="text-2xl font-semibold">행사 등록</h1>

      {submission ? (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 ring-1 ring-amber-200">
          <Megaphone className="mt-0.5 size-4 shrink-0" />
          <span>
            제보 내용을 불러왔습니다. 빠진 항목을 보완해 등록하면 해당 제보는
            자동으로 승인 처리됩니다.
          </span>
        </div>
      ) : null}

      <div className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
        <EventForm
          action={createEventAction}
          event={defaults}
          fromSubmissionId={submission?.id}
          submitLabel={submission ? "검토 완료 · 등록" : "등록하기"}
        />
      </div>
    </div>
  );
}
