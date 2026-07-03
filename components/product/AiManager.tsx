"use client";

/**
 * The floating AI Manager — always visible, on every page. It continuously
 * monitors the operation and surfaces the same proactive recommendations as the
 * command center in a compact, one-click panel. Collapsed, it's a calm pulsing
 * orb with a badge; expanded, it's the AI quietly running the business with you.
 */
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, TriangleAlert, PlaneLanding, MessageCircle, ArrowRight, Check, X, ShieldAlert, SendHorizonal, MessageSquare, ListChecks } from "lucide-react";
import { buttonVariants } from "@/components/ui";
import { useDatabase, useLuxa } from "@/lib/store/hooks";
import { useToast } from "@/components/product/Toast";
import { computeRecommendations, type Recommendation } from "@/lib/store/ai-insights";
import { deriveLiveStaff } from "@/lib/live/engine";
import { askCopilot, COPILOT_SUGGESTIONS, type CopilotAnswer } from "@/lib/live/copilot";
import { cn } from "@/lib/utils";

const KIND_ICON = { reassign: TriangleAlert, arrival: PlaneLanding, proactive: MessageCircle, escalation: ShieldAlert } as const;
const ease = [0.4, 0, 0.2, 1] as const;

type Mode = "watch" | "ask";

export function AiManager() {
  const db = useDatabase();
  const store = useLuxa();
  const { show } = useToast();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("watch");
  const [done, setDone] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<CopilotAnswer | null>(null);

  const recs = useMemo(() => computeRecommendations(db).filter((r) => !done.has(r.id)), [db, done]);
  const count = recs.length;

  function submit(q: string) {
    const text = q.trim();
    if (!text) return;
    setAnswer(askCopilot(text, db, deriveLiveStaff(db)));
    setQuery("");
  }

  function act(rec: Recommendation) {
    if ((rec.kind === "reassign" || rec.kind === "escalation") && rec.taskId && rec.toStaffId) {
      store.assignTask(rec.taskId, rec.toStaffId);
      store.addNote(rec.taskId, rec.kind === "escalation" ? `LUXA escalated to ${rec.toStaffName}.` : `LUXA rebalanced to ${rec.toStaffName}.`, { name: "LUXA AI" });
      show({ kind: "ai", title: rec.kind === "escalation" ? "Escalated to manager" : "Rebalanced by AI", body: `Assigned to ${rec.toStaffName}` });
    } else if (rec.kind === "arrival") {
      show({ kind: "ai", title: "Arrival prep started" });
    } else {
      show({ kind: "ai", title: "WhatsApp drafted", body: rec.guestName });
    }
    setDone((d) => new Set(d).add(rec.id));
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 lg:bottom-6 lg:right-6">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="mb-3 w-[min(360px,calc(100vw-2rem))] origin-bottom-right overflow-hidden rounded-2xl border border-line bg-[#0b0d12]/95 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.85)] backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-accent/15 text-accent"><Sparkles size={14} /></span>
                <div className="text-[13px] font-medium text-ink">AI Copilot</div>
                <span className="flex items-center gap-1 text-[11px] text-ink-3">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inset-0 animate-ping rounded-full bg-ok opacity-60" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-ok" />
                  </span>
                  live
                </span>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close" className="grid h-7 w-7 place-items-center rounded-md text-ink-4 hover:text-ink-2"><X size={15} /></button>
            </div>

            {/* mode switch */}
            <div className="flex gap-1 border-b border-line px-3 py-2">
              <ModeTab icon={ListChecks} label="Watch" count={count} active={mode === "watch"} onClick={() => setMode("watch")} />
              <ModeTab icon={MessageSquare} label="Ask" active={mode === "ask"} onClick={() => setMode("ask")} />
            </div>

            {mode === "watch" ? (
              <div className="max-h-[52vh] space-y-2 overflow-y-auto p-3">
                <AnimatePresence mode="popLayout" initial={false}>
                  {count === 0 ? (
                    <motion.div key="clear" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2.5 rounded-xl border border-line bg-white/[0.02] px-3.5 py-4 text-[13px] text-ink-3">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-ok/12 text-ok"><Check size={15} /></span>
                      Everything is running smoothly.
                    </motion.div>
                  ) : (
                    recs.map((rec) => {
                      const Icon = KIND_ICON[rec.kind];
                      const warn = rec.severity === "warn";
                      return (
                        <motion.div
                          key={rec.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ type: "spring", stiffness: 320, damping: 30 }}
                          className="rounded-xl border border-line bg-white/[0.02] p-3"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className={cn("mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg", warn ? "bg-urgent/12 text-urgent" : "bg-accent/12 text-accent")}><Icon size={14} /></span>
                            <div className="min-w-0 flex-1">
                              <div className="text-[13px] font-medium leading-snug text-ink">{rec.title}</div>
                              <div className="mt-0.5 text-[12px] text-ink-3">{rec.detail}</div>
                            </div>
                          </div>
                          <div className="mt-2.5 flex justify-end">
                            <button onClick={() => act(rec)} className={cn(buttonVariants({ variant: "accent", size: "sm" }), "gap-1")}>{rec.actionLabel} <ArrowRight size={12} /></button>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex max-h-[52vh] flex-col">
                <div className="min-h-[120px] flex-1 space-y-2.5 overflow-y-auto p-3">
                  {answer ? (
                    <motion.div key={answer.title + answer.lines[0]} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("rounded-xl border p-3", answer.empty ? "border-line bg-white/[0.02]" : "border-accent/25 bg-accent/[0.06]")}>
                      <div className="flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.12em] text-accent"><Sparkles size={12} /> LUXA</div>
                      <div className="mt-1.5 text-[13.5px] font-medium text-ink">{answer.title}</div>
                      <div className="mt-1.5 space-y-1">
                        {answer.lines.map((l, i) => <div key={i} className="text-[12.5px] leading-relaxed text-ink-2">{l}</div>)}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="rounded-xl border border-line bg-white/[0.02] p-3 text-[12.5px] text-ink-3">
                      Ask me anything about the operation — I answer from live data.
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {COPILOT_SUGGESTIONS.map((s) => (
                      <button key={s} onClick={() => submit(s)} className="rounded-full border border-line bg-white/[0.03] px-2.5 py-1 text-[11.5px] text-ink-2 transition-colors hover:border-line-2 hover:text-ink">{s}</button>
                    ))}
                  </div>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); submit(query); }} className="flex items-center gap-2 border-t border-line p-2.5">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask the copilot…"
                    className="h-9 min-w-0 flex-1 rounded-[var(--radius-control)] border border-line-2 bg-black/30 px-3 text-[13px] text-ink outline-none placeholder:text-ink-4 focus:border-accent"
                  />
                  <button type="submit" aria-label="Ask" className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-control)] bg-accent text-white transition-transform active:scale-95"><SendHorizonal size={15} /></button>
                </form>
              </div>
            )}

            <div className="border-t border-line px-4 py-2.5 text-[11px] text-ink-4">
              Watching {db.properties.length} {db.properties.length === 1 ? "property" : "properties"} · {db.staff.length} staff · {db.tasks.filter((t) => t.status !== "completed" && t.status !== "cancelled").length} open
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* the orb */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        aria-label="AI Copilot"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.2, ease }}
        className="relative ml-auto flex h-14 items-center gap-2.5 rounded-full border border-accent/30 bg-[linear-gradient(180deg,#123056,#0b1626)] pl-3.5 pr-4 shadow-[0_16px_40px_-12px_rgba(46,125,255,0.5)]"
      >
        <span className="relative grid h-8 w-8 place-items-center rounded-full bg-accent/20 text-accent">
          <motion.span aria-hidden className="absolute inset-0 rounded-full ring-1 ring-accent/50" animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.5, 1] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }} />
          <Sparkles size={16} />
        </span>
        <span className="text-[13px] font-medium text-white">AI Copilot</span>
        {count > 0 && (
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[11px] font-semibold tabular-nums text-white">{count}</span>
        )}
      </motion.button>
    </div>
  );
}

function ModeTab({ icon: Icon, label, count, active, onClick }: { icon: typeof MessageSquare; label: string; count?: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-control)] px-3 py-1.5 text-[12.5px] font-medium transition-colors",
        active ? "bg-white/[0.06] text-ink" : "text-ink-3 hover:text-ink-2")}
    >
      <Icon size={13} /> {label}
      {count != null && count > 0 && <span className="grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">{count}</span>}
    </button>
  );
}
