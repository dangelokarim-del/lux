"use client";

import { useState } from "react";
import { TaskTable } from "./TaskTable";
import { cn } from "@/lib/utils";
import type { Task, Department } from "@/lib/types";

const filters: ("All" | Department)[] = [
  "All",
  "Maintenance",
  "Concierge",
  "Housekeeping",
  "Security",
];

export function TasksView({ data }: { data: Task[] }) {
  const [active, setActive] = useState<(typeof filters)[number]>("All");

  const filtered = active === "All" ? data : data.filter((t) => t.department === active);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => {
          const isActive = f === active;
          const count = f === "All" ? data.length : data.filter((t) => t.department === f).length;
          return (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] transition-colors",
                isActive
                  ? "border-line-2 bg-white/[0.06] text-ink"
                  : "border-line text-ink-2 hover:text-ink"
              )}
            >
              {f}
              <span className={cn("text-[11px]", isActive ? "text-accent" : "text-ink-4")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <TaskTable data={filtered} />
    </div>
  );
}
