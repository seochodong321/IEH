"use client";

import { Check, Trash2 } from "lucide-react";
import { deleteIssueAction, resolveIssueAction } from "@/actions/issues";
import { Button } from "@/components/ui/button";
import { useActionRunner } from "@/components/use-action-runner";

export function IssueActions({ id }: { id: string }) {
  const { pending, run } = useActionRunner();

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => run(() => resolveIssueAction(id), "처리 완료로 표시했습니다.")}
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
        onClick={() => run(() => deleteIssueAction(id), "신고를 삭제했습니다.")}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
