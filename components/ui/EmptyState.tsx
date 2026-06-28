import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-16 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-[14px] border border-line bg-bg-elev text-ink-3">
          {icon}
        </div>
      )}
      <h3 className="text-[15px] font-medium text-ink">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-xs text-[13px] leading-relaxed text-ink-3">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
