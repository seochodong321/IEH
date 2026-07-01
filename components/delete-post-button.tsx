"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deletePostAction } from "@/actions/posts";
import { Button } from "@/components/ui/button";
import { useActionRunner } from "@/components/use-action-runner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeletePostButton({ id, title }: { id: string; title: string }) {
  const [open, setOpen] = useState(false);
  const { pending, run } = useActionRunner();

  const onConfirm = () =>
    run(() => deletePostAction(id), "게시물을 삭제했습니다.", () =>
      setOpen(false),
    );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-destructive"
            aria-label="삭제"
          />
        }
      >
        <Trash2 className="size-4" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>게시물을 삭제할까요?</AlertDialogTitle>
          <AlertDialogDescription>
            “{title}” 게시물이 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>취소</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? "삭제 중..." : "삭제"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
