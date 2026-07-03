"use client";

/**
 * AI prediction cards — the operation's near future, surfaced before problems
 * happen. Each card carries a confidence and a horizon so the manager can weigh
 * it. Deliberately calm and premium — foresight, not alarms.
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Wrench, UserRound, Users, ActivitySquare, TrendingUp } from "lucide-react";
import { useDatabase } from "@/lib/store/hooks";
import { computePredictions, type Prediction } from "@/lib/live/predictions";

const KIND = {
  maintenance: { Icon: Wrench, hex: "#f5b53d" },
  guest: { Icon: UserRound, hex: "#2e7dff" },
  staffing: { Icon: Users, hex: "#a78bfa" },
  anomaly: { Icon: ActivitySquare, hex: "#ff5c5c" },
} as const;

export function PredictionCards() {
  const db = useDatabase();
  const predictions = useMemo(() => computePredictions(db), [db]);
  if (!predictions.length) return null;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-[13px] font-medium text-ink">
        <TrendingUp size={15} className="text-accent" /> AI predictions
        <span className="text-[11px] font-normal text-ink-4">· before it happens</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {predictions.map((p, i) => <Card key={p.id} p={p} index={i} />)}
      </div>
    </div>
  );
}

function Card({ p, index }: { p: Prediction; index: number }) {
  const { Icon, hex } = KIND[p.kind];
  const pct = Math.round(p.confidence * 100);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.62, 0.04, 0.2, 1] }}
      className="card-spotlight panel-hover relative overflow-hidden rounded-[var(--radius-card)] border border-line bg-white/[0.015] p-4"
    >
      <div aria-hidden className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full opacity-25 blur-2xl" style={{ background: hex }} />
      <div className="flex items-center justify-between">
        <span className="grid h-8 w-8 place-items-center rounded-lg" style={{ background: `${hex}1f`, color: hex }}><Icon size={16} /></span>
        <span className="rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink-4">{p.horizon}</span>
      </div>
      <div className="mt-3 text-[13.5px] font-medium leading-snug text-ink">{p.title}</div>
      <div className="mt-1.5 text-[12px] leading-relaxed text-ink-3">{p.detail}</div>
      <div className="mt-3 flex items-center gap-2">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: hex }} />
        </div>
        <span className="text-[11px] tabular-nums text-ink-3">{pct}% likely</span>
      </div>
    </motion.div>
  );
}
