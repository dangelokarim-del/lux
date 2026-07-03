"use client";

/**
 * useLiveOps — the clock behind Live Operations.
 *
 * It seeds a simulation world from the live store and, every ~2 seconds, ticks
 * it forward: staff move, ETAs count down, tasks complete in-sim, the timeline
 * writes itself, and the AI re-thinks. It's ephemeral (never touches persistence)
 * and reseeds cleanly when the org or the underlying data changes. When real GPS
 * lands, only the position source changes — the shapes stay identical.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useDatabase } from "@/lib/store/hooks";
import {
  layoutProperties, seedStaffSim, tickStaff, think, livePulse,
  type LiveStaff, type StaffSim, type TimelineEvent, type AiThought, type Pt,
} from "./engine";
import { statusMeta } from "@/lib/domain";

const TICK_MS = 2000;
const MAX_TIMELINE = 40;

export interface LiveWorld {
  now: number;
  layout: Map<string, Pt>;
  staff: LiveStaff[];
  timeline: TimelineEvent[];
  thoughts: AiThought[];
  pulse: ReturnType<typeof livePulse>;
}

export function useLiveOps(): LiveWorld {
  const db = useDatabase();
  const sims = useRef<Map<string, StaffSim>>(new Map());
  const prevStatus = useRef<Map<string, string>>(new Map());
  const seededTimeline = useRef(false);

  const layout = useMemo(() => layoutProperties(db.properties), [db.properties]);

  const [staff, setStaff] = useState<LiveStaff[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [thoughts, setThoughts] = useState<AiThought[]>([]);
  const [now, setNow] = useState<number>(() => Date.now());

  // reseed sim cells whenever the roster changes (keep existing cells for stable ids)
  useEffect(() => {
    const next = new Map<string, StaffSim>();
    for (const s of db.staff) {
      next.set(s.id, sims.current.get(s.id) ?? seedStaffSim(s, layout, db.properties));
    }
    sims.current = next;
  }, [db.staff, layout, db.properties]);

  // seed the timeline once from real recent activity so it doesn't start empty
  useEffect(() => {
    if (seededTimeline.current) return;
    seededTimeline.current = true;
    const seed: TimelineEvent[] = [];
    const recent = [...db.notes]
      .filter((n) => n.system)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 8);
    for (const n of recent) {
      const task = db.tasks.find((t) => t.id === n.taskId);
      seed.push({
        id: `seed_${n.id}`,
        at: new Date(n.createdAt).getTime(),
        kind: /assign|escalat|rebalanc/i.test(n.body) ? "assignment" : /complet/i.test(n.body) ? "completed" : "ai",
        text: n.body,
        sub: task?.code,
        propertyId: task?.propertyId,
      });
    }
    setTimeline(seed.sort((a, b) => b.at - a.at));
  }, [db.notes, db.tasks]);

  useEffect(() => {
    let mounted = true;
    const step = () => {
      if (!mounted) return;
      const d = new Date();
      const snapshot: LiveStaff[] = db.staff.map((s) => {
        const sim = sims.current.get(s.id) ?? seedStaffSim(s, layout, db.properties);
        sims.current.set(s.id, sim);
        return tickStaff(s, sim, db, layout, d);
      });

      // detect status transitions → write timeline events
      const events: TimelineEvent[] = [];
      for (const l of snapshot) {
        const prev = prevStatus.current.get(l.id);
        if (prev !== l.status) {
          prevStatus.current.set(l.id, l.status);
          if (prev) {
            const propName = l.targetPropertyId ? db.properties.find((p) => p.id === l.targetPropertyId)?.name : null;
            if (l.status === "driving" || l.status === "walking") {
              if (l.taskTitle) events.push(mk("enroute", `${first(l.name)} en route${propName ? ` to ${propName}` : ""}`, l.taskTitle, l.targetPropertyId, l.id, d));
            } else if (l.status === "working" && l.taskTitle) {
              events.push(mk("accepted", `${first(l.name)} started ${l.taskTitle}`, propName ?? undefined, l.targetPropertyId, l.id, d));
            } else if (prev === "working" && (l.status === "returning" || l.status === "available")) {
              events.push(mk("completed", `${first(l.name)} completed a task`, propName ?? undefined, l.targetPropertyId, l.id, d));
            }
          }
        }
      }

      if (mounted) {
        setStaff(snapshot);
        setNow(d.getTime());
        if (events.length) setTimeline((t) => [...events, ...t].slice(0, MAX_TIMELINE));
        // re-think periodically (every other tick) to keep it feeling continuous but calm
        if (Math.floor(d.getTime() / TICK_MS) % 2 === 0) {
          setThoughts(think(db, snapshot, d));
        }
      }
    };
    step();
    const iv = setInterval(step, TICK_MS);
    return () => { mounted = false; clearInterval(iv); };
    // db identity changes on every store commit; layout memoized on properties
  }, [db, layout]);

  const pulse = useMemo(() => livePulse(db, staff), [db, staff]);

  return { now, layout, staff, timeline, thoughts, pulse };
}

const first = (n: string) => n.split(" ")[0];
let seq = 0;
function mk(kind: TimelineEvent["kind"], text: string, sub: string | undefined, propertyId: string | null | undefined, staffId: string, d: Date): TimelineEvent {
  return { id: `ev_${d.getTime()}_${seq++}`, at: d.getTime(), kind, text, sub, propertyId, staffId };
}

/** convenience for panels: the open tasks at a property, newest first */
export function openTasksAt(db: ReturnType<typeof useDatabase>, propertyId: string) {
  return db.tasks
    .filter((t) => t.propertyId === propertyId && statusMeta[t.status].open)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
