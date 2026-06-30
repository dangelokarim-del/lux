"use client";

import { useMemo } from "react";
import { Topbar } from "@/components/app/Topbar";
import { Card, Avatar, StatusPill } from "@/components/ui";
import { departmentMeta, presenceMeta, statusMeta } from "@/lib/domain";
import { useDatabase } from "@/lib/store/hooks";

export default function TeamPage() {
  const db = useDatabase();

  const team = useMemo(
    () =>
      db.staff.map((s) => ({
        ...s,
        load: db.tasks.filter((t) => t.assigneeId === s.id && statusMeta[t.status].open).length,
      })),
    [db.staff, db.tasks]
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
                <Avatar name={m.name} size={48} />
                <StatusPill tone={presenceMeta[m.presence].tone} pulse={m.presence === "available"}>
                  {presenceMeta[m.presence].label}
                </StatusPill>
              </div>
              <div className="mt-4 text-[15px] font-medium">{m.name}</div>
              <div className="text-[13px] text-ink-3">{m.role}</div>

              <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                <span className="text-[12px] text-ink-3">{departmentMeta[m.department].label}</span>
                <span className="text-[12px] text-ink-2">
                  <span className="font-medium text-ink tabular-nums">{m.load}</span> open {m.load === 1 ? "task" : "tasks"}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
