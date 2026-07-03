"use client";

/**
 * The Live Operations map — a real Marbella operations surface, Apple-Maps dark
 * with an Uber-style fleet. A stylized coastline, arterial roads and named
 * neighbourhoods (Golden Mile, Sierra Blanca, Nueva Andalucía, Puerto Banús,
 * La Zagaleta, El Madroñal) anchor premium villa cards to real geography; staff
 * move as vehicle chips along clean animated routes with live ETAs.
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Users, MessageSquare, Car, Footprints, Wrench, Shield, Plus, Minus, LocateFixed } from "lucide-react";
import { useDatabase, useSettings } from "@/lib/store/hooks";
import { villaState, VILLA_STATE_META, STATUS_META, MARBELLA_ZONES, type VillaState, type LiveStatus, type LiveStaff, type Pt } from "@/lib/live/engine";
import type { LiveWorld } from "@/lib/live/useLiveOps";
import { statusMeta } from "@/lib/domain";
import { VillaThumb } from "./VillaThumb";
import { cn } from "@/lib/utils";

const W = 1000, H = 640; // stylized map coordinate space (matches marker % space)
const CARD_LABEL: Record<VillaState, string> = { normal: "All good", active: "Active", urgent: "Urgent", arriving: "Arriving", vacant: "Vacant" };
const clampX = (x: number) => Math.max(0.11, Math.min(0.89, x));

export function LiveMap({ world, selectedId, onSelect, followId }: { world: LiveWorld; selectedId: string | null; onSelect: (id: string) => void; followId: string | null }) {
  const db = useDatabase();
  const settings = useSettings();
  const { layout, staff } = world;
  const [zoom, setZoom] = useState(1);

  const nodes = useMemo(
    () => db.properties.map((p, i) => ({
      p, i, pt: layout.get(p.id) ?? { x: 0.5, y: 0.5 }, state: villaState(db, p.id),
      open: db.tasks.filter((t) => t.propertyId === p.id && statusMeta[t.status].open).length,
      guests: db.guests.filter((g) => g.propertyId === p.id).length,
    })),
    [db, layout]
  );
  const routes = staff.filter((s) => s.targetPropertyId && (s.status === "driving" || s.status === "walking"));
  const isMarbella = /marbella/i.test(settings.location || settings.portfolioName || "");

  return (
    <div className="relative h-full min-h-[480px] w-full overflow-hidden rounded-[var(--radius-card)] border border-line bg-[#070c14]">
      {/* the zoomable world */}
      <motion.div className="absolute inset-0 origin-center" animate={{ scale: zoom }} transition={{ type: "spring", stiffness: 180, damping: 26 }}>
        <MapCanvas showZones={isMarbella} />

        {/* routes (below markers) */}
        <RouteLayer routes={routes} layout={layout} />

        {/* villa marker cards */}
        {nodes.map((n) => (
          <VillaMarker key={n.p.id} name={n.p.name} state={n.state} pt={n.pt} open={n.open} guests={n.guests} seed={n.i}
            selected={selectedId === n.p.id} onSelect={() => onSelect(n.p.id)} />
        ))}

        {/* fleet chips */}
        {staff.map((s) => <FleetChip key={s.id} s={s} following={followId === s.id} />)}
      </motion.div>

      {/* — controls — */}
      <div className="absolute bottom-16 right-3 z-30 flex flex-col overflow-hidden rounded-xl border border-line bg-black/55 backdrop-blur-md">
        <CtrlBtn onClick={() => setZoom((z) => Math.min(1.8, +(z + 0.2).toFixed(2)))} label="Zoom in"><Plus size={15} /></CtrlBtn>
        <div className="h-px bg-line" />
        <CtrlBtn onClick={() => setZoom((z) => Math.max(1, +(z - 0.2).toFixed(2)))} label="Zoom out"><Minus size={15} /></CtrlBtn>
        <div className="h-px bg-line" />
        <CtrlBtn onClick={() => setZoom(1)} label="Recenter"><LocateFixed size={15} /></CtrlBtn>
      </div>

      {/* legend */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-30 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-line bg-black/55 px-3 py-2 backdrop-blur-md">
        {(["normal", "active", "urgent", "arriving", "vacant"] as VillaState[]).map((k) => (
          <span key={k} className="flex items-center gap-1.5 text-[10.5px] text-ink-3">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: VILLA_STATE_META[k].hex, boxShadow: `0 0 6px ${VILLA_STATE_META[k].hex}` }} />
            {VILLA_STATE_META[k].label}
          </span>
        ))}
        <span className="mx-1 h-3 w-px bg-line" />
        <span className="flex items-center gap-1.5 text-[10.5px] text-ink-3"><Users size={11} /> Staff</span>
        <span className="flex items-center gap-1.5 text-[10.5px] text-ink-3"><Car size={11} /> Vehicle</span>
      </div>
    </div>
  );
}

function CtrlBtn({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) {
  return <button onClick={onClick} aria-label={label} className="grid h-9 w-9 place-items-center text-ink-2 transition-colors hover:bg-white/[0.06] hover:text-ink">{children}</button>;
}

/* ------------------------- stylized Marbella map ------------------------ */
function MapCanvas({ showZones }: { showZones: boolean }) {
  // deterministic urban block texture
  const blocks = useMemo(() => Array.from({ length: 120 }, (_, i) => {
    const h = (n: number) => ((Math.imul(i + 3, 2654435761 + n) >>> 0) % 1000) / 1000;
    const x = h(1) * W, y = h(2) * (H * 0.72);
    return { x, y, w: 6 + h(3) * 20, vertical: h(4) > 0.5 };
  }), []);

  return (
    <div className="absolute inset-0">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0b1220" />
            <stop offset="60%" stopColor="#080d18" />
            <stop offset="100%" stopColor="#070b14" />
          </linearGradient>
          <linearGradient id="sea" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0a1830" />
            <stop offset="100%" stopColor="#050b18" />
          </linearGradient>
        </defs>

        {/* land */}
        <rect width={W} height={H} fill="url(#land)" />

        {/* urban block texture (very faint) */}
        <g stroke="#2e7dff" strokeOpacity="0.05" strokeWidth="1">
          {blocks.map((b, i) => b.vertical
            ? <line key={i} x1={b.x} y1={b.y} x2={b.x} y2={b.y + b.w} />
            : <line key={i} x1={b.x} y1={b.y} x2={b.x + b.w} y2={b.y} />)}
        </g>

        {/* the sea (Mediterranean, to the south) */}
        <path d={`M0,${0.9 * H} C ${0.22 * W},${0.86 * H} ${0.42 * W},${0.78 * H} ${0.62 * W},${0.66 * H} C ${0.78 * W},${0.57 * H} ${0.9 * W},${0.55 * H} ${W},${0.5 * H} L${W},${H} L0,${H} Z`} fill="url(#sea)" />
        {/* coastline highlight */}
        <path d={`M0,${0.9 * H} C ${0.22 * W},${0.86 * H} ${0.42 * W},${0.78 * H} ${0.62 * W},${0.66 * H} C ${0.78 * W},${0.57 * H} ${0.9 * W},${0.55 * H} ${W},${0.5 * H}`} fill="none" stroke="#3f7fd0" strokeOpacity="0.5" strokeWidth="1.4" />
        {/* faint beach glow */}
        <path d={`M0,${0.9 * H} C ${0.22 * W},${0.86 * H} ${0.42 * W},${0.78 * H} ${0.62 * W},${0.66 * H} C ${0.78 * W},${0.57 * H} ${0.9 * W},${0.55 * H} ${W},${0.5 * H}`} fill="none" stroke="#2e7dff" strokeOpacity="0.18" strokeWidth="7" />

        {/* arterial roads */}
        <g fill="none" strokeLinecap="round">
          {/* A-7 coastal road, parallel & just inland of the coast */}
          <path d={`M0,${0.78 * H} C ${0.24 * W},${0.74 * H} ${0.46 * W},${0.66 * H} ${0.66 * W},${0.55 * H} C ${0.8 * W},${0.48 * H} ${0.9 * W},${0.45 * H} ${W},${0.41 * H}`} stroke="#b9c2d6" strokeOpacity="0.16" strokeWidth="2.4" />
          {/* AP-7 higher inland */}
          <path d={`M0,${0.5 * H} C ${0.3 * W},${0.46 * H} ${0.55 * W},${0.4 * H} ${W},${0.3 * H}`} stroke="#b9c2d6" strokeOpacity="0.1" strokeWidth="2" />
          {/* connectors to the hills */}
          <path d={`M${0.24 * W},${0.74 * H} C ${0.2 * W},${0.6 * H} ${0.16 * W},${0.5 * H} ${0.14 * W},${0.2 * H}`} stroke="#b9c2d6" strokeOpacity="0.09" strokeWidth="1.6" />
          <path d={`M${0.5 * W},${0.62 * H} C ${0.5 * W},${0.45 * H} ${0.5 * W},${0.3 * H} ${0.5 * W},${0.16 * H}`} stroke="#b9c2d6" strokeOpacity="0.09" strokeWidth="1.6" />
          <path d={`M${0.66 * W},${0.55 * H} C ${0.6 * W},${0.42 * H} ${0.42 * W},${0.34 * H} ${0.34 * W},${0.3 * H}`} stroke="#b9c2d6" strokeOpacity="0.08" strokeWidth="1.4" />
        </g>

        {/* ambient depth */}
        <rect width={W} height={H} fill="url(#land)" opacity="0" />
      </svg>

      {/* soft ambient blue light over the hills */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(60% 45% at 45% 12%, rgba(46,125,255,0.08), transparent 70%)" }} />
      {/* vignette */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 180px 50px rgba(0,0,0,0.65)" }} />

      {/* zone labels */}
      {showZones && MARBELLA_ZONES.map((z) => (
        <div key={z.name} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.18em] text-white/22"
          style={{ left: `${z.x * 100}%`, top: `${z.y * 100}%` }}>
          {z.name}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ villa card ------------------------------ */
function VillaMarker({ name, state, pt, open, guests, seed, selected, onSelect }: { name: string; state: VillaState; pt: Pt; open: number; guests: number; seed: number; selected: boolean; onSelect: () => void }) {
  const meta = VILLA_STATE_META[state];
  const urgent = state === "urgent";
  return (
    <button
      onClick={onSelect}
      data-villa
      aria-label={name}
      className="group absolute z-20 focus:outline-none"
      style={{ left: `${clampX(pt.x) * 100}%`, top: `${pt.y * 100}%`, transform: "translate(-50%,-100%)", transition: "left 1.9s linear, top 1.9s linear" }}
    >
      {/* the card */}
      <div className={cn(
        "relative w-[128px] overflow-hidden rounded-xl border bg-[#0b1220]/85 backdrop-blur-md transition-all duration-300",
        selected ? "border-accent/60" : "border-white/12 group-hover:-translate-y-0.5 group-hover:border-white/25"
      )}
        style={{ boxShadow: selected ? `0 18px 40px -16px rgba(0,0,0,0.85), 0 0 0 1px ${meta.hex}66` : "0 14px 34px -18px rgba(0,0,0,0.8)" }}>
        <div className="relative h-[48px] w-full">
          <VillaThumb state={state} seed={seed} className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(11,18,32,0.9))" }} />
          {urgent && <span aria-hidden className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ff5c5c]"><span className="absolute inset-0 animate-ping rounded-full bg-[#ff5c5c]" /></span>}
        </div>
        <div className="px-2.5 pb-2 pt-1.5">
          <div className="truncate text-[12px] font-semibold leading-tight text-white">{name}</div>
          <div className="mt-1 flex items-center justify-between gap-1">
            <span className="flex items-center gap-1 text-[10px]" style={{ color: meta.hex }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.hex, boxShadow: `0 0 6px ${meta.hex}` }} />
              {CARD_LABEL[state]}
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-ink-3">
              <span className="flex items-center gap-0.5"><Users size={9} /> {guests}</span>
              <span className={cn("flex items-center gap-0.5", open > 0 && "text-ink-2")}><MessageSquare size={9} /> {open}</span>
            </span>
          </div>
        </div>
      </div>
      {/* pin stem + ground point */}
      <div className="mx-auto h-3 w-px" style={{ background: `linear-gradient(${meta.hex}, transparent)` }} />
      <span className="mx-auto -mt-0.5 block h-2 w-2 rounded-full ring-2 ring-black/60" style={{ background: meta.hex, boxShadow: `0 0 10px ${meta.hex}` }} />
    </button>
  );
}

/* ------------------------------ fleet chip ------------------------------ */
const STATUS_ICON: Partial<Record<LiveStatus, typeof Car>> = { driving: Car, walking: Footprints, working: Wrench };
function FleetChip({ s, following }: { s: LiveStaff; following: boolean }) {
  const meta = STATUS_META[s.status];
  const moving = s.status === "driving" || s.status === "walking";
  const offline = s.status === "offline";
  const Icon = STATUS_ICON[s.status] ?? (s.role.toLowerCase().includes("security") ? Shield : undefined);
  const first = s.name.split(" ")[0];
  return (
    <motion.div
      data-staff={s.id}
      className="pointer-events-none absolute z-[25] -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${s.pos.x * 100}%`, top: `${s.pos.y * 100}%`, transition: "left 1.9s linear, top 1.9s linear" }}
    >
      <div className={cn("flex flex-col items-center gap-1", offline && "opacity-45")}>
        <div className={cn("flex items-center gap-1.5 rounded-full border py-0.5 pl-0.5 pr-2 backdrop-blur-md",
          following ? "border-accent/60 bg-black/80" : "border-white/12 bg-black/65")}
          style={{ boxShadow: moving ? `0 0 18px -4px ${meta.hex}` : "0 6px 18px -8px rgba(0,0,0,0.8)" }}>
          <span className="relative grid h-6 w-6 place-items-center rounded-full text-[8.5px] font-semibold text-white"
            style={{ background: `linear-gradient(180deg, ${meta.hex}, ${meta.hex}cc)` }}>
            {Icon ? <Icon size={12} /> : s.initials}
            {moving && <span aria-hidden className="absolute inset-0 animate-ping rounded-full" style={{ boxShadow: `0 0 0 1px ${meta.hex}` }} />}
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[10px] font-medium text-white">{first}</span>
            <span className="text-[8.5px] lowercase tracking-wide" style={{ color: offline ? "rgba(255,255,255,0.4)" : meta.hex }}>
              {meta.label.toLowerCase()}{moving && s.etaMin ? ` · ${s.etaMin}m` : ""}
            </span>
          </span>
        </div>
        {/* ground point */}
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.hex, boxShadow: `0 0 8px ${meta.hex}` }} />
      </div>
    </motion.div>
  );
}

/* ------------------------------ route layer ----------------------------- */
function RouteLayer({ routes, layout }: { routes: LiveStaff[]; layout: Map<string, Pt> }) {
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 z-10 h-full w-full" preserveAspectRatio="none" viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id="routegrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2e7dff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#7fb0ff" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      {routes.map((s) => {
        const d = layout.get(s.targetPropertyId!); if (!d) return null;
        const ax = s.pos.x * W, ay = s.pos.y * H, bx = d.x * W, by = d.y * H;
        // gentle curve: perpendicular control-point offset
        const mx = (ax + bx) / 2, my = (ay + by) / 2;
        const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
        const cx = mx - (dy / len) * len * 0.14, cy = my + (dx / len) * len * 0.14;
        const path = `M${ax},${ay} Q${cx},${cy} ${bx},${by}`;
        return (
          <g key={`r_${s.id}`}>
            <path d={path} fill="none" stroke="url(#routegrad)" strokeWidth={2.4} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
            <path d={path} fill="none" stroke="#bcd6ff" strokeWidth={2.2} vectorEffect="non-scaling-stroke" strokeLinecap="round" className="live-flow" />
            <circle r={2.4} fill="#eaf2ff">
              <animateMotion dur="1.8s" repeatCount="indefinite" path={path} />
            </circle>
          </g>
        );
      })}
    </svg>
  );
}
