import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A premium empty state: never a blank void. A glowing icon, a clear title and
 * explanation, an optional AI suggestion, and up to two actions that teach the
 * user exactly what to do next.
 */
export function EmptyState({
  icon,
  title,
  description,
  aiHint,
  action,
  secondaryAction,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  aiHint?: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-16 text-center", className)}>
      {icon && (
        <div className="relative mb-5">
          <div aria-hidden className="glow-soft pointer-events-none absolute -inset-6 -z-10 opacity-70 blur-xl" />
          <div className="grid h-16 w-16 place-items-center rounded-[20px] border border-line bg-bg-elev text-ink-2 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.08),var(--shadow-card)]">
            {icon}
          </div>
        </div>
      )}
      <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-[13.5px] leading-relaxed text-ink-3">{description}</p>}

      {aiHint && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.07] px-3 py-1.5 text-[12.5px] text-ink-2">
          <Sparkles size={13} className="text-accent" />
          {aiHint}
        </div>
      )}

      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
