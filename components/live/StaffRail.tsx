"use client";

/**
 * Live Staff — every team member as a live unit, the way a dispatcher watches a
 * fleet. Status, current task, property, ETA, jobs done today, response time and
 * a workload meter, all updating on the clock. Click to follow them on the map.
 */
import { motion } from "framer-motion";
import { Clock, MapPin, Activity, CheckCircle2, Timer } from "lucide-react";
import { useDatabase } from "@/lib/store/hooks";
import { STATUS_META, type LiveStaff } from "@/lib/live/engine";
import { deptLabel } from "@/lib/domain";
import { cn } from "@/lib/utils";

const ORDER: Record<string, number> = { working: 0, driving: 1, walking: 2, returning: 3, available: 4, busy: 5, break: 6, offline: 7 };

export function StaffRail({ staff, onFollow, followId }: { staff: LiveStaff[]; onFollow: (id: string) => void; followId: string | null }) {
  const sorted = [...staff].sort((a, b) => (ORDER[a.status] - ORDER[b.status]) || b.workloadPct - a.workloadPct);
  return (
    <div className="space-y-2">
      {sorted.map((s) => <StaffLiveCard key={s.id} s={s} onFollow={() => onFollow(s.id)} active={followId === s.id} />)}
    </div>
  );
}

function StaffLiveCard({ s, onFollow, active }: { s: LiveStaff; onFollow: () => void; active: boolean }) {
  const db = useDatabase();
  const meta = STATUS_META[s.status];
  const prop = s.targetPropertyId ? db.properties.find((p) => p.id === s.targetPropertyId) ?? null : null;
  const load = s.workloadPct;
  const loadHex = load >= 100 ? "#ff5c5c" : load >= 70 ? "#f5b53d" : "#4ad48a";

  return (
    <motion.button
      layout
      onClick={onFollow}
      className={cn("w-full rounded-xl border bg-white/[0.015] p-3 text-left transition-colors hover:bg-white/[0.03]", active ? "border-accent/50" : "border-line")}
    >
      <div className="flex items-center gap-2.5">
        <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white ring-2 ring-black/50" style={{ background: `linear-gradient(180deg, ${meta.hex}, ${meta.hex}bb)` }}>
          {s.initials}
          {(s.status === "working" || s.status === "driving" || s.status === "walking") && (
            <span aria-hidden className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-black" style={{ background: meta.hex, boxShadow: `0 0 6px ${meta.hex}` }} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[13.5px] font-medium text-ink">{s.name}</span>
            <span className="shrink-0 text-[11px] font-medium" style={{ color: meta.hex }}>{meta.label}</span>
          </div>
          <div className="truncate text-[11.5px] text-ink-3">{s.role} · {deptLabel(s.department)}</div>
        </div>
      </div>

      {/* current task / destination */}
      {s.taskTitle && s.status !== "offline" ? (
        <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-line bg-black/20 px-2.5 py-1.5">
          <Activity size={12} className="shrink-0 text-ink-4" />
          <span className="min-w-0 flex-1 truncate text-[11.5px] text-ink-2">{s.taskTitle}</span>
          {prop && <span className="flex shrink-0 items-center gap-1 text-[10.5px] text-ink-4"><MapPin size={10} />{prop.name}</span>}
          {s.etaMin != null && s.etaMin > 0 && <span className="flex shrink-0 items-center gap-1 text-[10.5px] tabular-nums text-accent"><Clock size={10} />{s.etaMin}m</span>}
        </div>
      ) : null}

      {/* metrics */}
      <div className="mt-2.5 flex items-center gap-3 text-[11px] text-ink-3">
        <span className="flex items-center gap-1"><CheckCircle2 size={11} className="text-ok" /> {s.completedToday} today</span>
        <span className="flex items-center gap-1"><Timer size={11} /> {s.responseMin}m avg</span>
        <span className="ml-auto tabular-nums" style={{ color: loadHex }}>{load}%</span>
      </div>
      {/* workload meter */}
      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full transition-[width] duration-700 ease-[var(--ease-premium)]" style={{ width: `${load}%`, background: loadHex }} />
      </div>
    </motion.button>
  );
}
