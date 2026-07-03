"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ListChecks } from "lucide-react";
import { Topbar } from "@/components/app/Topbar";
import { Card, EmptyState, buttonVariants } from "@/components/ui";
import { DEPARTMENTS, departmentMeta, priorityMeta, statusMeta, type Department, type Task } from "@/lib/domain";
import { useReady, useTasks } from "@/lib/store/hooks";
import { TaskRow } from "@/components/product/TaskRow";
import { TaskDetail } from "@/components/product/TaskDetail";
import { TaskListSkeleton } from "@/components/product/Skeletons";
import { cn } from "@/lib/utils";

type Filter = "all" | Department;

export default function TasksPage() {
  const readyState = useReady();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const ready = readyState && mounted;

  const tasks = useTasks();
  const [filter, setFilter] = useState<Filter>("all");
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  const open = tasks.filter((t) => statusMeta[t.status].open).length;

  const filtered = useMemo(() => {
    const base = filter === "all" ? tasks : tasks.filter((t) => t.department === filter);
    return [...base].sort(compareTasks);
  }, [tasks, filter]);

  const count = (f: Filter) => (f === "all" ? tasks.length : tasks.filter((t) => t.department === f).length);

  return (
    <>
      <Topbar title="Tasks" subtitle={`${open} open · ${tasks.length} across the portfolio`} />
      <div className="space-y-4 p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip label="All" n={count("all")} active={filter === "all"} onClick={() => setFilter("all")} />
          {DEPARTMENTS.map((d) => (
            <FilterChip key={d} label={departmentMeta[d].label} n={count(d)} active={filter === d} onClick={() => setFilter(d)} />
          ))}
        </div>

        {ready ? (
          <Card className="overflow-hidden p-0">
            <div className="space-y-1.5 p-3">
              {filtered.length === 0 ? (
                <EmptyState
                  icon={<ListChecks size={24} />}
                  title={filter === "all" ? "No tasks yet" : "Nothing in this department"}
                  description={filter === "all" ? "A calm board is a good sign — everything is handled." : "No open work for this team right now."}
                  aiHint="LUXA files new WhatsApp requests here the moment they arrive."
                  action={filter !== "all" ? (
                    <button onClick={() => setFilter("all")} className={buttonVariants({ variant: "secondary", size: "sm" })}>Show all tasks</button>
                  ) : undefined}
                />
              ) : (
                <AnimatePresence initial={false}>
                  {filtered.map((t) => (
                    <TaskRow key={t.id} task={t} onOpen={setOpenTaskId} />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </Card>
        ) : (
          <TaskListSkeleton />
        )}
      </div>

      <TaskDetail taskId={openTaskId} onClose={() => setOpenTaskId(null)} />
    </>
  );
}

function FilterChip({ label, n, active, onClick }: { label: string; n: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] transition-all duration-200 ease-[var(--ease-premium)] hover:-translate-y-px",
        active ? "border-line-2 bg-white/[0.06] text-ink [box-shadow:inset_0_1px_0_rgba(255,255,255,0.06)]" : "border-line text-ink-2 hover:bg-white/[0.03] hover:text-ink"
      )}
    >
      {label}
      <span className={cn("text-[11px] tabular-nums", active ? "text-accent" : "text-ink-4")}>{n}</span>
    </button>
  );
}

const statusOrder: Record<Task["status"], number> = { new: 0, in_progress: 1, on_hold: 2, completed: 3, cancelled: 4 };
function compareTasks(a: Task, b: Task): number {
  const ao = statusOrder[a.status];
  const bo = statusOrder[b.status];
  if (ao !== bo) return ao - bo;
  if (statusMeta[a.status].open) {
    const pw = priorityMeta[b.priority].weight - priorityMeta[a.priority].weight;
    if (pw !== 0) return pw;
    return b.updatedAt.localeCompare(a.updatedAt);
  }
  return (b.completedAt ?? b.updatedAt).localeCompare(a.completedAt ?? a.updatedAt);
}
