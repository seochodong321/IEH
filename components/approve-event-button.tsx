"use client";

import { Check } from "lucide-react";
import { approveEventAction } from "@/actions/events";
import { Button } from "@/components/ui/button";
import { useActionRunner } from "@/components/use-action-runner";

export function ApproveEventButton({ id }: { id: string }) {
  const { pending, run } = useActionRunner();

  return (
    <Button
      size="sm"
      disabled={pending}
      onClick={() => run(() => approveEventAction(id), "행사를 게시했습니다.")}
    >
      <Check className="size-4" />
      승인
    </Button>
  );
}
