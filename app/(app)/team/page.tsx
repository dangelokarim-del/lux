"use client";

import { useEffect, useMemo, useState } from "react";
import { Topbar } from "@/components/app/Topbar";
import { Card, Avatar, StatusPill } from "@/components/ui";
import type { Tone } from "@/lib/tone";
import { deptLabel } from "@/lib/domain";
import { useDatabase } from "@/lib/store/hooks";
import { staffContext } from "@/lib/store/insights";
import { computeAvailability, type AvailabilityState } from "@/lib/services/availability";
import { timeAgo } from "@/components/product/format";
import { Reveal } from "@/components/product/Reveal";

const AVAIL_TONE: Record<AvailabilityState, Tone> = { available: "ok", busy: "warn", off: "muted", leave: "muted" };

export default function TeamPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const db = useDatabase();

  const team = useMemo(
    () => db.staff.map((s) => ({ ...s, ctx: staffContext(db, s.id), av: computeAvailability(s, db) })),
    [db]
  );
  const available = team.filter((m) => m.av.state === "available").length;

  return (
    <>
      <Topbar title="Team" subtitle={mounted ? `${team.length} staff · ${available} available now` : `${team.length} staff`} />
      <div className="p-5 sm:p-7">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {team.map((m, i) => (
            <Reveal key={m.id} index={i}>
            <Card hover className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={m.name} size={44} />
                  <div className="min-w-0">
                    <div className="text-[15px] font-medium leading-tight">{m.name}</div>
                    <div className="text-[12.5px] text-ink-3">{m.role}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusPill tone={mounted ? AVAIL_TONE[m.av.state] : "muted"} pulse={mounted && m.av.state === "available"}>
                    {mounted ? m.av.label : "—"}
                  </StatusPill>
                  {mounted && <span className="text-[11px] text-ink-4">{m.av.reason}</span>}
                </div>
              </div>

              {/* availability summary — why LUXA sees them this way */}
              {mounted && (
                <div className="mt-3 text-[12px] text-ink-3">
                  {m.av.state === "available" && <>Available · on shift</>}
                  {m.av.state === "busy" && <>Busy · {m.av.reason}</>}
                  {m.av.state === "off" && <>Off shift · {m.av.reason}</>}
                  {m.av.state === "leave" && <>On leave · {m.av.reason}</>}
                </div>
              )}

              {/* current task */}
              <div className="mt-4 rounded-lg border border-line bg-white/[0.012] px-3 py-2.5">
                <div className="text-[10.5px] uppercase tracking-wider text-ink-4">Current task</div>
                {m.ctx.currentTask ? (
                  <div className="mt-1 truncate text-[13px] text-ink">
                    {m.ctx.currentTask.title}
                    {m.ctx.currentTask.room && <span className="text-ink-3"> · {m.ctx.currentTask.room}</span>}
                  </div>
                ) : (
                  <div className="mt-1 text-[13px] text-ink-3">No active task</div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-[12px]">
                <span className="text-ink-3">{deptLabel(m.department)}</span>
                <span className="flex items-center gap-3 text-ink-3">
                  <span>
                    <span className="font-medium text-ink tabular-nums">{m.ctx.openTasks}</span> open
                  </span>
                  <span className="text-ink-4">·</span>
                  <span>{mounted && m.ctx.lastActiveAt ? `Active ${timeAgo(m.ctx.lastActiveAt)}` : "—"}</span>
                </span>
              </div>
            </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}
