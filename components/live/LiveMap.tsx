"use client";

/**
 * The Live Property Map — the centrepiece of Live Operations. Villas are glowing
 * nodes colored by their live state; staff move across the map like Uber drivers,
 * their dots easing between positions each tick. It reads like a control room for
 * a portfolio of luxury villas, not an admin table.
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import { useDatabase } from "@/lib/store/hooks";
import { villaState, VILLA_STATE_META, STATUS_META, type LiveStaff, type Pt } from "@/lib/live/engine";
import type { LiveWorld } from "@/lib/live/useLiveOps";
import { statusMeta } from "@/lib/domain";
import { cn } from "@/lib/utils";

export function LiveMap({ world, selectedId, onSelect }: { world: LiveWorld; selectedId: string | null; onSelect: (id: string) => void }) {
  const db = useDatabase();
  const { layout, staff } = world;

  const nodes = useMemo(
    () => db.properties.map((p) => ({ p, pt: layout.get(p.id) ?? { x: 0.5, y: 0.5 }, state: villaState(db, p.id), open: db.tasks.filter((t) => t.propertyId === p.id && statusMeta[t.status].open).length })),
    [db, layout]
  );

  return (
    <div className="relative h-full min-h-[440px] w-full overflow-hidden rounded-[var(--radius-card)] border border-line">
      {/* map surface — deep, cinematic, faint terrain */}
      <div aria-hidden className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 30% 0%, #0e1524 0%, #080a10 55%, #050507 100%)" }} />
      <div aria-hidden className="bg-grid absolute inset-0 opacity-[0.5]" />
      <Terrain />
      <div aria-hidden className="spotlight absolute inset-x-0 top-0 h-40" />

      {/* connection lines: staff → their target villa */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full">
        {staff.filter((s) => s.targetPropertyId && (s.status === "driving" || s.status === "walking")).map((s) => {
          const dest = layout.get(s.targetPropertyId!);
          if (!dest) return null;
          return (
            <line key={`l_${s.id}`} x1={`${s.pos.x * 100}%`} y1={`${s.pos.y * 100}%`} x2={`${dest.x * 100}%`} y2={`${dest.y * 100}%`}
              stroke={STATUS_META[s.status].hex} strokeOpacity={0.28} strokeWidth={1.2} strokeDasharray="3 4" />
          );
        })}
      </svg>

      {/* villa nodes */}
      {nodes.map(({ p, pt, state, open }) => (
        <VillaNode key={p.id} name={p.name} area={p.area} pt={pt} hex={VILLA_STATE_META[state].hex} open={open}
          selected={selectedId === p.id} onSelect={() => onSelect(p.id)} />
      ))}

      {/* live staff */}
      {staff.map((s) => <StaffDot key={s.id} s={s} />)}

      {/* legend */}
      <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-x-3 gap-y-1 rounded-lg border border-line bg-black/40 px-3 py-2 backdrop-blur-md">
        {(["urgent", "active", "arriving", "normal", "vacant"] as const).map((k) => (
          <span key={k} className="flex items-center gap-1.5 text-[10.5px] text-ink-3">
            <span className="h-2 w-2 rounded-full" style={{ background: VILLA_STATE_META[k].hex, boxShadow: `0 0 8px ${VILLA_STATE_META[k].hex}` }} />
            {VILLA_STATE_META[k].label}
          </span>
        ))}
      </div>
    </div>
  );
}

function VillaNode({ name, area, pt, hex, open, selected, onSelect }: { name: string; area: string; pt: Pt; hex: string; open: number; selected: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      data-villa
      aria-label={name}
      className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 focus:outline-none"
      style={{ left: `${pt.x * 100}%`, top: `${pt.y * 100}%`, transition: "left 1.9s linear, top 1.9s linear" }}
    >
      {/* glow */}
      <span aria-hidden className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-md transition-opacity group-hover:opacity-100" style={{ background: hex }} />
      {/* pulsing ring */}
      <span aria-hidden className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ boxShadow: `0 0 0 1px ${hex}` }}>
        <span className="absolute inset-0 animate-ping rounded-full" style={{ boxShadow: `0 0 0 1px ${hex}` }} />
      </span>
      {/* core */}
      <span className={cn("relative block h-3 w-3 rounded-full ring-2 ring-black/60 transition-transform group-hover:scale-125", selected && "scale-125")} style={{ background: hex, boxShadow: `0 0 12px ${hex}` }} />
      {/* label */}
      <span className={cn("absolute left-1/2 top-[14px] -translate-x-1/2 whitespace-nowrap rounded-md border border-line bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-ink backdrop-blur-md transition-opacity",
        selected ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
        {name}{open > 0 && <span className="ml-1 text-ink-3">· {open}</span>}
        <span className="ml-1 hidden text-ink-4 sm:inline">· {area}</span>
      </span>
    </button>
  );
}

function StaffDot({ s }: { s: LiveStaff }) {
  const hex = STATUS_META[s.status].hex;
  const moving = s.status === "driving" || s.status === "walking";
  if (s.status === "offline") return null;
  return (
    <motion.div
      data-staff={s.id}
      className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${s.pos.x * 100}%`, top: `${s.pos.y * 100}%`, transition: "left 1.9s linear, top 1.9s linear" }}
    >
      <span className="relative grid h-5 w-5 place-items-center rounded-full text-[8px] font-semibold text-white ring-2 ring-black/70"
        style={{ background: `linear-gradient(180deg, ${hex}, ${hex}bb)`, boxShadow: `0 0 10px ${hex}88` }}>
        {s.initials}
        {moving && <span aria-hidden className="absolute inset-0 animate-ping rounded-full" style={{ boxShadow: `0 0 0 1px ${hex}` }} />}
      </span>
    </motion.div>
  );
}

/** a faint coastline / terrain flourish so the map feels like a place, not a grid */
function Terrain() {
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.5]" preserveAspectRatio="none" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="coast" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2e7dff" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#2e7dff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0,74 C18,66 30,80 46,74 C64,67 78,82 100,72 L100,100 L0,100 Z" fill="url(#coast)" />
      <path d="M0,74 C18,66 30,80 46,74 C64,67 78,82 100,72" fill="none" stroke="#2e7dff" strokeOpacity="0.14" strokeWidth="0.4" />
    </svg>
  );
}
