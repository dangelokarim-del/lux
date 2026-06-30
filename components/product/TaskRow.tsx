"use client";

import { motion } from "framer-motion";
import { Avatar, Badge, StatusDot } from "@/components/ui";
import { departmentMeta, priorityMeta, statusMeta, type Task } from "@/lib/domain";
import { useLuxa } from "@/lib/store/hooks";
import { timeAgo } from "./format";

const ease = [0.32, 0.72, 0, 1] as const;

export function TaskRow({ task, onOpen, fresh }: { task: Task; onOpen: (id: string) => void; fresh?: boolean }) {
  const store = useLuxa();
  const property = store.propertyById(task.propertyId);
  const assignee = store.staffById(task.assigneeId);
  const completed = task.status === "completed" || task.status === "cancelled";

  return (
    <motion.button
      layout
      onClick={() => onOpen(task.id)}
      initial={fresh ? { opacity: 0, y: -12, backgroundColor: "rgba(46,125,255,0.10)" } : false}
      animate={{ opacity: 1, y: 0, backgroundColor: "rgba(46,125,255,0)" }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.6, ease, backgroundColor: { duration: 2.4, ease } }}
      className="group flex w-full items-center gap-3 rounded-xl border border-line px-3.5 py-3 text-left transition-colors hover:border-line-2 hover:bg-white/[0.025]"
    >
      <StatusDot tone={priorityMeta[task.priority].tone} pulse={task.priority === "urgent" && !completed} className="shrink-0" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`truncate text-[14px] font-medium ${completed ? "text-ink-3 line-through" : "text-ink"}`}>
            {task.title}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-ink-3">
          <span className="tabular-nums text-ink-4">{task.code}</span>
          <span className="text-ink-4">·</span>
          <span className="truncate">{property?.name ?? "Unassigned villa"}</span>
          {task.room && (
            <>
              <span className="text-ink-4">·</span>
              <span className="truncate">{task.room}</span>
            </>
          )}
        </div>
      </div>

      <Badge tone="muted" variant="outline" size="sm" className="hidden shrink-0 sm:inline-flex">
        {departmentMeta[task.department].label}
      </Badge>

      <div className="hidden w-[88px] shrink-0 justify-center md:flex">
        <Badge tone={statusMeta[task.status].tone} variant="soft" size="sm">
          {statusMeta[task.status].label}
        </Badge>
      </div>

      <div className="flex w-[34px] shrink-0 justify-center">
        {assignee ? (
          <Avatar name={assignee.name} size={26} />
        ) : (
          <span className="grid h-[26px] w-[26px] place-items-center rounded-full border border-dashed border-line-2 text-[10px] text-ink-4">—</span>
        )}
      </div>

      <span className="hidden w-[64px] shrink-0 text-right text-[11px] tabular-nums text-ink-4 lg:block">
        {timeAgo(task.updatedAt)}
      </span>
    </motion.button>
  );
}
