"use client";

import Link from "next/link";
import { Check, Trash2, X } from "lucide-react";
import {
  deleteSubmissionAction,
  rejectSubmissionAction,
} from "@/actions/submissions";
import { Button, buttonVariants } from "@/components/ui/button";
import { useActionRunner } from "@/components/use-action-runner";
import { cn } from "@/lib/utils";

export function ReportReviewActions({ id }: { id: string }) {
  const { pending, run } = useActionRunner();

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Link
        href={`/admin/new?submission=${id}`}
        className={cn(buttonVariants({ size: "sm" }))}
      >
        <Check className="size-4" />
        검토 후 등록
      </Link>
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => run(() => rejectSubmissionAction(id), "제보를 반려했습니다.")}
      >
        <X className="size-4" />
        반려
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 text-muted-foreground hover:text-destructive"
        aria-label="삭제"
        disabled={pending}
        onClick={() => run(() => deleteSubmissionAction(id), "제보를 삭제했습니다.")}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
