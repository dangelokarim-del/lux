"use client";

/**
 * The AI Command Center — the top of the dashboard. Instead of "what happened",
 * it answers "what should I do next": a live pulse of the day plus concrete,
 * one-click AI recommendations derived from the real operation. Approving a
 * recommendation performs the actual action (e.g. a reassignment) and the board
 * updates live. This is what makes LUXA feel like it works while you sleep.
 */
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, TriangleAlert, PlaneLanding, MessageCircle, ArrowRight, Check, X, ShieldAlert, Radar, Clock, Users } from "lucide-react";
import { Card, buttonVariants } from "@/components/ui";
import { LiveNumber } from "@/components/landing/anim/LiveNumber";
import { useDatabase, useLuxa } from "@/lib/store/hooks";
import { useToast } from "@/components/product/Toast";
import { computeAlerts, computePulse, computeRecommendations, greeting, type OpsAlert, type Recommendation } from "@/lib/store/ai-insights";
import { cn } from "@/lib/utils";

const OPERATOR_NAME = "Karim";
const ease = [0.4, 0, 0.2, 1] as const;

const KIND_ICON = { reassign: TriangleAlert, arrival: PlaneLanding, proactive: MessageCircle, escalation: ShieldAlert } as const;
const ALERT_ICON = { arrival: PlaneLanding, urgent: TriangleAlert, dept_overload: Users, staff_overload: Users, stale: Clock } as const;

export function AiCommandCenter() {
  const db = useDatabase();
  const store = useLuxa();
  const { show } = useToast();
  const [done, setDone] = useState<Set<string>>(new Set());

  const pulse = useMemo(() => computePulse(db), [db]);
  const recs = useMemo(() => computeRecommendations(db).filter((r) => !done.has(r.id)), [db, done]);
  const alerts = useMemo(() => computeAlerts(db), [db]);

  function act(rec: Recommendation) {
    if ((rec.kind === "reassign" || rec.kind === "escalation") && rec.taskId && rec.toStaffId) {
      store.assignTask(rec.taskId, rec.toStaffId);
      store.addNote(rec.taskId, rec.kind === "escalation"
        ? `LUXA escalated to ${rec.toStaffName} — no ${rec.title.replace("No ", "").replace(" staff available right now.", "")} staff on shift.`
        : `LUXA rebalanced to ${rec.toStaffName} to keep the team even.`, { name: "LUXA AI" });
      show({ kind: "ai", title: rec.kind === "escalation" ? "Escalated to manager" : "Rebalanced by AI", body: `Assigned to ${rec.toStaffName}` });
    } else if (rec.kind === "arrival") {
      show({ kind: "ai", title: "Arrival prep started", body: rec.title.replace(" guest arrives soon.", "") });
    } else if (rec.kind === "proactive") {
      show({ kind: "ai", title: "WhatsApp drafted", body: `Proactive offer to ${rec.guestName}` });
    }
    setDone((d) => new Set(d).add(rec.id));
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
      <Card className="relative overflow-hidden p-5 sm:p-6">
        {/* soft intelligence glow */}
        <div aria-hidden className="glow-accent pointer-events-none absolute -right-16 -top-20 h-56 w-56 opacity-60 blur-2xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-stretch">
          {/* greeting + pulse */}
          <div className="lg:w-[300px] lg:shrink-0 lg:border-r lg:border-line lg:pr-6">
            <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-accent">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              LUXA AI · monitoring
            </div>
            <h2 className="mt-2.5 text-[22px] font-semibold tracking-[-0.02em] text-ink sm:text-[24px]">
              {greeting()}, {OPERATOR_NAME}.
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Pulse label="Handled today" value={pulse.handled} tone="ink" />
              <Pulse label="Auto-solved" value={pulse.solvedAuto} tone="ok" />
              <Pulse label="Need approval" value={pulse.needApproval} tone="accent" />
              <Pulse label="Need you" value={pulse.needAttention} tone="warn" />
            </div>
          </div>

          {/* recommendations */}
          <div className="min-w-0 flex-1">
            <div className="mb-2.5 flex items-center gap-2 text-[12px] font-medium text-ink-2">
              <Sparkles size={14} className="text-accent" /> AI recommendations
            </div>
            <div className="space-y-2.5">
              <AnimatePresence mode="popLayout" initial={false}>
                {recs.length === 0 ? (
                  <motion.div
                    key="clear"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2.5 rounded-[var(--radius-control)] border border-line bg-white/[0.02] px-4 py-4 text-[13.5px] text-ink-3"
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-ok/12 text-ok"><Check size={15} /></span>
                    All clear — the AI has everything under control.
                  </motion.div>
                ) : (
                  recs.map((rec) => <RecCard key={rec.id} rec={rec} onAct={() => act(rec)} onDismiss={() => setDone((d) => new Set(d).add(rec.id))} />)
                )}
              </AnimatePresence>
            </div>

            {alerts.length > 0 && (
              <div className="mt-4 border-t border-line pt-3.5">
                <div className="mb-2 flex items-center gap-2 text-[12px] font-medium text-ink-2">
                  <Radar size={14} className="text-accent" /> Predictive alerts
                </div>
                <div className="flex flex-wrap gap-2">
                  {alerts.map((a) => <AlertChip key={a.id} alert={a} />)}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function AlertChip({ alert }: { alert: OpsAlert }) {
  const Icon = ALERT_ICON[alert.kind];
  const tone =
    alert.severity === "critical" ? "border-urgent/30 bg-urgent/[0.07] text-urgent"
    : alert.severity === "warn" ? "border-amber-500/25 bg-amber-500/[0.06] text-amber-300"
    : "border-line bg-white/[0.03] text-ink-2";
  return (
    <span title={alert.detail} className={cn("inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px]", tone)}>
      <Icon size={12} className="shrink-0" />
      <span className="truncate">{alert.title}</span>
    </span>
  );
}

function Pulse({ label, value, tone }: { label: string; value: number; tone: "ink" | "ok" | "warn" | "accent" }) {
  const color = tone === "ok" ? "text-ok" : tone === "warn" ? "text-urgent" : tone === "accent" ? "text-accent" : "text-ink";
  return (
    <div className="rounded-[var(--radius-control)] border border-line bg-white/[0.02] px-3 py-2.5">
      <div className={cn("text-[22px] font-semibold leading-none tabular-nums", color)}>
        <LiveNumber value={value} pad={1} duration={0.9} />
      </div>
      <div className="mt-1 text-[10.5px] uppercase tracking-wider text-ink-4">{label}</div>
    </div>
  );
}

function RecCard({ rec, onAct, onDismiss }: { rec: Recommendation; onAct: () => void; onDismiss: () => void }) {
  const Icon = KIND_ICON[rec.kind];
  const warn = rec.severity === "warn";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      className="group relative flex items-start gap-3 rounded-[var(--radius-control)] border border-line bg-white/[0.02] px-4 py-3.5 transition-colors hover:bg-white/[0.035]"
    >
      <span className={cn("mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg", warn ? "bg-urgent/12 text-urgent" : "bg-accent/12 text-accent")}>
        <Icon size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium leading-snug text-ink">{rec.title}</div>
        <div className="mt-0.5 text-[13px] text-ink-3">{rec.detail}</div>
        {rec.checklist && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {rec.checklist.map((c) => (
              <span key={c} className="inline-flex items-center gap-1 rounded-full border border-line bg-white/[0.03] px-2 py-1 text-[11.5px] text-ink-2">
                <Check size={11} className="text-ok" /> {c}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button onClick={onAct} className={cn(buttonVariants({ variant: "accent", size: "sm" }), "gap-1")}>
          {rec.actionLabel} <ArrowRight size={13} />
        </button>
        <button onClick={onDismiss} aria-label="Dismiss" className="grid h-7 w-7 place-items-center rounded-md text-ink-4 opacity-0 transition-opacity hover:text-ink-2 group-hover:opacity-100">
          <X size={14} />
        </button>
      </div>
    </motion.div>
  );
}
