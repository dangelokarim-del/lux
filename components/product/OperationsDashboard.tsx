"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Inbox, MessageSquarePlus } from "lucide-react";
import { Avatar, Card, buttonVariants } from "@/components/ui";
import { LiveNumber } from "@/components/landing/anim/LiveNumber";
import {
  BOARD_STATUSES,
  priorityMeta,
  statusMeta,
  type Task,
  type TaskStatus,
} from "@/lib/domain";
import { useOperationsStats, useReady, useTasks } from "@/lib/store/hooks";
import { useToast } from "./Toast";
import { TaskRow } from "./TaskRow";
import { TaskDetail } from "./TaskDetail";
import { WhatsAppSimulator } from "./WhatsAppSimulator";
import { NotificationBell } from "./NotificationBell";
import { ShortcutsHelp } from "./ShortcutsHelp";
import { KpiSkeleton, TaskListSkeleton } from "./Skeletons";

type Filter = "all" | TaskStatus;
const FILTERS: Filter[] = ["all", ...BOARD_STATUSES];

export function OperationsDashboard() {
  const readyState = useReady();
  // relative timestamps + live numbers are client-only; render skeletons until
  // mounted so SSR and first paint agree (no hydration mismatch).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const ready = readyState && mounted;
  const tasks = useTasks();
  const stats = useOperationsStats();
  const toast = useToast();
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [simOpen, setSimOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [cursor, setCursor] = useState(-1);

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

  // toast on a genuinely new request arriving (not on first load / reconciliation)
  const seen = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!ready) return;
    if (seen.current === null) {
      seen.current = new Set(tasks.map((t) => t.id));
      return;
    }
    for (const t of tasks) {
      if (!seen.current.has(t.id)) {
        seen.current.add(t.id);
        if (Date.now() - new Date(t.createdAt).getTime() < 8000) {
          toast.show({
            kind: "ai",
            title: "New request captured",
            body: `${t.code} · ${t.title}`,
            action: { label: "Open", onClick: () => setOpenTaskId(t.id) },
          });
        }
      }
    }
  }, [tasks, ready, toast]);

  // keep the keyboard cursor in range as the list changes
  useEffect(() => {
    setCursor((c) => (c >= filtered.length ? filtered.length - 1 : c));
  }, [filtered.length]);

  const typingTarget = (el: EventTarget | null) => {
    const t = el as HTMLElement | null;
    return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable);
  };

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (typingTarget(e.target)) return;
      if (e.key === "?") { setHelpOpen((v) => !v); return; }
      if (e.key.toLowerCase() === "n") { e.preventDefault(); setSimOpen(true); return; }
      if (openTaskId || simOpen || helpOpen) return;
      if (e.key >= "1" && e.key <= "5") {
        const f = FILTERS[Number(e.key) - 1];
        if (f) { setFilter(f); setCursor(-1); }
        return;
      }
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setCursor((c) => Math.min((c < 0 ? -1 : c) + 1, filtered.length - 1));
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setCursor((c) => Math.max((c < 0 ? filtered.length : c) - 1, 0));
      } else if (e.key === "Enter" && cursor >= 0 && filtered[cursor]) {
        e.preventDefault();
        setOpenTaskId(filtered[cursor].id);
      }
    },
    [filtered, cursor, openTaskId, simOpen, helpOpen]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

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
            <MessageSquarePlus size={15} /> <span className="hidden sm:inline">New message</span>
          </button>
          <NotificationBell onOpenTask={setOpenTaskId} />
          <Avatar name="Daniela Ruiz" size={36} />
        </div>
      </header>

      <div className="space-y-6 p-5 sm:p-7">
        {/* live KPIs */}
        {ready ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi label="Open requests" value={stats.open} />
            <Kpi label="Urgent" value={stats.urgent} tone="urgent" />
            <Kpi label="In progress" value={stats.inProgress} tone="accent" />
            <Kpi label="Completed today" value={stats.completedToday} tone="ok" />
          </div>
        ) : (
          <KpiSkeleton />
        )}

        {/* task board */}
        {ready ? (
          <Card className="overflow-hidden p-0">
            <div className="flex flex-wrap items-center gap-1 border-b border-line px-3 py-2.5">
              <Tab label="All" count={counts.all} active={filter === "all"} onClick={() => { setFilter("all"); setCursor(-1); }} />
              {BOARD_STATUSES.map((s) => (
                <Tab key={s} label={statusMeta[s].label} count={counts[s]} active={filter === s} onClick={() => { setFilter(s); setCursor(-1); }} />
              ))}
            </div>

            <div className="space-y-1.5 p-3">
              {filtered.length === 0 ? (
                <EmptyBoard filter={filter} onCompose={() => setSimOpen(true)} />
              ) : (
                <AnimatePresence initial={false}>
                  {filtered.map((t, i) => (
                    <TaskRow key={t.id} task={t} onOpen={setOpenTaskId} fresh={isFresh(t)} selected={i === cursor} />
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
      <WhatsAppSimulator open={simOpen} onClose={() => setSimOpen(false)} onOpenTask={setOpenTaskId} />
      <ShortcutsHelp open={helpOpen} onClose={() => setHelpOpen(false)} />

      {/* floating composer for mobile reach */}
      <button
        onClick={() => setSimOpen(true)}
        className="fixed bottom-20 right-5 z-30 grid h-12 w-12 place-items-center rounded-full bg-accent text-white shadow-[0_18px_48px_-10px_rgba(46,125,255,0.78)] transition-transform active:scale-95 lg:hidden"
        aria-label="New guest message"
      >
        <MessageSquarePlus size={20} />
      </button>
    </>
  );
}

function EmptyBoard({ filter, onCompose }: { filter: Filter; onCompose: () => void }) {
  const label = filter === "all" ? "" : statusMeta[filter as TaskStatus].label.toLowerCase();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center px-6 py-16 text-center"
    >
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-[14px] border border-line bg-bg-elev text-ink-3">
        <Inbox size={20} />
      </div>
      <h3 className="text-[15px] font-medium text-ink">
        {filter === "all" ? "Nothing in the queue" : `No ${label} requests`}
      </h3>
      <p className="mt-1.5 max-w-xs text-[13px] leading-relaxed text-ink-3">
        {filter === "all"
          ? "Guest messages are captured and structured here the moment they arrive."
          : "Requests will appear here as their status changes."}
      </p>
      {filter === "all" && (
        <button onClick={onCompose} className={buttonVariants({ variant: "secondary", size: "sm", className: "mt-5" })}>
          <MessageSquarePlus size={14} /> New message
        </button>
      )}
    </motion.div>
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
