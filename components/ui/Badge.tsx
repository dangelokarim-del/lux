import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { tones, type Tone } from "@/lib/tone";
import type { TaskStatus, VillaState } from "@/lib/types";

const badgeBase =
  "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none whitespace-nowrap";

const sizes = cva("", {
  variants: {
    size: {
      sm: "px-2 py-0.5 text-[10px]",
      md: "px-2.5 py-1 text-[11px]",
    },
  },
  defaultVariants: { size: "md" },
});

export interface BadgeProps extends VariantProps<typeof sizes> {
  tone?: Tone;
  /** soft = tinted fill, outline = border only */
  variant?: "soft" | "outline";
  className?: string;
  children: React.ReactNode;
}

export function Badge({ tone = "neutral", variant = "soft", size, className, children }: BadgeProps) {
  const t = tones[tone];
  return (
    <span
      className={cn(
        badgeBase,
        sizes({ size }),
        t.text,
        t.border,
        variant === "soft" && t.bg,
        className
      )}
    >
      {children}
    </span>
  );
}

/* ---- domain mappers ---- */

const taskStatusTone: Record<TaskStatus, Tone> = {
  New: "muted",
  Pending: "warn",
  Confirmed: "accent",
  "In Progress": "neutral",
  Completed: "ok",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <Badge tone={taskStatusTone[status]}>{status}</Badge>;
}

const villaStateTone: Record<VillaState, Tone> = {
  Occupied: "ok",
  Arriving: "accent",
  Cleaning: "warn",
  Vacant: "muted",
};

export function VillaStateTag({ state }: { state: VillaState }) {
  return <span className={cn("text-[12px] font-medium", tones[villaStateTone[state]].text)}>{state}</span>;
}

export { PriorityTag } from "./StatusPill";
