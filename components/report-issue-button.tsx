"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Flag } from "lucide-react";
import { reportIssue, type IssueState } from "@/actions/issues";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ReportIssueButton({
  eventId,
  eventTitle,
}: {
  eventId: string;
  eventTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<IssueState, FormData>(
    reportIssue,
    {},
  );
  const handled = useRef<IssueState | null>(null);

  useEffect(() => {
    if (state.ok && handled.current !== state) {
      handled.current = state;
      toast.success("신고가 접수되었습니다. 검토 후 반영하겠습니다.");
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
          />
        }
      >
        <Flag className="size-4" />
        신고
      </DialogTrigger>
      <DialogContent>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="eventId" value={eventId} />
          <input type="hidden" name="eventTitle" value={eventTitle} />
          <DialogHeader>
            <DialogTitle>행사 정보 신고</DialogTitle>
            <DialogDescription>
              정보가 잘못됐거나 일정이 변경됐나요? 알려주시면 관리자가 검토 후
              수정·삭제합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="issueMessage">
              신고 내용 <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="issueMessage"
              name="message"
              rows={4}
              required
              placeholder="예: 행사 일정이 7월 5일로 변경되었습니다 / 장소가 잘못되었습니다."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="issueContact">연락처 (선택)</Label>
            <Input
              id="issueContact"
              name="reporterContact"
              placeholder="회신용 이메일 또는 전화 (선택)"
            />
          </div>
          {state.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              취소
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? "제출 중..." : "신고하기"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
