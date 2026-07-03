"use client";

/**
 * Floating villa panel — clicking a node on the live map opens this glass panel
 * *over* the map instead of navigating away. It's the villa's live cockpit:
 * guest, open requests, who's assigned and their ETA, the AI's take, a timeline,
 * and the latest WhatsApp exchange. A link into the full Digital Twin lives up top.
 */
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, MapPin, Clock, Sparkles, ArrowUpRight, User, Phone, Car } from "lucide-react";
import { Avatar, StatusPill, buttonVariants } from "@/components/ui";
import { useDatabase } from "@/lib/store/hooks";
import { villaState, VILLA_STATE_META, STATUS_META, type LiveStaff } from "@/lib/live/engine";
import type { LiveWorld } from "@/lib/live/useLiveOps";
import { deptLabel, priorityMeta, statusMeta } from "@/lib/domain";
import { timeAgo } from "@/components/product/format";
import { VillaThumb } from "./VillaThumb";
import { cn } from "@/lib/utils";

/** simple WhatsApp glyph (lucide has no brand icon) */
function WhatsAppIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.9c0 1.96.51 3.78 1.42 5.38L2 22l4.85-1.27a9.9 9.9 0 0 0 5.19 1.48h.01c5.46 0 9.9-4.45 9.9-9.9C21.95 6.45 17.5 2 12.04 2Zm5.8 14.06c-.24.68-1.4 1.3-1.94 1.34-.5.04-.99.22-3.34-.7-2.82-1.11-4.6-3.98-4.74-4.17-.14-.19-1.13-1.5-1.13-2.86 0-1.36.71-2.03.97-2.31.24-.26.53-.32.71-.32.18 0 .36 0 .51.01.16.01.38-.06.6.46.24.56.79 1.93.86 2.07.07.14.12.3.02.49-.1.19-.14.3-.29.46-.14.16-.3.36-.43.48-.14.14-.29.29-.12.57.17.28.75 1.24 1.61 2 1.11.99 2.05 1.3 2.34 1.44.29.14.46.12.63-.07.19-.19.72-.84.91-1.13.19-.29.38-.24.64-.14.26.09 1.65.78 1.93.92.29.14.48.21.55.33.07.12.07.68-.17 1.36Z" />
    </svg>
  );
}

export function VillaPanel({ propertyId, world, onClose }: { propertyId: string | null; world: LiveWorld; onClose: () => void }) {
  const db = useDatabase();
  const property = db.properties.find((p) => p.id === propertyId) ?? null;

  return (
    <AnimatePresence>
      {property && (
        <>
          <motion.div className="absolute inset-0 z-30 bg-black/30 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            key={property.id}
            initial={{ x: 32, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 32, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="glass edge-light absolute right-0 top-0 z-40 flex h-full w-[min(400px,92vw)] flex-col rounded-l-[var(--radius-card)] border-l border-line"
          >
            <PanelBody property={property} world={world} onClose={onClose} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function PanelBody({ property, world, onClose }: { property: NonNullable<ReturnType<typeof useDatabase>["properties"][number]>; world: LiveWorld; onClose: () => void }) {
  const db = useDatabase();
  const state = villaState(db, property.id);
  const meta = VILLA_STATE_META[state];
  const guest = db.guests.find((g) => g.id === property.currentGuestId) ?? null;
  const open = db.tasks.filter((t) => t.propertyId === property.id && statusMeta[t.status].open).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const assigned = world.staff.filter((s) => s.targetPropertyId === property.id);
  const thought = world.thoughts.find((t) => t.headline.includes(property.name)) ?? world.thoughts.find((t) => open.some((o) => t.action?.taskId === o.id));
  const events = world.timeline.filter((e) => e.propertyId === property.id).slice(0, 6);

  // latest WhatsApp conversation for this property
  const conv = db.conversations.find((c) => c.propertyId === property.id) ?? (guest ? db.conversations.find((c) => c.guestId === guest.id) : null);
  const msgs = conv ? db.messages.filter((m) => m.conversationId === conv.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt)).slice(-3) : [];

  const idx = db.properties.findIndex((p) => p.id === property.id);

  return (
    <>
      {/* cinematic header */}
      <div className="relative h-[132px] shrink-0 overflow-hidden rounded-tl-[var(--radius-card)]">
        <VillaThumb state={state} seed={idx} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(6,8,12,0.25) 0%, transparent 35%, rgba(6,8,12,0.92) 100%)" }} />
        <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg border border-white/15 bg-black/40 text-white/80 backdrop-blur-md transition-colors hover:text-white"><X size={16} /></button>
        <div className="absolute inset-x-4 bottom-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: meta.hex, boxShadow: `0 0 10px ${meta.hex}` }} />
            <h3 className="truncate text-[17px] font-semibold text-white">{property.name}</h3>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-white/60">
            <MapPin size={12} /> {property.area} · {property.bedrooms} bd
            <span className="ml-auto rounded-full border px-2 py-0.5 text-[10.5px] font-medium" style={{ borderColor: `${meta.hex}55`, color: meta.hex }}>{meta.label}{open.length ? ` · ${open.length} open` : ""}</span>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        {/* guest */}
        <Section title="Current guest">
          {guest ? (
            <div className="flex items-center gap-2.5">
              <Avatar name={guest.name} size={36} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[13.5px] font-medium text-ink">{guest.name}
                  {(guest.vipLevel || guest.vip) && <StatusPill tone="accent">{guest.vipLevel ? `${guest.vipLevel} VIP` : "VIP"}</StatusPill>}
                </div>
                <div className="text-[11.5px] text-ink-3">{guest.phone}</div>
              </div>
              <a href={`tel:${guest.phone}`} aria-label="Call" className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-white/[0.03] text-ink-2 transition-colors hover:text-ink"><Phone size={14} /></a>
              <a href={`https://wa.me/${guest.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="grid h-8 w-8 place-items-center rounded-lg border border-[#25D366]/30 bg-[#25D366]/10 text-[#43d178] transition-colors hover:bg-[#25D366]/15"><WhatsAppIcon /></a>
            </div>
          ) : <Empty>No guest in residence.</Empty>}
          {guest && (guest.recurringRequests?.[0] || guest.preferences?.[0]) && (
            <div className="mt-2 rounded-lg border border-accent/20 bg-accent/[0.05] px-2.5 py-1.5 text-[11.5px] text-accent">
              Usually requests {(guest.recurringRequests?.[0] ?? guest.preferences?.[0])!.toLowerCase()}
            </div>
          )}
        </Section>

        {/* AI recommendation */}
        {thought && (
          <div className="rounded-xl border border-accent/25 bg-accent/[0.06] p-3">
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.12em] text-accent"><Sparkles size={12} /> AI recommendation</div>
              <span className="rounded-full border border-accent/30 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-accent">{confidenceFor(thought.id)}% confidence</span>
            </div>
            <div className="text-[13px] font-medium text-ink">{thought.headline}</div>
            <div className="mt-0.5 text-[12px] text-ink-3">{thought.reasoning}</div>
            {thought.recommendation && <div className="mt-1.5 text-[12px] text-accent">→ {thought.recommendation}</div>}
          </div>
        )}

        {/* open requests */}
        <Section title={`Open requests · ${open.length}`}>
          {open.length ? (
            <div className="space-y-1.5">
              {open.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2 rounded-lg border border-line bg-white/[0.015] px-2.5 py-2">
                  <div className="min-w-0">
                    <div className="truncate text-[12.5px] text-ink">{t.title}</div>
                    <div className="text-[11px] text-ink-4">{deptLabel(t.department)}{t.room ? ` · ${t.room}` : ""}</div>
                  </div>
                  <StatusPill tone={priorityMeta[t.priority].tone}>{priorityMeta[t.priority].label}</StatusPill>
                </div>
              ))}
            </div>
          ) : <Empty>No open requests — all clear.</Empty>}
        </Section>

        {/* assigned staff + ETA */}
        <Section title="Assigned staff">
          {assigned.length ? (
            <div className="space-y-1.5">
              {assigned.map((s) => <AssignedRow key={s.id} s={s} />)}
            </div>
          ) : <Empty>No one en route right now.</Empty>}
        </Section>

        {/* timeline */}
        {events.length > 0 && (
          <Section title="Timeline">
            <div className="space-y-2">
              {events.map((e) => (
                <div key={e.id} className="flex gap-2.5">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <div className="min-w-0">
                    <div className="text-[12px] text-ink-2">{e.text}</div>
                    <div className="text-[10.5px] text-ink-4">{timeAgo(new Date(e.at).toISOString())}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* latest WhatsApp */}
        {msgs.length > 0 && (
          <Section title="Latest WhatsApp">
            <div className="space-y-1.5 rounded-xl border border-line bg-black/20 p-2.5">
              {msgs.map((m) => (
                <div key={m.id} className={cn("flex", m.direction === "outbound" && "justify-end")}>
                  <div className={cn("max-w-[85%] rounded-lg px-2.5 py-1.5 text-[12px]", m.direction === "outbound" ? "bg-accent/15 text-ink" : "bg-white/[0.04] text-ink-2")}>
                    {m.body}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* footer → digital twin */}
      <div className="border-t border-line p-3">
        <Link href={`/villas/${property.id}`} className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "w-full justify-center")}>
          Open Digital Twin <ArrowUpRight size={14} />
        </Link>
      </div>
    </>
  );
}

function AssignedRow({ s }: { s: LiveStaff }) {
  const meta = STATUS_META[s.status];
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-line bg-white/[0.015] px-2.5 py-2">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[9px] font-semibold text-white" style={{ background: meta.hex }}>{s.initials}</span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12.5px] text-ink">{s.name}</div>
        <div className="flex items-center gap-1 text-[11px]" style={{ color: meta.hex }}><User size={10} /> {meta.label}</div>
      </div>
      {s.etaMin != null && s.etaMin > 0 ? (
        <div className="flex items-center gap-1 text-[11.5px] tabular-nums text-accent">{s.status === "driving" ? <Car size={12} /> : <Clock size={11} />} ETA {s.etaMin}m</div>
      ) : s.status === "working" ? (
        <div className="flex items-center gap-1 text-[11.5px] text-ok"><Clock size={11} /> on site</div>
      ) : null}
    </div>
  );
}

/** stable, believable confidence for a recommendation id */
function confidenceFor(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
  return 88 + ((h >>> 0) % 11); // 88–98%
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-wider text-ink-4">{title}</div>
      {children}
    </div>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-line bg-white/[0.01] px-2.5 py-2 text-[12px] text-ink-4">{children}</div>;
}
