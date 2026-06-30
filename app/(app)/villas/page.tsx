"use client";

import { useEffect, useMemo, useState } from "react";
import { Topbar } from "@/components/app/Topbar";
import { Card, StatusPill } from "@/components/ui";
import { propertyStatusMeta } from "@/lib/domain";
import { useDatabase } from "@/lib/store/hooks";
import { fmtDuration, villaContext } from "@/lib/store/insights";
import { tones } from "@/lib/tone";

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function VillasPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const db = useDatabase();

  const villas = useMemo(
    () => db.properties.map((p) => ({ ...p, ctx: villaContext(db, p.id) })),
    [db]
  );

  return (
    <>
      <Topbar title="Villas" subtitle={`${villas.length} properties · Marbella`} />
      <div className="p-5 sm:p-7">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {villas.map((v) => {
            const hk = tones[v.ctx.housekeeping.tone];
            return (
              <Card key={v.id} hover className="overflow-hidden">
                <div className="relative h-24 overflow-hidden border-b border-line bg-bg-elev">
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
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="text-[16px] font-medium">{v.name}</div>
                    <div className="text-[12px] text-ink-4">{v.bedrooms} bd</div>
                  </div>
                  <div className="mt-0.5 truncate text-[13px] text-ink-3">
                    {v.ctx.guestName ? `Hosting ${v.ctx.guestName}` : "No current guest"}
                  </div>

                  {/* stay progress */}
                  {v.ctx.stayProgress != null && (
                    <div className="mt-4">
                      <div className="mb-1.5 flex items-center justify-between text-[11px] text-ink-4">
                        <span>Stay progress</span>
                        <span className="tabular-nums">Check-out {fmtDate(v.ctx.checkOut)}</span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full bg-accent transition-[width] duration-700 ease-[var(--ease-premium)]"
                          style={{ width: mounted ? `${v.ctx.stayProgress}%` : "0%" }}
                        />
                      </div>
                    </div>
                  )}

                  {/* operational stats */}
                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4">
                    <Stat label="Open" value={String(v.ctx.openRequests)} tone={v.ctx.openRequests > 0 ? "ink" : "muted"} />
                    <Stat label="Response" value={fmtDuration(v.ctx.avgResponse)} tone="ink" />
                    <div>
                      <div className="text-[10.5px] uppercase tracking-wider text-ink-4">Service</div>
                      <div className={`mt-1 inline-flex items-center gap-1.5 text-[12.5px] font-medium ${hk.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${hk.dot}`} />
                        {v.ctx.housekeeping.label}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "ink" | "muted" }) {
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-wider text-ink-4">{label}</div>
      <div className={`mt-1 text-[15px] font-semibold tabular-nums ${tone === "ink" ? "text-ink" : "text-ink-3"}`}>{value}</div>
    </div>
  );
}
