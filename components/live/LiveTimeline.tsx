"use client";

/**
 * The operations timeline — the story of the shift, writing itself. New events
 * slide in at the top as staff move and tasks complete. It answers "what just
 * happened" at a glance, the way a mission log would.
 */
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquareText, Sparkles, UserCheck, Navigation, CheckCircle2, ArrowRightLeft, TrendingUp } from "lucide-react";
import type { TimelineEvent, TimelineKind } from "@/lib/live/engine";

const ICON: Record<TimelineKind, { Icon: typeof Sparkles; hex: string }> = {
  message: { Icon: MessageSquareText, hex: "#2e7dff" },
  ai: { Icon: Sparkles, hex: "#2e7dff" },
  assignment: { Icon: ArrowRightLeft, hex: "#a78bfa" },
  accepted: { Icon: UserCheck, hex: "#4ad48a" },
  enroute: { Icon: Navigation, hex: "#2e7dff" },
  completed: { Icon: CheckCircle2, hex: "#4ad48a" },
  prediction: { Icon: TrendingUp, hex: "#f5b53d" },
};

function clock(at: number): string {
  const d = new Date(at);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function LiveTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-center gap-2 text-[13px] font-medium text-ink">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inset-0 animate-ping rounded-full bg-ok opacity-60" />
          <span className="relative h-1.5 w-1.5 rounded-full bg-ok" />
        </span>
        Operations timeline
      </div>
      <div className="relative min-h-0 flex-1 overflow-y-auto pl-1">
        <div aria-hidden className="absolute bottom-2 left-[9px] top-2 w-px bg-line" />
        <AnimatePresence initial={false}>
          {events.length === 0 ? (
            <div className="py-6 text-center text-[12.5px] text-ink-4">The shift is quiet. Events will appear here live.</div>
          ) : (
            events.map((e) => {
              const { Icon, hex } = ICON[e.kind];
              return (
                <motion.div
                  key={e.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  className="relative flex gap-3 py-2"
                >
                  <span className="relative z-10 mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full ring-4 ring-[#060608]" style={{ background: `${hex}22`, color: hex }}>
                    <Icon size={10} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-[11px] tabular-nums text-ink-4">{clock(e.at)}</span>
                      {e.sub && <span className="font-mono text-[10.5px] text-ink-4">{e.sub}</span>}
                    </div>
                    <div className="text-[12.5px] leading-snug text-ink-2">{e.text}</div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
