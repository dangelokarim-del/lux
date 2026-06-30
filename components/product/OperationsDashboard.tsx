"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquarePlus } from "lucide-react";
import { Avatar, Card, buttonVariants } from "@/components/ui";
import { LiveNumber } from "@/components/landing/anim/LiveNumber";
import {
  BOARD_STATUSES,
  priorityMeta,
  statusMeta,
  type Task,
  type TaskStatus,
} from "@/lib/domain";
import { useOperationsStats, useTasks } from "@/lib/store/hooks";
import { TaskRow } from "./TaskRow";
import { TaskDetail } from "./TaskDetail";
import { WhatsAppSimulator } from "./WhatsAppSimulator";
import { NotificationBell } from "./NotificationBell";

type Filter = "all" | TaskStatus;

export function OperationsDashboard() {
  const tasks = useTasks();
  const stats = useOperationsStats();
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [simOpen, setSimOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  const sorted = useMemo(() => [...tasks].sort(compareTasks), [tasks]);
  const filtered = useMemo(
    () => (filter === "all" ? sorted.filter((t) => t.status !== "cancelled") : sorted.filter((t) => t.status === filter)),
    [sorted, filter]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: tasks.filter((t) => t.status !== "cancelled").length };
    for (const s of BOARD_STATUSES) c[s] = tasks.filter((t) => t.status === s).length;
    return c;
  }, [tasks]);

  return (
    <>
      {/* header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-black/70 px-5 backdrop-blur-xl sm:px-7">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-[18px] font-semibold tracking-[-0.02em]">
            Operations
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium text-ink-3">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-ok opacity-60" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-ok" />
              </span>
              Live
            </span>
          </h1>
          <p className="truncate text-[12px] text-ink-3">Marbella portfolio · 6 villas</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button onClick={() => setSimOpen(true)} className={buttonVariants({ variant: "accent", size: "sm" })}>
            <MessageSquarePlus size={15} /> <span className="hidden sm:inline">Simulate message</span>
          </button>
          <NotificationBell onOpenTask={setOpenTaskId} />
          <Avatar name="Daniela Ruiz" size={36} />
        </div>
      </header>

      <div className="space-y-6 p-5 sm:p-7">
        {/* live KPIs */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="Open requests" value={stats.open} />
          <Kpi label="Urgent" value={stats.urgent} tone="urgent" />
          <Kpi label="In progress" value={stats.inProgress} tone="accent" />
          <Kpi label="Completed today" value={stats.completedToday} tone="ok" />
        </div>

        {/* task board */}
        <Card className="overflow-hidden p-0">
          <div className="flex flex-wrap items-center gap-1 border-b border-line px-3 py-2.5">
            <Tab label="All" count={counts.all} active={filter === "all"} onClick={() => setFilter("all")} />
            {BOARD_STATUSES.map((s) => (
              <Tab key={s} label={statusMeta[s].label} count={counts[s]} active={filter === s} onClick={() => setFilter(s)} />
            ))}
          </div>

          <div className="space-y-1.5 p-3">
            {filtered.length === 0 && <p className="py-10 text-center text-[13px] text-ink-3">No tasks here.</p>}
            <AnimatePresence initial={false}>
              {filtered.map((t) => (
                <TaskRow key={t.id} task={t} onOpen={setOpenTaskId} fresh={isFresh(t)} />
              ))}
            </AnimatePresence>
          </div>
        </Card>
      </div>

      <TaskDetail taskId={openTaskId} onClose={() => setOpenTaskId(null)} />
      <WhatsAppSimulator open={simOpen} onClose={() => setSimOpen(false)} onOpenTask={setOpenTaskId} />

      {/* floating composer for mobile reach */}
      <button
        onClick={() => setSimOpen(true)}
        className="fixed bottom-20 right-5 z-30 grid h-12 w-12 place-items-center rounded-full bg-accent text-white shadow-[0_18px_48px_-10px_rgba(46,125,255,0.78)] lg:hidden"
        aria-label="Simulate guest message"
      >
        <MessageSquarePlus size={20} />
      </button>
    </>
  );
}

function Kpi({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "urgent" | "accent" | "ok" }) {
  const color = tone === "urgent" ? "text-urgent" : tone === "ok" ? "text-ok" : tone === "accent" ? "text-ink" : "text-ink";
  return (
    <Card hover className="relative p-5">
      {tone === "accent" && <div className="glow-accent pointer-events-none absolute -right-6 -top-8 h-24 w-24 opacity-70 blur-xl" />}
      <div className="text-[12px] uppercase tracking-wider text-ink-3">{label}</div>
      <div className={`mt-3 text-4xl font-semibold tracking-tight tabular-nums ${color}`}>
        <LiveNumber value={value} pad={1} duration={0.9} />
      </div>
    </Card>
  );
}

function Tab({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
        active ? "bg-white/[0.06] text-ink" : "text-ink-3 hover:text-ink-2"
      }`}
    >
      {label}
      <span className={`rounded-full px-1.5 text-[11px] tabular-nums ${active ? "bg-white/[0.08] text-ink-2" : "text-ink-4"}`}>{count}</span>
    </button>
  );
}

const statusOrder: Record<TaskStatus, number> = { new: 0, in_progress: 1, on_hold: 2, completed: 3, cancelled: 4 };

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

function isFresh(t: Task): boolean {
  return Date.now() - new Date(t.createdAt).getTime() < 5000;
}
