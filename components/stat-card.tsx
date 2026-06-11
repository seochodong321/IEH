import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accentClass,
  href,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: LucideIcon;
  accentClass?: string;
  /** 지정 시 카드 전체가 해당 목록으로 가는 링크가 된다 */
  href?: string;
}) {
  const inner = (
    <>
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl",
          accentClass,
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="flex items-center gap-0.5 text-xs text-muted-foreground">
          {label}
          {href ? (
            <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
          ) : null}
        </p>
        <p className="text-2xl leading-tight font-bold tabular-nums">
          {value}
          <span className="ml-0.5 text-sm font-medium text-muted-foreground">
            건
          </span>
        </p>
        {sub ? (
          <p className="text-[11px] text-muted-foreground">{sub}</p>
        ) : null}
      </div>
    </>
  );

  const base = "flex items-center gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10";

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          base,
          "group transition-shadow hover:shadow-md hover:ring-foreground/20",
        )}
      >
        {inner}
      </Link>
    );
  }
  return <div className={base}>{inner}</div>;
}
