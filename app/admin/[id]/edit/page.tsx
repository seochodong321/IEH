import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAuth } from "@/lib/auth";
import { getEventById } from "@/lib/data/events";
import { updateEventAction } from "@/actions/events";
import { EventForm } from "@/components/event-form";

export const dynamic = "force-dynamic";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAuth();
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  const action = updateEventAction.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        행사 관리로
      </Link>
      <h1 className="text-2xl font-semibold">행사 수정</h1>
      <div className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
        <EventForm action={action} event={event} submitLabel="수정하기" />
      </div>
    </div>
  );
}
