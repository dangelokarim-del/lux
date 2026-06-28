import { cn } from "@/lib/utils";

export function Card({
  hover = false,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div
      className={cn(
        "panel overflow-hidden shadow-[var(--shadow-card)]",
        hover && "panel-hover",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** Title bar with optional right-aligned action/meta. */
export function CardHeader({
  title,
  meta,
  className,
}: {
  title: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-b border-line px-5 py-3.5",
        className
      )}
    >
      <h3 className="text-[14px] font-medium">{title}</h3>
      {meta != null && <div className="text-[12px] text-ink-3">{meta}</div>}
    </div>
  );
}

export function CardBody({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

export function CardFooter({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("border-t border-line px-5 py-3.5", className)}>
      {children}
    </div>
  );
}
