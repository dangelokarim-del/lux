"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Avatar, Badge, StatusDot } from "@/components/ui";
import { deptLabel, priorityMeta, statusMeta, type Task } from "@/lib/domain";
import { useLuxa } from "@/lib/store/hooks";
import { timeAgo } from "./format";

const ease = [0.32, 0.72, 0, 1] as const;

export function TaskRow({ task, onOpen, fresh, selected }: { task: Task; onOpen: (id: string) => void; fresh?: boolean; selected?: boolean }) {
  const store = useLuxa();
  const property = store.propertyById(task.propertyId);
  const assignee = store.staffById(task.assigneeId);
  const completed = task.status === "completed" || task.status === "cancelled";
  const ref = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (selected) ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selected]);

  return (
    <motion.button
      ref={ref}
      layout
      onClick={() => onOpen(task.id)}
      aria-current={selected ? "true" : undefined}
      initial={
        fresh
          ? { opacity: 0, y: -12, filter: "blur(8px)", backgroundColor: "rgba(46,125,255,0.10)" }
          : { opacity: 0, y: 8, filter: "blur(6px)" }
      }
      animate={{ opacity: 1, y: 0, filter: "blur(0px)", backgroundColor: "rgba(46,125,255,0)" }}
      exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
      transition={{ duration: 0.55, ease, backgroundColor: { duration: 2.4, ease } }}
      className={`group flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-[border-color,background-color,box-shadow] hover:border-line-2 hover:bg-white/[0.025] ${
        selected ? "border-accent/50 bg-white/[0.03] shadow-[0_0_0_1px_rgba(46,125,255,0.35)]" : "border-line"
      }`}
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
        {deptLabel(task.department)}
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
