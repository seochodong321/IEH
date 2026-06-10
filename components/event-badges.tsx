// 카테고리/상태 표시용 색상 칩. RSC에서도 안전하도록 순수 span 으로 렌더한다.

import { cn } from "@/lib/utils";
import { CATEGORY_MAP, STATUS_MAP } from "@/lib/constants";
import { computeStatus } from "@/lib/event-utils";
import type { Category } from "@/lib/types";

const pill =
  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap";

export function CategoryBadge({
  value,
  className,
}: {
  value: Category;
  className?: string;
}) {
  const o = CATEGORY_MAP[value];
  return <span className={cn(pill, o.badgeClass, className)}>{o.label}</span>;
}

export function StatusBadge({
  startDate,
  endDate,
  className,
}: {
  startDate: string;
  endDate: string;
  className?: string;
}) {
  const o = STATUS_MAP[computeStatus(startDate, endDate)];
  return <span className={cn(pill, o.badgeClass, className)}>{o.label}</span>;
}
