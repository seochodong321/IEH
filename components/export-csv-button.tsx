"use client";

import { useSearchParams } from "next/navigation";
import { Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// 현재 화면의 필터(쿼리스트링)를 그대로 내보내기 링크에 전달한다.
export function ExportCsvButton() {
  const sp = useSearchParams();
  const qs = sp.toString();
  return (
    <a
      href={`/events/export${qs ? `?${qs}` : ""}`}
      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
    >
      <Download className="size-4" />
      CSV 내보내기
    </a>
  );
}
