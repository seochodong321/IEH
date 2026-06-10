import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accentClass,
}: {
  label: string;
  value: number;
  sub?: string;
  icon: LucideIcon;
  accentClass?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl",
          accentClass,
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
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
    </div>
  );
}
