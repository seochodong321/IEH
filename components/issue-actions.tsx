"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Trash2 } from "lucide-react";
import { deleteIssueAction, resolveIssueAction } from "@/actions/issues";
import { Button } from "@/components/ui/button";

export function IssueActions({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const run = (fn: (id: string) => Promise<{ error?: string }>, ok: string) =>
    startTransition(async () => {
      const res = await fn(id);
      if (res?.error) toast.error(res.error);
      else {
        toast.success(ok);
        router.refresh();
      }
    });

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => run(resolveIssueAction, "처리 완료로 표시했습니다.")}
      >
        <Check className="size-4" />
        처리완료
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 text-muted-foreground hover:text-destructive"
        aria-label="삭제"
        disabled={pending}
        onClick={() => run(deleteIssueAction, "신고를 삭제했습니다.")}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
