"use client";

/**
 * Operations Command Center — LUXA's fastest decision-making screen. No map: the
 * AI reasons at the top, a ranked Operations Queue tells the manager exactly what
 * needs a decision, a live timeline records the shift, predictive alerts look
 * ahead, and a KPI strip gives the vitals. Bloomberg-dense, Apple-calm, blue only.
 */
import { useEffect, useState } from "react";
import { Radio } from "lucide-react";
import { UserMenu } from "@/components/app/UserMenu";
import { useSettings } from "@/lib/store/hooks";
import { useLiveOps } from "@/lib/live/useLiveOps";
import { AiCommandPanel } from "./AiCommandPanel";
import { OperationsQueue } from "./OperationsQueue";
import { PredictiveAlerts } from "./PredictiveAlerts";
import { LiveTimeline } from "./LiveTimeline";
import { KpiStrip } from "./KpiStrip";

export function LiveOperations() {
  const settings = useSettings();
  const world = useLiveOps();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const clock = mounted ? new Date(world.now).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <>
      {/* header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-black/70 px-5 backdrop-blur-xl sm:px-7">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-[18px] font-semibold tracking-[-0.02em]">
            Operations
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(74,212,138,0.3)] bg-[rgba(74,212,138,0.08)] px-2 py-0.5 text-[10px] font-medium text-ok">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-ok opacity-60" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-ok" />
              </span>
              Live
            </span>
          </h1>
          <p className="truncate text-[12px] text-ink-3">{settings.portfolioName} · Command Center · <span className="tabular-nums">{clock}</span></p>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="hidden items-center gap-1.5 rounded-full border border-line bg-white/[0.02] px-2.5 py-1 text-[11px] text-ink-3 sm:flex">
            <Radio size={12} className="text-accent" /> {world.pulse.onShift} on shift · {world.pulse.enroute} en route
          </span>
          <UserMenu size={36} />
        </div>
      </header>

      <div className="space-y-5 p-4 sm:p-6">
        {/* everything here is derived from live, time-sensitive data — render it
            client-side only (after mount) so SSR and hydration never disagree */}
        {!mounted ? (
          <Skeleton />
        ) : (
          <>
            {/* AI at the top */}
            <AiCommandPanel />

            {/* queue + timeline | predictive alerts */}
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
              <div className="min-w-0 space-y-5">
                <OperationsQueue staff={world.staff} />
                <div className="rounded-[var(--radius-card)] border border-line bg-white/[0.012] p-4" style={{ height: 288 }}>
                  <LiveTimeline events={world.timeline} />
                </div>
              </div>

              <aside className="min-w-0">
                <PredictiveAlerts />
              </aside>
            </div>

            {/* KPI strip */}
            <KpiStrip staff={world.staff} />
          </>
        )}
      </div>
    </>
  );
}

function Skeleton() {
  return (
    <div className="space-y-5">
      <div className="skeleton h-[172px] rounded-[var(--radius-card)]" />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton h-[168px] rounded-[var(--radius-card)]" />)}
        </div>
        <div className="skeleton h-[400px] rounded-[var(--radius-card)]" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-[86px] rounded-[var(--radius-card)]" />)}
      </div>
    </div>
  );
}
