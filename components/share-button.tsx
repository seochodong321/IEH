"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ShareButton() {
  const onShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("링크를 복사했습니다");
    } catch {
      // clipboard 권한이 없을 때의 폴백
      window.prompt("아래 링크를 복사하세요", url);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={onShare}>
      <Share2 className="size-4" />
      공유
    </Button>
  );
}
