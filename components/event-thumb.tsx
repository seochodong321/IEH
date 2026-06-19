import {
  Frame,
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
  exhibition: { icon: Frame, gradient: "from-cyan-400 to-teal-500" },
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
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl} alt="" className={cn("object-cover", className)} />
    );
  }
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br text-white",
        gradient,
        className,
      )}
    >
      {/* 비어 보이지 않게 카테고리 아이콘을 큰 워터마크로 겹쳐 깊이감을 준다 */}
      <Icon
        aria-hidden
        className="absolute -right-4 -bottom-5 h-2/3 w-2/3 rotate-12 text-white/15"
      />
      <Icon
        aria-hidden
        className="absolute -top-4 -left-5 h-1/3 w-1/3 -rotate-12 text-white/10"
      />
      <Icon className={cn("relative size-6 text-white/95", iconClassName)} />
    </div>
  );
}
