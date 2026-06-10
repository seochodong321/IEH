"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Trash2, X } from "lucide-react";
import {
  deleteSubmissionAction,
  rejectSubmissionAction,
} from "@/actions/submissions";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ReportReviewActions({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const run = (
    fn: (id: string) => Promise<{ error?: string }>,
    okMsg: string,
  ) =>
    startTransition(async () => {
      const res = await fn(id);
      if (res?.error) toast.error(res.error);
      else {
        toast.success(okMsg);
        router.refresh();
      }
    });

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
        onClick={() => run(rejectSubmissionAction, "제보를 반려했습니다.")}
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
        onClick={() => run(deleteSubmissionAction, "제보를 삭제했습니다.")}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
