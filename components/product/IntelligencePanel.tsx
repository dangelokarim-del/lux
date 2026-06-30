"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, Sparkles, UserPlus, ArrowRightCircle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui";
import { LiveNumber } from "@/components/landing/anim/LiveNumber";
import { useDatabase } from "@/lib/store/hooks";
import { activityFeed, avgResponseMinutes, fmtDuration, isToday, occupancyRate, type ActivityKind } from "@/lib/store/insights";
import { statusMeta } from "@/lib/domain";
import { tones } from "@/lib/tone";
import { timeAgo } from "./format";

const ICON: Record<ActivityKind, typeof MessageSquare> = {
  message: MessageSquare,
  ai: Sparkles,
  assignment: UserPlus,
  status: ArrowRightCircle,
  completed: CheckCircle2,
};
const KIND_TONE: Record<ActivityKind, keyof typeof tones> = {
  message: "ok",
  ai: "accent",
  assignment: "neutral",
  status: "warn",
  completed: "ok",
};

export function IntelligencePanel() {
  const db = useDatabase();

  const { occupancy, avgResp, completedToday, feed } = useMemo(() => {
    return {
      occupancy: occupancyRate(db),
      avgResp: avgResponseMinutes(db.tasks, db.notes),
      completedToday: db.tasks.filter((t) => t.status === "completed" && t.completedAt && isToday(t.completedAt)).length,
      feed: activityFeed(db, 8),
    };
  }, [db]);

  return (
    <div className="space-y-4">
      {/* occupancy ring */}
      <Card className="p-5">
        <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-3">Today&apos;s occupancy</div>
        <div className="mt-3 flex items-center gap-4">
          <Ring value={occupancy} />
          <div className="min-w-0">
            <div className="text-[28px] font-semibold leading-none tracking-tight tabular-nums text-ink">
              <LiveNumber value={occupancy} pad={1} duration={0.9} />%
            </div>
            <div className="mt-1.5 text-[12px] text-ink-3">
              {db.properties.filter((p) => p.status === "occupied").length} of {db.properties.length} villas occupied
            </div>
          </div>
        </div>
      </Card>

      {/* two compact stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-[0.1em] text-ink-3">Avg response</div>
          <div className="mt-2 text-[22px] font-semibold tabular-nums text-ink">{fmtDuration(avgResp)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] uppercase tracking-[0.1em] text-ink-3">Completed today</div>
          <div className="mt-2 text-[22px] font-semibold tabular-nums text-ok">
            <LiveNumber value={completedToday} pad={1} duration={0.9} />
          </div>
        </Card>
      </div>

      {/* live activity */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <span className="text-[13px] font-medium text-ink">Live activity</span>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-ink-3">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-ok opacity-60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-ok" />
            </span>
            Live
          </span>
        </div>
        <div className="max-h-[420px] space-y-0 overflow-y-auto px-2 py-2">
          <AnimatePresence initial={false}>
            {feed.map((e) => {
              const Icon = ICON[e.kind];
              const c = tones[KIND_TONE[e.kind]];
              return (
                <motion.div
                  key={e.id}
                  layout
                  initial={{ opacity: 0, y: -8, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(4px)" }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.025]"
                >
                  <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${c.bg} ${c.text}`}>
                    <Icon size={13} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[12.5px] text-ink">{e.text}</span>
                      <span className="shrink-0 text-[10.5px] tabular-nums text-ink-4">{timeAgo(e.at)}</span>
                    </div>
                    {e.sub && <div className="truncate text-[11.5px] text-ink-3">{e.sub}</div>}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          {feed.length === 0 && <p className="px-2 py-8 text-center text-[12.5px] text-ink-4">No activity yet.</p>}
        </div>
      </Card>
    </div>
  );
}

/** Minimal monochrome progress ring. */
function Ring({ value }: { value: number }) {
  const r = 26;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - value / 100);
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0 -rotate-90">
      <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
      <motion.circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: off }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}
