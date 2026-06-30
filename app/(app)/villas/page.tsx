"use client";

import { useMemo } from "react";
import { Topbar } from "@/components/app/Topbar";
import { Card, StatusPill } from "@/components/ui";
import { propertyStatusMeta, statusMeta } from "@/lib/domain";
import { useDatabase } from "@/lib/store/hooks";

export default function VillasPage() {
  const db = useDatabase();

  const villas = useMemo(
    () =>
      db.properties.map((p) => {
        const guest = db.guests.find((g) => g.id === p.currentGuestId) ?? null;
        const openTasks = db.tasks.filter((t) => t.propertyId === p.id && statusMeta[t.status].open).length;
        return { ...p, guestName: guest?.name ?? null, openTasks };
      }),
    [db.properties, db.guests, db.tasks]
  );

  return (
    <>
      <Topbar title="Villas" subtitle={`${villas.length} properties · Marbella`} />
      <div className="p-5 sm:p-7">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {villas.map((v) => (
            <Card key={v.id} hover>
              <div className="relative h-28 overflow-hidden border-b border-line bg-bg-elev">
                <div className="bg-grid absolute inset-0 opacity-50" />
                <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/[0.03] blur-xl" />
                <div className="absolute bottom-3 left-4 font-mono text-[11px] text-ink-4">{v.area}</div>
                <div className="absolute right-4 top-3">
                  <StatusPill tone={propertyStatusMeta[v.status].tone} pulse={v.status === "occupied"}>
                    {propertyStatusMeta[v.status].label}
                  </StatusPill>
                </div>
              </div>

              <div className="p-5">
                <div className="text-[16px] font-medium">{v.name}</div>
                <div className="text-[13px] text-ink-3">{v.guestName ? `Hosting ${v.guestName}` : `${v.bedrooms} bedrooms`}</div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-line bg-white/[0.02] px-3 py-2.5">
                    <div className="text-[11px] uppercase tracking-wider text-ink-4">Bedrooms</div>
                    <div className="mt-0.5 text-[18px] font-semibold tabular-nums">{v.bedrooms}</div>
                  </div>
                  <div className="rounded-lg border border-line bg-white/[0.02] px-3 py-2.5">
                    <div className="text-[11px] uppercase tracking-wider text-ink-4">Open tasks</div>
                    <div className={`mt-0.5 text-[18px] font-semibold tabular-nums ${v.openTasks > 0 ? "text-ink" : "text-ink-3"}`}>{v.openTasks}</div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
