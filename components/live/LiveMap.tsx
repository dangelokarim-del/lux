"use client";

/**
 * The Live Operations map — a Mission Control surface for a portfolio of luxury
 * villas. A near-black operations floor with a blue perspective grid, drifting
 * fog, breathing light and slow particles. Villas are premium operational nodes
 * (name, status, open requests, occupancy, soft status glow); staff are a moving
 * fleet of avatar chips; assignments draw glowing route lines with a travelling
 * pulse and an ETA. Apple-calm motion, a single blue accent, no cheap dots.
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import { useDatabase } from "@/lib/store/hooks";
import { villaState, VILLA_STATE_META, STATUS_META, type VillaState, type LiveStaff, type Pt } from "@/lib/live/engine";
import type { LiveWorld } from "@/lib/live/useLiveOps";
import { statusMeta } from "@/lib/domain";
import { cn } from "@/lib/utils";

/* deterministic particle field — stable across SSR/hydration */
const PARTICLES = Array.from({ length: 26 }, (_, i) => {
  const h = (n: number) => ((Math.imul(i + 1, 2654435761 + n) >>> 0) % 1000) / 1000;
  return { x: h(1) * 100, y: 12 + h(2) * 82, size: 1 + h(3) * 1.6, dur: 9 + h(4) * 10, delay: h(5) * 12, o: 0.2 + h(6) * 0.4 };
});

export function LiveMap({ world, selectedId, onSelect, followId }: { world: LiveWorld; selectedId: string | null; onSelect: (id: string) => void; followId: string | null }) {
  const db = useDatabase();
  const { layout, staff } = world;

  const nodes = useMemo(
    () => db.properties.map((p) => ({
      p, pt: layout.get(p.id) ?? { x: 0.5, y: 0.5 }, state: villaState(db, p.id),
      open: db.tasks.filter((t) => t.propertyId === p.id && statusMeta[t.status].open).length,
      occupied: !!p.currentGuestId,
    })),
    [db, layout]
  );

  const routes = staff.filter((s) => s.targetPropertyId && (s.status === "driving" || s.status === "walking"));

  return (
    <div className="relative h-full min-h-[460px] w-full overflow-hidden rounded-[var(--radius-card)] border border-line">
      {/* — surface layers — */}
      <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(130% 100% at 50% -10%, #0a1120 0%, #060a12 44%, #030408 78%, #010103 100%)" }} />
      <PerspectiveGrid />
      {/* drifting fog banks */}
      <div aria-hidden className="live-fog absolute -inset-[10%] opacity-60" style={{ background: "radial-gradient(40% 50% at 25% 30%, rgba(46,125,255,0.10), transparent 70%), radial-gradient(45% 55% at 78% 60%, rgba(46,125,255,0.08), transparent 72%)", filter: "blur(30px)" }} />
      {/* radar sweep + breathing core */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2">
        <div className="live-sweep absolute inset-0 rounded-full opacity-[0.5]" />
      </div>
      <div aria-hidden className="live-breathe glow-accent pointer-events-none absolute left-1/2 top-1/2 h-[52%] w-[52%] -translate-x-1/2 -translate-y-1/2 blur-2xl" />
      {/* particles */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {PARTICLES.map((p, i) => (
          <span key={i} className="live-particle absolute rounded-full bg-white" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, opacity: p.o, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s`, boxShadow: "0 0 6px rgba(255,255,255,0.5)" }} />
        ))}
      </div>
      <div aria-hidden className="spotlight pointer-events-none absolute inset-x-0 top-0 h-44" />
      {/* faint vignette to seat the scene */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 160px 40px rgba(0,0,0,0.7)" }} />

      {/* — routes — */}
      <RouteLayer routes={routes} layout={layout} db={db} />

      {/* — villas — */}
      {nodes.map((n) => (
        <VillaNode key={n.p.id} name={n.p.name} state={n.state} pt={n.pt} open={n.open} occupied={n.occupied}
          selected={selectedId === n.p.id} onSelect={() => onSelect(n.p.id)} />
      ))}

      {/* — fleet — */}
      {staff.map((s) => <StaffChip key={s.id} s={s} following={followId === s.id} />)}

      {/* legend */}
      <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-x-3 gap-y-1 rounded-lg border border-line bg-black/40 px-3 py-2 backdrop-blur-md">
        {(["urgent", "active", "arriving", "normal", "vacant"] as VillaState[]).map((k) => (
          <span key={k} className="flex items-center gap-1.5 text-[10.5px] text-ink-3">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: VILLA_STATE_META[k].hex, boxShadow: `0 0 7px ${VILLA_STATE_META[k].hex}` }} />
            {VILLA_STATE_META[k].label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ villa node ------------------------------ */
function VillaNode({ name, state, pt, open, occupied, selected, onSelect }: { name: string; state: VillaState; pt: Pt; open: number; occupied: boolean; selected: boolean; onSelect: () => void }) {
  const hex = VILLA_STATE_META[state].hex;
  const urgent = state === "urgent";
  return (
    <button
      onClick={onSelect}
      data-villa
      aria-label={name}
      className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 focus:outline-none"
      style={{ left: `${pt.x * 100}%`, top: `${pt.y * 100}%`, transition: "left 1.9s linear, top 1.9s linear" }}
    >
      {/* soft status glow */}
      <span aria-hidden className="live-node-glow absolute left-1/2 top-1/2 h-14 w-14 rounded-full blur-xl" style={{ background: hex, animationDuration: urgent ? "2.2s" : "3.8s" }} />
      {/* node core: concentric premium rings */}
      <span className="relative flex items-center justify-center">
        {urgent && <span aria-hidden className="absolute h-8 w-8 animate-ping rounded-full" style={{ boxShadow: `0 0 0 1px ${hex}` }} />}
        <span aria-hidden className="absolute h-7 w-7 rounded-full" style={{ boxShadow: `0 0 0 1px ${hex}55` }} />
        <span className={cn("relative grid h-[18px] w-[18px] place-items-center rounded-full ring-2 ring-black/70 transition-transform duration-300 group-hover:scale-110", selected && "scale-110")}
          style={{ background: `radial-gradient(circle at 35% 30%, #ffffff55, ${hex})`, boxShadow: `0 0 14px ${hex}` }}>
          <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
        </span>
      </span>

      {/* glass label card */}
      <span className={cn(
        "absolute left-1/2 top-[22px] flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-[10px] border px-2 py-1 backdrop-blur-md transition-all duration-300",
        selected ? "border-accent/50 bg-black/70" : "border-line bg-black/55 group-hover:-translate-y-px group-hover:border-line-2"
      )}
        style={{ boxShadow: selected ? "0 10px 30px -12px rgba(0,0,0,0.8)" : undefined }}>
        <span className="text-[11px] font-medium leading-none text-ink">{name}</span>
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: hex, boxShadow: `0 0 6px ${hex}` }} />
        {open > 0 && <span className="rounded-full bg-white/[0.08] px-1.5 text-[10px] font-medium leading-[16px] tabular-nums text-ink-2">{open}</span>}
        {/* occupancy indicator */}
        <span aria-hidden className={cn("h-2 w-2 rounded-full border", occupied ? "border-accent bg-accent/70" : "border-line-2 bg-transparent")} title={occupied ? "Occupied" : "Vacant"} />
      </span>
    </button>
  );
}

/* ------------------------------ fleet chip ------------------------------ */
function StaffChip({ s, following }: { s: LiveStaff; following: boolean }) {
  const meta = STATUS_META[s.status];
  const moving = s.status === "driving" || s.status === "walking";
  const offline = s.status === "offline";
  const first = s.name.split(" ")[0];
  return (
    <motion.div
      data-staff={s.id}
      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${s.pos.x * 100}%`, top: `${s.pos.y * 100}%`, transition: "left 1.9s linear, top 1.9s linear" }}
    >
      <div className={cn("flex items-center gap-1.5 rounded-full border py-0.5 pl-0.5 pr-2 backdrop-blur-md transition-opacity",
        following ? "border-accent/60 bg-black/75" : "border-line bg-black/55", offline && "opacity-45")}
        style={{ boxShadow: moving ? `0 0 16px -4px ${meta.hex}` : undefined }}>
        <span className="relative grid h-[22px] w-[22px] place-items-center rounded-full text-[9px] font-semibold text-white"
          style={{ background: `linear-gradient(180deg, ${meta.hex}, ${meta.hex}cc)`, boxShadow: `0 0 0 1.5px rgba(0,0,0,0.6)` }}>
          {s.initials}
          {moving && <span aria-hidden className="absolute inset-0 animate-ping rounded-full" style={{ boxShadow: `0 0 0 1px ${meta.hex}` }} />}
        </span>
        <span className="flex items-baseline gap-1 leading-none">
          <span className="text-[10.5px] font-medium text-ink">{first}</span>
          <span className="text-[9.5px] lowercase tracking-wide" style={{ color: offline ? "rgba(255,255,255,0.4)" : meta.hex }}>{meta.label.toLowerCase()}</span>
        </span>
      </div>
    </motion.div>
  );
}

/* ------------------------------ route layer ----------------------------- */
function RouteLayer({ routes, layout, db }: { routes: LiveStaff[]; layout: Map<string, Pt>; db: ReturnType<typeof useDatabase> }) {
  return (
    <>
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="routegrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2e7dff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#2e7dff" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        {routes.map((s) => {
          const d = layout.get(s.targetPropertyId!); if (!d) return null;
          return (
            <g key={`r_${s.id}`}>
              <line x1={s.pos.x * 100} y1={s.pos.y * 100} x2={d.x * 100} y2={d.y * 100} stroke="url(#routegrad)" strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
              <line x1={s.pos.x * 100} y1={s.pos.y * 100} x2={d.x * 100} y2={d.y * 100} stroke="#7fb0ff" strokeWidth={1.4} vectorEffect="non-scaling-stroke" className="live-flow" strokeLinecap="round" />
            </g>
          );
        })}
      </svg>
      {/* travelling pulse + ETA chips as HTML for crispness */}
      {routes.map((s) => {
        const d = layout.get(s.targetPropertyId!); if (!d) return null;
        const prop = db.properties.find((p) => p.id === s.targetPropertyId);
        const midX = (s.pos.x + d.x) / 2, midY = (s.pos.y + d.y) / 2;
        return (
          <div key={`p_${s.id}`} className="pointer-events-none absolute inset-0 z-[15]">
            <motion.span
              className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#bcd6ff]"
              style={{ boxShadow: "0 0 8px #7fb0ff" }}
              animate={{ left: [`${s.pos.x * 100}%`, `${d.x * 100}%`], top: [`${s.pos.y * 100}%`, `${d.y * 100}%`] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-accent/30 bg-black/70 px-2 py-0.5 text-[9.5px] font-medium text-accent backdrop-blur-md"
              style={{ left: `${midX * 100}%`, top: `${midY * 100}%` }}>
              {s.name.split(" ")[0]} → {prop?.name ?? "villa"}{s.etaMin != null && s.etaMin > 0 ? ` · ${s.etaMin} min` : ""}
            </span>
          </div>
        );
      })}
    </>
  );
}

/* ------------------------- perspective floor grid ----------------------- */
function PerspectiveGrid() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 h-full w-full opacity-[0.5]" preserveAspectRatio="none" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="gridfade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2e7dff" stopOpacity="0.02" />
            <stop offset="55%" stopColor="#2e7dff" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#2e7dff" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        {/* verticals */}
        {Array.from({ length: 13 }, (_, i) => <line key={`v${i}`} x1={i * (100 / 12)} y1="0" x2={i * (100 / 12)} y2="100" stroke="url(#gridfade)" strokeWidth={0.25} vectorEffect="non-scaling-stroke" />)}
        {/* horizontals */}
        {Array.from({ length: 11 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * (100 / 10)} x2="100" y2={i * (100 / 10)} stroke="url(#gridfade)" strokeWidth={0.25} vectorEffect="non-scaling-stroke" />)}
      </svg>
      {/* soft mask so the grid fades at the edges */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(70% 60% at 50% 45%, transparent 40%, rgba(3,4,8,0.85) 100%)" }} />
    </div>
  );
}
