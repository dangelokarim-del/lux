"use client";

/**
 * Map-ready panel (P3 foundation). LUXA already models where every property and
 * staff member is; this panel is the seam the live GPS map will plug into. Until
 * real tracking is connected it shows honest placeholders — nearest *available*
 * staff (computed from schedule + workload), an ETA slot, and a clear
 * "not connected yet" note — so the product tells the truth in demo mode.
 */
import { useMemo } from "react";
import { MapPin, Navigation, Radio, Clock } from "lucide-react";
import { Card, Avatar } from "@/components/ui";
import { useDatabase } from "@/lib/store/hooks";
import { computeAvailability, isAvailable, openTaskCount } from "@/lib/services/availability";

/** great-circle distance in km (haversine) */
function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function MapReadyPanel() {
  const db = useDatabase();

  const view = useMemo(() => {
    // focus property: an arriving villa (welcome prep) else the first occupied
    const focus = db.properties.find((p) => p.status === "arriving") ?? db.properties.find((p) => p.status === "occupied") ?? db.properties[0] ?? null;
    const hasCoords = focus && focus.latitude != null && focus.longitude != null;

    const ranked = db.staff
      .map((s) => {
        const av = computeAvailability(s, db);
        const dist = hasCoords && s.lastKnownLat != null && s.lastKnownLng != null
          ? distanceKm(focus!.latitude!, focus!.longitude!, s.lastKnownLat, s.lastKnownLng)
          : null;
        return { s, av, load: openTaskCount(db, s.id), dist };
      })
      // nearest available first: sort by known distance, then by workload
      .sort((a, b) => {
        if (a.dist != null && b.dist != null && a.dist !== b.dist) return a.dist - b.dist;
        return a.load - b.load;
      });

    const available = ranked.filter((r) => isAvailable(r.av));
    const nearest = available[0] ?? null;
    const tracked = db.staff.filter((s) => s.lastKnownLat != null).length;
    return { focus, nearest, available, tracked };
  }, [db]);

  const { focus, nearest, available, tracked } = view;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[12px] font-medium text-ink-2">
          <MapPin size={14} className="text-accent" /> Live map
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-line bg-white/[0.03] px-2 py-0.5 text-[10.5px] text-ink-4">
          <Radio size={10} /> Map-ready
        </span>
      </div>

      {focus ? (
        <div className="mt-3 text-[12.5px] text-ink-3">
          Focus · <span className="text-ink-2">{focus.name}</span>
          <span className="text-ink-4"> · {focus.area}</span>
        </div>
      ) : (
        <div className="mt-3 text-[12.5px] text-ink-3">No properties to locate yet.</div>
      )}

      {/* nearest available staff */}
      <div className="mt-3 rounded-lg border border-line bg-white/[0.012] p-3">
        <div className="text-[10.5px] uppercase tracking-wider text-ink-4">Nearest available staff</div>
        {nearest ? (
          <div className="mt-2 flex items-center gap-2.5">
            <Avatar name={nearest.s.name} size={32} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium text-ink">{nearest.s.name}</div>
              <div className="text-[11.5px] text-ink-3">{nearest.av.label} · {nearest.av.reason}</div>
            </div>
            <div className="flex items-center gap-1 text-[11.5px] text-ink-4">
              <Clock size={12} /> ETA —
            </div>
          </div>
        ) : (
          <div className="mt-2 text-[12.5px] text-ink-3">Nobody is available right now — route to a manager.</div>
        )}
      </div>

      {/* staff nearby count */}
      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-line bg-white/[0.012] px-3 py-2">
          <div className="text-[18px] font-semibold tabular-nums text-ink">{available.length}</div>
          <div className="text-[10.5px] uppercase tracking-wider text-ink-4">Available nearby</div>
        </div>
        <div className="rounded-lg border border-line bg-white/[0.012] px-3 py-2">
          <div className="text-[18px] font-semibold tabular-nums text-ink">{tracked}</div>
          <div className="text-[10.5px] uppercase tracking-wider text-ink-4">Location on file</div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[11.5px] text-ink-4">
        <Navigation size={12} /> Location tracking not connected yet — showing schedule-based routing.
      </div>
    </Card>
  );
}
