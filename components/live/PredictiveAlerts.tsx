"use client";

/**
 * Predictive Alerts — LUXA looking ahead. Each alert carries a probability, the
 * business impact and a recommended action, so the manager can pre-empt problems
 * instead of reacting to them. Derived from real patterns in the store.
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Radar, Wrench, Users, UserRound, ActivitySquare, ArrowRight } from "lucide-react";
import { useDatabase } from "@/lib/store/hooks";
import { computePredictions, type Prediction } from "@/lib/live/predictions";

const KIND = {
  maintenance: { Icon: Wrench, hex: "#f5b53d", impact: "Guest-facing failure risk · unplanned callout cost" },
  staffing: { Icon: Users, hex: "#a78bfa", impact: "Slower response · overtime risk" },
  guest: { Icon: UserRound, hex: "#2e7dff", impact: "Guest satisfaction · repeat-booking upside" },
  anomaly: { Icon: ActivitySquare, hex: "#ff5c5c", impact: "Recurring cost · reputation risk" },
} as const;

const ACTION: Record<Prediction["kind"], string> = {
  maintenance: "Schedule a preventative visit",
  staffing: "Line up cover / shift start times",
  guest: "Offer proactively over WhatsApp",
  anomaly: "Investigate the root cause",
};

export function PredictiveAlerts() {
  const db = useDatabase();
  const predictions = useMemo(() => computePredictions(db), [db]);

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-white/[0.012] p-4">
      <div className="mb-3 flex items-center gap-2 text-[13px] font-medium text-ink">
        <Radar size={15} className="text-accent" /> Predictive Alerts
        <span className="ml-auto text-[11px] text-ink-4">next 7 days</span>
      </div>
      {predictions.length === 0 ? (
        <div className="rounded-xl border border-line bg-white/[0.01] px-3 py-6 text-center text-[12.5px] text-ink-4">No risks on the horizon.</div>
      ) : (
        <div className="space-y-2.5">
          {predictions.map((p, i) => <AlertCard key={p.id} p={p} index={i} />)}
        </div>
      )}
    </div>
  );
}

function AlertCard({ p, index }: { p: Prediction; index: number }) {
  const meta = KIND[p.kind];
  const pct = Math.round(p.confidence * 100);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.45, ease: [0.62, 0.04, 0.2, 1] }}
      className="rounded-xl border border-line bg-white/[0.015] p-3"
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ background: `${meta.hex}1f`, color: meta.hex }}><meta.Icon size={14} /></span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="text-[13px] font-medium leading-snug text-ink">{p.title}</div>
            <span className="shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium tabular-nums" style={{ borderColor: `${meta.hex}55`, color: meta.hex }}>{pct}%</span>
          </div>
          <div className="mt-1 text-[11.5px] leading-relaxed text-ink-3">{p.detail}</div>
        </div>
      </div>
      {/* probability meter */}
      <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div className="h-full rounded-full" style={{ background: meta.hex }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: index * 0.05 }} />
      </div>
      <div className="mt-2 grid grid-cols-1 gap-1 text-[11px]">
        <div className="text-ink-4"><span className="text-ink-3">Impact:</span> {meta.impact}</div>
        <div className="flex items-center gap-1 font-medium text-accent"><ArrowRight size={11} /> {ACTION[p.kind]}</div>
      </div>
    </motion.div>
  );
}
