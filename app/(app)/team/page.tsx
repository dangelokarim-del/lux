"use client";

import { useEffect, useMemo, useState } from "react";
import { Topbar } from "@/components/app/Topbar";
import { Card, Avatar, StatusPill } from "@/components/ui";
import { departmentMeta, presenceMeta } from "@/lib/domain";
import { useDatabase } from "@/lib/store/hooks";
import { staffContext } from "@/lib/store/insights";
import { timeAgo } from "@/components/product/format";

export default function TeamPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const db = useDatabase();

  const team = useMemo(
    () => db.staff.map((s) => ({ ...s, ctx: staffContext(db, s.id) })),
    [db]
  );
  const available = team.filter((m) => m.presence === "available").length;

  return (
    <>
      <Topbar title="Team" subtitle={`${team.length} staff · ${available} available now`} />
      <div className="p-5 sm:p-7">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {team.map((m) => (
            <Card key={m.id} hover className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={m.name} size={44} />
                  <div className="min-w-0">
                    <div className="text-[15px] font-medium leading-tight">{m.name}</div>
                    <div className="text-[12.5px] text-ink-3">{m.role}</div>
                  </div>
                </div>
                <StatusPill tone={presenceMeta[m.presence].tone} pulse={m.presence === "available"}>
                  {presenceMeta[m.presence].label}
                </StatusPill>
              </div>

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
                <span className="text-ink-3">{departmentMeta[m.department].label}</span>
                <span className="flex items-center gap-3 text-ink-3">
                  <span>
                    <span className="font-medium text-ink tabular-nums">{m.ctx.openTasks}</span> open
                  </span>
                  <span className="text-ink-4">·</span>
                  <span>{mounted && m.ctx.lastActiveAt ? `Active ${timeAgo(m.ctx.lastActiveAt)}` : "—"}</span>
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
