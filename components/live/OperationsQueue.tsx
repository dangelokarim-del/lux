"use client";

/**
 * The Operations Queue — a ranked vertical list of premium cards, the fastest
 * way for a manager to see what needs a decision and act on it. Three archetypes
 * (issue, arrival, transfer), each with the villa, who's on it, ETA, progress, an
 * AI explanation and wired actions that mutate the real store.
 */
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Phone, ArrowRightLeft, CircleCheck, Navigation, MapPin, Clock, User, ListChecks, Sparkles } from "lucide-react";
import { useDatabase, useLuxa } from "@/lib/store/hooks";
import { useToast } from "@/components/product/Toast";
import { STATUS_META, type LiveStaff } from "@/lib/live/engine";
import { computeAvailability, openTaskCount } from "@/lib/services/availability";
import { buildQueue, type QueueItem, type QueueAction } from "@/lib/live/queue";
import { cn } from "@/lib/utils";

export function OperationsQueue({ staff }: { staff: LiveStaff[] }) {
  const db = useDatabase();
  const store = useLuxa();
  const { show } = useToast();
  const items = useMemo(() => buildQueue(db, staff), [db, staff]);

  function reassign(it: QueueItem) {
    const task = db.tasks.find((t) => t.id === it.taskId);
    if (!task) return;
    const peer = db.staff
      .filter((s) => s.department === task.department && s.id !== task.assigneeId)
      .map((s) => ({ s, av: computeAvailability(s, db), load: openTaskCount(db, s.id) }))
      .filter((x) => x.av.state === "available")
      .sort((a, b) => a.load - b.load)[0];
    const mgr = db.staff.find((s) => s.isManager);
    const to = peer?.s ?? mgr ?? null;
    if (!to) return show({ kind: "error", title: "No one available", body: "Add cover for this department." });
    store.assignTask(task.id, to.id);
    store.addNote(task.id, `Reassigned to ${to.name} by LUXA (lowest workload, on shift).`, { name: "LUXA AI" });
    show({ kind: "ai", title: "Reassigned", body: `${task.title} → ${to.name}` });
  }

  function act(it: QueueItem, a: QueueAction) {
    const task = it.taskId ? db.tasks.find((t) => t.id === it.taskId) : null;
    if (a === "approve" && task) {
      const next = task.status === "new" ? "in_progress" : "completed";
      store.setTaskStatus(task.id, next);
      show({ kind: "success", title: next === "completed" ? "Marked complete" : "Approved & started", body: task.title });
    } else if (a === "reassign") {
      reassign(it);
    } else if (a === "prepare" && it.villaId) {
      show({ kind: "ai", title: "Welcome prep started", body: `${it.villaName} · ${it.remaining ?? "final checks"}` });
    } else if (a === "track") {
      show({ kind: "ai", title: "Live tracking", body: it.assignee ? `${it.assignee.name} · ETA ${it.etaLabel ?? "—"}` : it.villaName });
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <ListChecks size={16} className="text-accent" />
        <h2 className="text-[15px] font-semibold text-ink">Operations Queue</h2>
        <span className="text-[12px] text-ink-4">{items.length} live</span>
      </div>
      <div className="space-y-3">
        <AnimatePresence initial={false} mode="popLayout">
          {items.length === 0 ? (
            <div className="rounded-[var(--radius-card)] border border-line bg-white/[0.012] px-5 py-10 text-center text-[13px] text-ink-3">
              The queue is clear. Every operation is handled.
            </div>
          ) : (
            items.map((it) => <QueueCard key={it.id} it={it} onAct={(a) => act(it, a)} phone={it.guestPhone} />)
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function QueueCard({ it, onAct, phone }: { it: QueueItem; onAct: (a: QueueAction) => void; phone: string | null }) {
  const [busy, setBusy] = useState<QueueAction | null>(null);
  const run = (a: QueueAction) => { setBusy(a); onAct(a); setTimeout(() => setBusy(null), 700); };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="card-spotlight panel-hover relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-white/[0.018]"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* status rail */}
      <div aria-hidden className="absolute inset-y-0 left-0 w-[3px]" style={{ background: it.hex, boxShadow: `0 0 14px ${it.hex}` }} />

      <div className="p-4 pl-5 sm:p-5 sm:pl-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: it.hex, boxShadow: `0 0 8px ${it.hex}` }} />
              <span className="truncate text-[15px] font-semibold text-ink">{it.villaName}</span>
              <span className="rounded-full border border-line px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wide" style={{ color: it.hex, borderColor: `${it.hex}44` }}>{it.priorityLabel}</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[13px] text-ink-2">
              <span className="font-medium text-ink">{it.title}</span>
              <span className="text-ink-4">· {it.category}</span>
            </div>
          </div>
          {it.etaLabel && (
            <div className="shrink-0 text-right">
              <div className="text-[10px] uppercase tracking-wider text-ink-4">ETA</div>
              <div className="flex items-center gap-1 text-[14px] font-semibold tabular-nums text-ink">
                {it.kind === "transfer" ? <Navigation size={12} className="text-accent" /> : <Clock size={12} className="text-ink-3" />}
                {it.etaLabel}
              </div>
            </div>
          )}
        </div>

        {/* assignee + progress */}
        {it.assignee && (
          <div className="mt-3 flex items-center gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[9px] font-semibold text-white" style={{ background: STATUS_META[it.assignee.status].hex }}>
              {it.assignee.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </span>
            <div className="min-w-0">
              <div className="truncate text-[12.5px] text-ink">{it.assignee.name}</div>
              <div className="flex items-center gap-1 text-[11px]" style={{ color: STATUS_META[it.assignee.status].hex }}>
                <User size={9} /> {STATUS_META[it.assignee.status].label}
              </div>
            </div>
            <div className="ml-auto flex w-28 items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div className="h-full rounded-full" style={{ background: it.hex }} initial={{ width: 0 }} animate={{ width: `${it.progress}%` }} transition={{ duration: 0.8, ease: [0.62, 0.04, 0.2, 1] }} />
              </div>
              <span className="text-[10.5px] tabular-nums text-ink-4">{it.progress}%</span>
            </div>
          </div>
        )}

        {/* checklist (arrivals) */}
        {it.checklist && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {it.checklist.map((c) => (
              <span key={c.label} className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11.5px]",
                c.done ? "border-line bg-white/[0.03] text-ink-2" : "border-warn/30 bg-warn/[0.08] text-warn")}>
                {c.done ? <Check size={11} className="text-ok" /> : <span className="h-1.5 w-1.5 rounded-full bg-warn" />} {c.label}
              </span>
            ))}
          </div>
        )}

        {/* AI explanation */}
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-accent/15 bg-accent/[0.05] px-3 py-2">
          <Sparkles size={13} className="mt-0.5 shrink-0 text-accent" />
          <span className="text-[12px] leading-relaxed text-ink-2">{it.ai}</span>
        </div>

        {/* actions */}
        <div className="mt-3 flex flex-wrap gap-2">
          {it.actions.includes("approve") && <ActionBtn primary onClick={() => run("approve")} busy={busy === "approve"}><CircleCheck size={14} /> Approve</ActionBtn>}
          {it.actions.includes("reassign") && <ActionBtn onClick={() => run("reassign")} busy={busy === "reassign"}><ArrowRightLeft size={14} /> Reassign</ActionBtn>}
          {it.actions.includes("prepare") && <ActionBtn primary onClick={() => run("prepare")} busy={busy === "prepare"}><Sparkles size={14} /> Prepare now</ActionBtn>}
          {it.actions.includes("track") && <ActionBtn primary onClick={() => run("track")} busy={busy === "track"}><Navigation size={14} /> Track</ActionBtn>}
          {it.actions.includes("call") && (
            phone
              ? <a href={`tel:${phone}`} className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white/[0.02] px-3 py-1.5 text-[12.5px] font-medium text-ink-2 transition-colors hover:text-ink"><Phone size={14} /> Call guest</a>
              : <ActionBtn onClick={() => {}}><Phone size={14} /> Call guest</ActionBtn>
          )}
          {it.villaId && (
            <a href={`/villas/${it.villaId}`} className="ml-auto inline-flex items-center gap-1 self-center text-[12px] text-ink-4 transition-colors hover:text-ink-2"><MapPin size={12} /> {it.villaName}</a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ActionBtn({ children, onClick, primary, busy }: { children: React.ReactNode; onClick: () => void; primary?: boolean; busy?: boolean }) {
  return (
    <button onClick={onClick} disabled={busy}
      className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-all disabled:opacity-70",
        primary ? "border border-accent/40 bg-accent/12 text-accent hover:bg-accent/18" : "border border-line bg-white/[0.02] text-ink-2 hover:text-ink")}>
      {busy ? <Check size={14} /> : children}
    </button>
  );
}
