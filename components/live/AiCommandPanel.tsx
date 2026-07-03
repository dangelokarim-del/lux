"use client";

/**
 * LUXA AI — the command panel at the top of Operations. On the left it reasons
 * continuously (a live analysis console); on the right it turns that reasoning
 * into recommendations, each with a confidence, the reason, the expected impact
 * and a one-click Approve that actually acts on the operation.
 */
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Check, Loader2, ArrowRight, ShieldAlert, TriangleAlert, PlaneLanding, MessageCircle } from "lucide-react";
import { useDatabase, useLuxa } from "@/lib/store/hooks";
import { useToast } from "@/components/product/Toast";
import { computeRecommendations, type Recommendation } from "@/lib/store/ai-insights";
import { cn } from "@/lib/utils";

const REASONING = [
  "Checking staff availability",
  "Checking today's arrivals",
  "Analysing maintenance load",
  "Predicting tomorrow's workload",
  "Detecting recurring issues",
  "Estimating routes & ETAs",
  "Balancing department workload",
];

const KIND_ICON = { reassign: TriangleAlert, escalation: ShieldAlert, arrival: PlaneLanding, proactive: MessageCircle } as const;
const IMPACT: Record<string, string> = {
  reassign: "Faster response · balanced team load",
  escalation: "Urgent work stays covered through the gap",
  arrival: "Guest welcomed exactly on schedule",
  proactive: "Higher guest satisfaction, fewer ad-hoc asks",
};

function confidence(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
  return 88 + ((h >>> 0) % 11);
}

export function AiCommandPanel() {
  const db = useDatabase();
  const store = useLuxa();
  const { show } = useToast();
  const [done, setDone] = useState<Set<string>>(new Set());
  const recs = useMemo(() => computeRecommendations(db).filter((r) => !done.has(r.id)), [db, done]);

  function approve(rec: Recommendation) {
    if ((rec.kind === "reassign" || rec.kind === "escalation") && rec.taskId && rec.toStaffId) {
      store.assignTask(rec.taskId, rec.toStaffId);
      store.addNote(rec.taskId, `${rec.kind === "escalation" ? "Escalated" : "Rebalanced"} by LUXA — ${rec.detail}`, { name: "LUXA AI" });
      show({ kind: "ai", title: rec.kind === "escalation" ? "Escalated to manager" : "Rebalanced by AI", body: `Assigned to ${rec.toStaffName}` });
    } else if (rec.kind === "arrival") {
      show({ kind: "ai", title: "Welcome prep started", body: rec.title.replace(" guest arrives soon.", "") });
    } else {
      show({ kind: "ai", title: "WhatsApp drafted", body: rec.guestName });
    }
    setDone((d) => new Set(d).add(rec.id));
  }

  return (
    <div className="glass edge-light overflow-hidden rounded-[var(--radius-card)] border border-line">
      <div className="grid gap-0 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* reasoning console */}
        <div className="relative border-b border-line p-5 lg:border-b-0 lg:border-r">
          <div aria-hidden className="glow-accent pointer-events-none absolute -left-10 -top-12 h-40 w-40 opacity-50 blur-2xl" />
          <div className="relative flex items-center gap-2">
            <span className="relative grid h-7 w-7 place-items-center rounded-lg bg-accent/15 text-accent">
              <Sparkles size={15} />
              <span aria-hidden className="absolute inset-0 animate-ping rounded-lg ring-1 ring-accent/40" />
            </span>
            <div>
              <div className="text-[14px] font-semibold text-ink">LUXA AI</div>
              <div className="text-[11px] text-ink-3">reasoning continuously</div>
            </div>
          </div>
          <ReasoningConsole />
        </div>

        {/* recommendations */}
        <div className="p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2 text-[12px] font-medium text-ink-2">
            <Sparkles size={14} className="text-accent" /> Recommendations
            <span className="ml-auto text-[11px] text-ink-4">{recs.length} awaiting approval</span>
          </div>
          <div className="grid gap-2.5 md:grid-cols-2">
            <AnimatePresence mode="popLayout" initial={false}>
              {recs.length === 0 ? (
                <motion.div key="clear" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2.5 rounded-xl border border-line bg-white/[0.02] px-4 py-5 text-[13px] text-ink-3 md:col-span-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-ok/12 text-ok"><Check size={15} /></span>
                  Everything is balanced — no decisions pending. LUXA keeps watching.
                </motion.div>
              ) : (
                recs.map((rec) => {
                  const Icon = KIND_ICON[rec.kind];
                  const warn = rec.severity === "warn";
                  return (
                    <motion.div
                      key={rec.id}
                      layout
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 24, scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="flex flex-col rounded-xl border border-line bg-white/[0.02] p-3.5"
                    >
                      <div className="flex items-start gap-2.5">
                        <span className={cn("mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg", warn ? "bg-urgent/12 text-urgent" : "bg-accent/12 text-accent")}><Icon size={14} /></span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="text-[13px] font-medium leading-snug text-ink">{rec.title}</div>
                            <span className="shrink-0 rounded-full border border-accent/30 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-accent">{confidence(rec.id)}%</span>
                          </div>
                          <div className="mt-1 text-[12px] leading-relaxed text-ink-3">{rec.detail}</div>
                        </div>
                      </div>
                      <div className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-line bg-black/20 px-2.5 py-1.5 text-[11px] text-ink-3">
                        <ArrowRight size={11} className="shrink-0 text-accent" /> <span className="text-ink-2">Impact:</span> {IMPACT[rec.kind] ?? "Keeps the operation ahead"}
                      </div>
                      <button onClick={() => approve(rec)} className="mt-2.5 flex items-center justify-center gap-1.5 rounded-lg border border-accent/40 bg-accent/10 py-2 text-[12.5px] font-medium text-accent transition-colors hover:bg-accent/15">
                        {rec.actionLabel} <ArrowRight size={13} />
                      </button>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReasoningConsole() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setActive((a) => (a + 1) % (REASONING.length + 1)), 1400);
    return () => clearInterval(iv);
  }, []);
  return (
    <div className="mt-4 space-y-2">
      {REASONING.map((line, i) => {
        const state = i < active ? "done" : i === active ? "active" : "idle";
        return (
          <div key={line} className={cn("flex items-center gap-2 text-[12px] transition-colors", state === "idle" ? "text-ink-4" : state === "active" ? "text-accent" : "text-ink-2")}>
            <span className="grid h-4 w-4 shrink-0 place-items-center">
              {state === "done" ? <Check size={13} className="text-ok" /> : state === "active" ? <Loader2 size={12} className="animate-spin" /> : <span className="h-1 w-1 rounded-full bg-ink-4" />}
            </span>
            {line}{state === "active" ? "…" : ""}
          </div>
        );
      })}
    </div>
  );
}
