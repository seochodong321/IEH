import {
  GraduationCap,
  Music,
  PartyPopper,
  Presentation,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

const META: Record<Category, { icon: LucideIcon; gradient: string }> = {
  festival: { icon: PartyPopper, gradient: "from-rose-400 to-pink-500" },
  performance: { icon: Music, gradient: "from-violet-400 to-purple-500" },
  expo: { icon: Presentation, gradient: "from-sky-400 to-blue-500" },
  sports: { icon: Trophy, gradient: "from-emerald-400 to-teal-500" },
  education: { icon: GraduationCap, gradient: "from-amber-400 to-orange-500" },
  etc: { icon: Sparkles, gradient: "from-slate-400 to-slate-500" },
};

// 대표 이미지가 있으면 이미지, 없으면 카테고리 색 그라디언트 + 아이콘.
export function EventThumb({
  category,
  imageUrl,
  className,
  iconClassName,
}: {
  category: Category;
  imageUrl?: string | null;
  className?: string;
  iconClassName?: string;
}) {
  const { icon: Icon, gradient } = META[category];
  if (imageUrl) {
    // 내부 도구이므로 외부 이미지를 next/image 설정 없이 단순 표시한다.
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={imageUrl}
        alt=""
        className={cn("object-cover", className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-gradient-to-br text-white",
        gradient,
        className,
      )}
    >
      <Icon className={cn("size-6 text-white/90", iconClassName)} />
    </div>
  );
}
