"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ShareButton() {
  const onShare = async () => {
    const url = window.location.href;
    // 모바일 등 지원 환경에서는 OS 공유 시트를 띄운다 (카톡·문자 등으로 바로 공유)
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
      } catch {
        // 사용자가 공유 시트를 닫은 경우 — 아무것도 하지 않음
      }
      return;
    }
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
