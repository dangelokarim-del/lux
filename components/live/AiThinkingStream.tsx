"use client";

/**
 * The AI thinking stream — LUXA reasoning out loud, continuously. Each thought
 * shows the WHY, not just the what, and (when there's a concrete move) an action
 * the manager can take. Includes the signature "hold vs reassign" call.
 */
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, TriangleAlert, ShieldAlert, PlaneLanding, Hourglass, ArrowRight } from "lucide-react";
import { useLuxa } from "@/lib/store/hooks";
import { useToast } from "@/components/product/Toast";
import type { AiThought } from "@/lib/live/engine";
import { cn } from "@/lib/utils";

const MONITOR_LINES = [
  "checking staff availability",
  "checking workload balance",
  "checking upcoming arrivals",
  "scanning urgent requests",
  "estimating routes & ETAs",
  "calculating best assignment",
  "reviewing guest preferences",
];

function MonitorTicker() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setI((v) => (v + 1) % MONITOR_LINES.length), 2200);
    return () => clearInterval(iv);
  }, []);
  return (
    <div className="mb-3 overflow-hidden rounded-xl border border-accent/20 bg-accent/[0.05] px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-70" />
          <span className="relative h-1.5 w-1.5 rounded-full bg-accent" />
        </span>
        <span className="text-[11.5px] font-medium text-ink">LUXA AI is monitoring</span>
      </div>
      <div className="relative mt-1 h-[15px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 flex items-center gap-1.5 text-[11.5px] text-accent/90"
          >
            <span className="font-mono text-accent/60">›</span> {MONITOR_LINES[i]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

const SEV = {
  critical: { hex: "#ff5c5c", Icon: ShieldAlert },
  warn: { hex: "#f5b53d", Icon: TriangleAlert },
  info: { hex: "#2e7dff", Icon: Brain },
  calm: { hex: "#4ad48a", Icon: PlaneLanding },
} as const;

export function AiThinkingStream({ thoughts }: { thoughts: AiThought[] }) {
  const store = useLuxa();
  const { show } = useToast();

  function act(t: AiThought) {
    const a = t.action; if (!a) return;
    if ((a.kind === "reassign" || a.kind === "escalate") && a.taskId && a.toStaffId) {
      store.assignTask(a.taskId, a.toStaffId);
      store.addNote(a.taskId, `${a.kind === "escalate" ? "Escalated" : "Rebalanced"} by LUXA — ${t.reasoning}`, { name: "LUXA AI" });
      show({ kind: "ai", title: a.kind === "escalate" ? "Escalated" : "Rebalanced by AI", body: a.label });
    } else if (a.kind === "wait") {
      show({ kind: "ai", title: "Holding the queue", body: "LUXA will watch and reassign only if it slips." });
    } else if (a.kind === "prepare") {
      show({ kind: "ai", title: "Welcome prep started", body: t.headline.replace(" guest arriving", "") });
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center gap-2">
        <span className="relative grid h-6 w-6 place-items-center rounded-md bg-accent/15 text-accent">
          <Brain size={14} />
          <span aria-hidden className="absolute inset-0 animate-ping rounded-md ring-1 ring-accent/40" />
        </span>
        <div className="text-[13px] font-medium text-ink">AI is thinking</div>
        <span className="ml-auto flex items-center gap-1 text-[11px] text-ink-4">
          <span className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <motion.span key={i} className="h-1 w-1 rounded-full bg-accent" animate={{ opacity: [0.25, 1, 0.25] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
            ))}
          </span>
          live
        </span>
      </div>

      <MonitorTicker />

      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-0.5">
        <AnimatePresence mode="popLayout" initial={false}>
          {thoughts.length === 0 ? (
            <motion.div key="calm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-xl border border-line bg-white/[0.015] px-3.5 py-4 text-[13px] text-ink-3">
              Everything is balanced. LUXA is monitoring shifts, arrivals and workload — nothing needs you right now.
            </motion.div>
          ) : (
            thoughts.map((t) => {
              const sev = SEV[t.severity];
              const waiting = t.action?.kind === "wait";
              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="rounded-xl border border-line bg-white/[0.02] p-3"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ background: `${sev.hex}1f`, color: sev.hex }}>
                      {waiting ? <Hourglass size={14} /> : <sev.Icon size={14} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium leading-snug text-ink">{t.headline}</div>
                      <div className="mt-1 text-[12px] leading-relaxed text-ink-3">{t.reasoning}</div>
                      {t.recommendation && <div className="mt-1.5 text-[12px] leading-relaxed" style={{ color: sev.hex }}>→ {t.recommendation}</div>}
                    </div>
                  </div>
                  {t.action && (
                    <div className="mt-2.5 flex justify-end">
                      <button onClick={() => act(t)} className={cn("inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[12px] font-medium transition-colors",
                        waiting ? "border-line text-ink-2 hover:bg-white/[0.05]" : "border-accent/40 bg-accent/10 text-accent hover:bg-accent/15")}>
                        {t.action.label} {!waiting && <ArrowRight size={12} />}
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
