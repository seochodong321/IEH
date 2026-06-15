"use client";

import { useEffect, useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleLikeAction } from "@/actions/events";
import { cn } from "@/lib/utils";

// 로그인 없이 동작. 브라우저(localStorage)로 중복을 완화하고,
// 누적 수는 서버(행사 테이블의 likes)에 저장된다.
export function LikeButton({
  eventId,
  initialLikes,
}: {
  eventId: string;
  initialLikes: number;
}) {
  const [count, setCount] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [pending, startTransition] = useTransition();

  // 서버에는 좋아요 여부 정보가 없어 첫 렌더는 항상 false → 마운트 후 보정.
  // (하이드레이션 불일치를 피하려는 의도된 effect-setState 패턴)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLiked(localStorage.getItem(`liked:${eventId}`) === "1");
  }, [eventId]);

  const onClick = () => {
    const next = !liked;
    // 낙관적 업데이트
    setLiked(next);
    setCount((c) => Math.max(0, c + (next ? 1 : -1)));
    try {
      localStorage.setItem(`liked:${eventId}`, next ? "1" : "0");
    } catch {
      // localStorage 비활성 환경 무시
    }
    startTransition(async () => {
      const res = await toggleLikeAction(eventId, next);
      if (typeof res?.count === "number") setCount(res.count);
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={liked}
      aria-label={liked ? "좋아요 취소" : "좋아요"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ring-1 transition-colors",
        liked
          ? "bg-rose-50 text-rose-600 ring-rose-200"
          : "ring-foreground/15 hover:bg-muted",
      )}
    >
      <Heart className={cn("size-4", liked && "fill-rose-500 text-rose-500")} />
      <span className="tabular-nums">{count}</span>
    </button>
  );
}
