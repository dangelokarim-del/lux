import { cn } from "@/lib/utils";
import type { TaskStatus, Priority, VillaState } from "@/lib/types";

const statusStyles: Record<TaskStatus, string> = {
  New: "text-ink-2 border-line-2",
  Pending: "text-warn border-[rgba(245,181,61,0.25)] bg-[rgba(245,181,61,0.07)]",
  Confirmed: "text-accent border-[rgba(46,125,255,0.3)] bg-accent-soft",
  "In Progress": "text-ink border-line-2 bg-[rgba(255,255,255,0.05)]",
  Completed: "text-ok border-[rgba(74,212,138,0.25)] bg-[rgba(74,212,138,0.07)]",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none",
        statusStyles[status]
      )}
    >
      {status}
    </span>
  );
}

export function PriorityTag({ priority }: { priority: Priority }) {
  if (priority === "Normal") {
    return <span className="text-[12px] text-ink-3">Normal</span>;
  }
  const isUrgent = priority === "Urgent";
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium">
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isUrgent ? "bg-urgent" : "bg-warn"
        )}
      />
      <span className={isUrgent ? "text-urgent" : "text-warn"}>{priority}</span>
    </span>
  );
}

const villaStateStyles: Record<VillaState, string> = {
  Occupied: "text-ok",
  Arriving: "text-accent",
  Cleaning: "text-warn",
  Vacant: "text-ink-3",
};

export function VillaStateTag({ state }: { state: VillaState }) {
  return (
    <span className={cn("text-[12px] font-medium", villaStateStyles[state])}>
      {state}
    </span>
  );
}
