"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Topbar } from "@/components/app/Topbar";
import { Card } from "@/components/ui";
import { LiveNumber } from "@/components/landing/anim/LiveNumber";
import { useDatabase, useReady } from "@/lib/store/hooks";
import { computeAnalytics, fmtDuration } from "@/lib/store/insights";

export default function AnalyticsPage() {
  const readyState = useReady();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const ready = readyState && mounted;

  const db = useDatabase();
  const a = useMemo(() => computeAnalytics(db), [db]);
  const maxDept = Math.max(1, ...a.byDepartment.map((d) => d.count));

  return (
    <>
      <Topbar title="Analytics" subtitle="Operational performance · Marbella portfolio" />
      <div className="space-y-6 p-5 sm:p-7">
        {/* headline metrics */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metric label="Avg response time" value={ready ? fmtDuration(a.avgResponse) : "—"} />
          <Metric label="Completed requests" value={ready ? <LiveNumber value={a.completed} pad={1} duration={0.9} /> : "—"} />
          <Metric
            label="Guest satisfaction"
            value={ready ? a.satisfaction.toFixed(1) : "—"}
            suffix={ready ? " / 5" : ""}
            bar={ready ? a.satisfaction / 5 : 0}
          />
          <Metric
            label="Occupancy rate"
            value={ready ? <LiveNumber value={a.occupancy} pad={1} duration={0.9} /> : "—"}
            suffix={ready ? "%" : ""}
            bar={ready ? a.occupancy / 100 : 0}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* requests by department */}
          <Card className="p-6">
            <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-3">Requests by department</div>
            <div className="mt-5 space-y-4">
              {a.byDepartment.map((d, i) => (
                <div key={d.department}>
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <span className="text-[13px] text-ink-2">{d.label}</span>
                    <span className="text-[12px] tabular-nums text-ink-4">{d.count}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
                    <motion.div
                      className="h-full rounded-full bg-[linear-gradient(90deg,rgba(46,125,255,0.5),rgba(46,125,255,0.9))]"
                      initial={{ width: 0 }}
                      animate={{ width: `${(d.count / maxDept) * 100}%` }}
                      transition={{ duration: 0.8, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
              ))}
              {a.byDepartment.length === 0 && <p className="text-[13px] text-ink-3">No requests yet.</p>}
            </div>
          </Card>

          {/* throughput summary */}
          <Card className="p-6">
            <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-3">Throughput</div>
            <div className="mt-5 space-y-4">
              <Stat label="Total requests" value={a.total} />
              <Stat label="Completed" value={a.completed} tone="ok" />
              <Stat label="Completion rate" value={a.total ? `${Math.round((a.completed / a.total) * 100)}%` : "—"} />
              <div className="border-t border-line pt-4">
                <div className="text-[12px] text-ink-3">
                  Avg response across the portfolio is{" "}
                  <span className="font-medium text-ink">{fmtDuration(a.avgResponse)}</span>. Faster handling lifts the
                  satisfaction index over time.
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function Metric({
  label,
  value,
  suffix = "",
  bar,
}: {
  label: string;
  value: React.ReactNode;
  suffix?: string;
  bar?: number;
}) {
  return (
    <Card className="p-5">
      <div className="text-[11px] uppercase tracking-wider text-ink-3">{label}</div>
      <div className="mt-2.5 text-[28px] font-semibold leading-none tracking-tight tabular-nums text-ink">
        {value}
        <span className="text-[16px] text-ink-3">{suffix}</span>
      </div>
      {bar != null && (
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${Math.round(bar * 100)}%` }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      )}
    </Card>
  );
}

function Stat({ label, value, tone = "ink" }: { label: string; value: React.ReactNode; tone?: "ink" | "ok" }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[13px] text-ink-3">{label}</span>
      <span className={`text-[16px] font-semibold tabular-nums ${tone === "ok" ? "text-ok" : "text-ink"}`}>{value}</span>
    </div>
  );
}
