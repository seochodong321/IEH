import { cn } from "@/lib/utils";

export function Panel({
  title,
  action,
  className,
  bodyClassName,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-xl bg-card p-4 ring-1 ring-foreground/10",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-semibold">{title}</h2>
        {action}
      </div>
      <div className={cn("flex-1", bodyClassName)}>{children}</div>
    </section>
  );
}
