"use client";

/**
 * Live Operations — LUXA's control room. A living map of the portfolio, a fleet
 * of staff moving in real time, an AI reasoning continuously, and a timeline that
 * writes itself. This is the screen that should make someone think "this is the
 * future of luxury hospitality", not another CRM.
 */
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Radio, Building2, Users, Navigation, Hammer, TriangleAlert } from "lucide-react";
import { UserMenu } from "@/components/app/UserMenu";
import { LiveNumber } from "@/components/landing/anim/LiveNumber";
import { useDatabase, useSettings } from "@/lib/store/hooks";
import { useLiveOps } from "@/lib/live/useLiveOps";
import { LiveMap } from "./LiveMap";
import { VillaPanel } from "./VillaPanel";
import { StaffRail } from "./StaffRail";
import { AiThinkingStream } from "./AiThinkingStream";
import { LiveTimeline } from "./LiveTimeline";
import { PredictionCards } from "./PredictionCards";

export function LiveOperations() {
  const db = useDatabase();
  const settings = useSettings();
  const world = useLiveOps();
  const [selected, setSelected] = useState<string | null>(null);
  const [followId, setFollowId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // if you follow a staff member, open the villa they're heading to
  const followingTarget = useMemo(() => world.staff.find((s) => s.id === followId)?.targetPropertyId ?? null, [world.staff, followId]);
  useEffect(() => { if (followId && followingTarget) setSelected(followingTarget); }, [followId, followingTarget]);

  const clock = mounted ? new Date(world.now).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <>
      {/* header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-black/70 px-5 backdrop-blur-xl sm:px-7">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-[18px] font-semibold tracking-[-0.02em]">
            Live Operations
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(74,212,138,0.3)] bg-[rgba(74,212,138,0.08)] px-2 py-0.5 text-[10px] font-medium text-ok">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-ok opacity-60" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-ok" />
              </span>
              Live
            </span>
          </h1>
          <p className="truncate text-[12px] text-ink-3">{settings.portfolioName} · <span className="tabular-nums">{clock}</span></p>
        </div>
        <div className="flex items-center gap-2.5">
          <Pulse icon={Building2} label="Villas" value={db.properties.length} />
          <Pulse icon={Users} label="On shift" value={world.pulse.onShift} tone="ok" />
          <Pulse icon={Navigation} label="En route" value={world.pulse.enroute} tone="accent" />
          <Pulse icon={Hammer} label="Working" value={world.pulse.working} tone="accent" />
          <Pulse icon={TriangleAlert} label="Urgent" value={world.pulse.urgent} tone={world.pulse.urgent > 0 ? "urgent" : "muted"} />
          <div className="hidden sm:block"><UserMenu size={36} /></div>
        </div>
      </header>

      <div className="space-y-5 p-4 sm:p-6">
        <div className="grid gap-5 xl:grid-cols-[268px_minmax(0,1fr)_340px]">
          {/* live staff */}
          <aside className="order-2 min-w-0 xl:order-1">
            <SectionLabel icon={Radio}>Live staff · {world.staff.length}</SectionLabel>
            <div className="max-h-[560px] overflow-y-auto pr-0.5">
              <StaffRail staff={world.staff} onFollow={(id) => setFollowId((c) => (c === id ? null : id))} followId={followId} />
            </div>
          </aside>

          {/* map + predictions */}
          <div className="order-1 min-w-0 space-y-5 xl:order-2">
            <div className="relative h-[560px]">
              <LiveMap world={world} selectedId={selected} onSelect={setSelected} followId={followId} />
              <VillaPanel propertyId={selected} world={world} onClose={() => { setSelected(null); setFollowId(null); }} />
            </div>
          </div>

          {/* AI thinking + timeline */}
          <aside className="order-3 min-w-0 space-y-5">
            <div className="glass edge-light rounded-[var(--radius-card)] border border-line p-4" style={{ height: 344 }}>
              <AiThinkingStream thoughts={world.thoughts} />
            </div>
            <div className="rounded-[var(--radius-card)] border border-line bg-white/[0.012] p-4" style={{ height: 196 }}>
              <LiveTimeline events={world.timeline} />
            </div>
          </aside>
        </div>

        <PredictionCards />
      </div>
    </>
  );
}

function Pulse({ icon: Icon, label, value, tone = "ink" }: { icon: typeof Building2; label: string; value: number; tone?: "ink" | "ok" | "accent" | "urgent" | "muted" }) {
  const color = tone === "ok" ? "text-ok" : tone === "accent" ? "text-accent" : tone === "urgent" ? "text-urgent" : tone === "muted" ? "text-ink-4" : "text-ink";
  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="hidden items-center gap-2 rounded-[var(--radius-control)] border border-line bg-white/[0.02] px-2.5 py-1.5 md:flex">
      <Icon size={14} className={color} />
      <div className="leading-none">
        <div className={`text-[15px] font-semibold tabular-nums ${color}`}><LiveNumber value={value} pad={1} duration={0.7} /></div>
        <div className="mt-0.5 text-[9px] uppercase tracking-wider text-ink-4">{label}</div>
      </div>
    </motion.div>
  );
}

function SectionLabel({ icon: Icon, children }: { icon: typeof Radio; children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-[13px] font-medium text-ink">
      <Icon size={15} className="text-accent" /> {children}
    </div>
  );
}
