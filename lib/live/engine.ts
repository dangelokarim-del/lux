/**
 * LUXA Live Operations — the simulation & reasoning engine.
 *
 * This is what makes the operation feel *alive*. From the real store (properties,
 * staff, tasks, guests, schedules) it derives a continuously-moving world:
 *   • staff behave like Uber drivers — walking / driving / working / returning —
 *     with live positions, ETAs and workload;
 *   • an operations timeline that writes itself as things happen;
 *   • an AI that thinks every few seconds and explains *why* it recommends
 *     something (including "wait — Diego frees up in 6 min" over a reassignment).
 *
 * Everything here is pure & ephemeral: it never mutates the persisted store, so
 * demo mode and live mode both stay correct. When real GPS arrives, the same
 * shapes are populated from device coordinates instead of the simulator.
 */
import { deptLabel, statusMeta, type Database, type Property, type Staff, type Task } from "@/lib/domain";
import { computeAvailability } from "@/lib/services/availability";

/* ------------------------------ geometry -------------------------------- */
/** normalized map position in the unit square [0,1]² */
export interface Pt { x: number; y: number }

/** deterministic pseudo-random in [0,1) from a string — stable across ticks */
function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 100000) / 100000;
}

/**
 * Place every property in the unit square. If real lat/lng exist we normalize
 * them into a padded box (north = up); otherwise we synthesize a stable spot so
 * the map still reads for orgs without coordinates yet.
 */
export function layoutProperties(properties: Property[]): Map<string, Pt> {
  const out = new Map<string, Pt>();
  const withGeo = properties.filter((p) => p.latitude != null && p.longitude != null);
  const pad = 0.12;
  if (withGeo.length >= 2) {
    const lats = withGeo.map((p) => p.latitude!);
    const lngs = withGeo.map((p) => p.longitude!);
    const minLa = Math.min(...lats), maxLa = Math.max(...lats);
    const minLo = Math.min(...lngs), maxLo = Math.max(...lngs);
    const spanLa = maxLa - minLa || 1, spanLo = maxLo - minLo || 1;
    const norm = (v: number, min: number, span: number) => pad + ((v - min) / span) * (1 - 2 * pad);
    for (const p of properties) {
      if (p.latitude != null && p.longitude != null) {
        out.set(p.id, { x: norm(p.longitude, minLo, spanLo), y: 1 - norm(p.latitude, minLa, spanLa) });
      } else {
        out.set(p.id, { x: pad + hash01(p.id) * (1 - 2 * pad), y: pad + hash01(p.id + "y") * (1 - 2 * pad) });
      }
    }
  } else {
    for (const p of properties) {
      out.set(p.id, { x: pad + hash01(p.id) * (1 - 2 * pad), y: pad + hash01(p.id + "y") * (1 - 2 * pad) });
    }
  }
  return out;
}

/** map-space distance (unit square) → rough minutes, tuned so the demo feels real */
export function etaMinutes(a: Pt, b: Pt, driving: boolean): number {
  const d = Math.hypot(a.x - b.x, a.y - b.y);
  const kmPerUnit = 14; // Marbella portfolio spans ~14km corner-to-corner
  const speed = driving ? 42 : 4.6; // km/h
  return Math.max(1, Math.round((d * kmPerUnit) / speed * 60));
}

/* ------------------------------- villas --------------------------------- */
export type VillaState = "normal" | "active" | "urgent" | "arriving" | "vacant";

export const VILLA_STATE_META: Record<VillaState, { label: string; hex: string; tone: string }> = {
  urgent:   { label: "Urgent",         hex: "#ff5c5c", tone: "urgent" },
  active:   { label: "Active requests", hex: "#f5b53d", tone: "warn" },
  arriving: { label: "Guest arriving",  hex: "#2e7dff", tone: "accent" },
  normal:   { label: "All good",        hex: "#4ad48a", tone: "ok" },
  vacant:   { label: "Vacant",          hex: "#8a8f98", tone: "muted" },
};

export function villaState(db: Database, propertyId: string): VillaState {
  const prop = db.properties.find((p) => p.id === propertyId);
  if (!prop) return "vacant";
  const open = db.tasks.filter((t) => t.propertyId === propertyId && statusMeta[t.status].open);
  if (open.some((t) => t.priority === "urgent")) return "urgent";
  if (prop.status === "arriving") return "arriving";
  if (open.length > 0) return "active";
  if (prop.status === "vacant" || prop.status === "cleaning") return "vacant";
  return "normal";
}

/* -------------------------------- staff --------------------------------- */
export type LiveStatus =
  | "available" | "walking" | "driving" | "working" | "returning" | "break" | "busy" | "offline";

export const STATUS_META: Record<LiveStatus, { label: string; hex: string; tone: string }> = {
  working:   { label: "Working",   hex: "#4ad48a", tone: "ok" },
  driving:   { label: "Driving",   hex: "#2e7dff", tone: "accent" },
  walking:   { label: "Walking",   hex: "#2e7dff", tone: "accent" },
  returning: { label: "Returning", hex: "#a78bfa", tone: "accent" },
  available: { label: "Available", hex: "#4ad48a", tone: "ok" },
  busy:      { label: "Busy",      hex: "#f5b53d", tone: "warn" },
  break:     { label: "On break",  hex: "#f5b53d", tone: "warn" },
  offline:   { label: "Offline",   hex: "#8a8f98", tone: "muted" },
};

export interface LiveStaff {
  id: string;
  name: string;
  initials: string;
  role: string;
  department: string;
  status: LiveStatus;
  pos: Pt;
  /** the property they're heading to / working at, if any */
  targetPropertyId: string | null;
  taskId: string | null;
  taskTitle: string | null;
  etaMin: number | null;
  completedToday: number;
  responseMin: number;
  workloadPct: number;
  openTasks: number;
  maxTasks: number;
}

/** per-staff mutable simulation cell, kept in a ref across ticks */
export interface StaffSim {
  pos: Pt;
  home: Pt;
  phase: "idle" | "enroute" | "working" | "returning";
  phaseTicks: number;
  doneTaskIds: Set<string>;
  completedToday: number;
  status: LiveStatus;
  taskId: string | null;
  targetPropertyId: string | null;
  etaMin: number | null;
}

const clamp01 = (v: number) => Math.max(0.04, Math.min(0.96, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** seed a staff sim cell from their real assignments + a stable home position */
export function seedStaffSim(staff: Staff, layout: Map<string, Pt>, properties: Property[]): StaffSim {
  // home = near their first assigned property, else a stable point on the map
  const homeProp = staff.assignedPropertyIds?.[0]
    ? layout.get(staff.assignedPropertyIds[0])
    : undefined;
  const home = homeProp
    ? { x: clamp01(homeProp.x + (hash01(staff.id) - 0.5) * 0.1), y: clamp01(homeProp.y + (hash01(staff.id + "h") - 0.5) * 0.1) }
    : { x: clamp01(hash01(staff.id)), y: clamp01(hash01(staff.id + "y")) };
  void properties;
  return {
    pos: { ...home }, home, phase: "idle", phaseTicks: 0, doneTaskIds: new Set(),
    completedToday: hashCompleted(staff.id), status: "available", taskId: null, targetPropertyId: null, etaMin: null,
  };
}

/** a believable "already completed today" starting count */
function hashCompleted(id: string): number {
  return 2 + Math.floor(hash01(id + "done") * 6);
}

const WORK_TICKS = 5; // ~10s of "working" at ~2s/tick before completing

/**
 * Advance one staff cell by a tick and return the render-ready LiveStaff.
 * Movement is driven by the person's real current open task (they head to its
 * property, work it, complete it in-sim, then take the next or return home).
 */
export function tickStaff(staff: Staff, sim: StaffSim, db: Database, layout: Map<string, Pt>, now: Date): LiveStaff {
  const av = computeAvailability(staff, db, now);
  const max = typeof staff.maxActiveTasks === "number" && staff.maxActiveTasks > 0 ? staff.maxActiveTasks : 5;

  // hard states from the schedule win — off shift / on leave / on break
  if (av.state === "off" || av.state === "leave") {
    ease(sim, sim.home, 0.18);
    sim.status = "offline"; sim.phase = "idle"; sim.taskId = null; sim.targetPropertyId = null; sim.etaMin = null;
    return render(staff, sim, db, max, av.open);
  }
  if (av.label === "On break") {
    sim.status = "break"; sim.taskId = null; sim.targetPropertyId = null; sim.etaMin = null;
    return render(staff, sim, db, max, av.open);
  }

  // pick the current task: the person's oldest open task not yet completed in-sim
  const openTasks = db.tasks
    .filter((t) => t.assigneeId === staff.id && statusMeta[t.status].open && t.propertyId && !sim.doneTaskIds.has(t.id))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const task = openTasks[0] ?? null;

  if (!task) {
    // nothing to do → drift home and be available
    const arrivedHome = dist(sim.pos, sim.home) < 0.02;
    if (!arrivedHome) { ease(sim, sim.home, 0.16); sim.status = "returning"; sim.phase = "returning"; }
    else { sim.status = "available"; sim.phase = "idle"; }
    sim.taskId = null; sim.targetPropertyId = null; sim.etaMin = null;
    return render(staff, sim, db, max, av.open);
  }

  const dest = layout.get(task.propertyId!) ?? sim.home;
  sim.taskId = task.id;
  sim.targetPropertyId = task.propertyId;

  const atDest = dist(sim.pos, dest) < 0.02;
  if (!atDest && sim.phase !== "working") {
    // en route — driving if far, walking if close
    const driving = dist(sim.pos, dest) > 0.22;
    ease(sim, dest, driving ? 0.22 : 0.12);
    sim.phase = "enroute";
    sim.status = driving ? "driving" : "walking";
    sim.etaMin = etaMinutes(sim.pos, dest, driving);
    return render(staff, sim, db, max, av.open);
  }

  // arrived → working
  if (sim.phase !== "working") { sim.phase = "working"; sim.phaseTicks = 0; }
  sim.pos = { x: lerp(sim.pos.x, dest.x, 0.5), y: lerp(sim.pos.y, dest.y, 0.5) };
  sim.status = "working";
  sim.etaMin = 0;
  sim.phaseTicks++;
  if (sim.phaseTicks >= WORK_TICKS) {
    // complete this task in-sim (ephemeral) and move on
    sim.doneTaskIds.add(task.id);
    sim.completedToday++;
    sim.phase = "returning";
    sim.phaseTicks = 0;
  }
  return render(staff, sim, db, max, av.open);
}

function render(staff: Staff, sim: StaffSim, db: Database, max: number, open: number): LiveStaff {
  const task = sim.taskId ? db.tasks.find((t) => t.id === sim.taskId) ?? null : null;
  return {
    id: staff.id, name: staff.name, initials: staff.initials, role: staff.role, department: staff.department,
    status: sim.status, pos: { ...sim.pos },
    targetPropertyId: sim.targetPropertyId, taskId: sim.taskId, taskTitle: task?.title ?? null, etaMin: sim.etaMin,
    completedToday: sim.completedToday, responseMin: 2 + Math.round(hash01(staff.id + "r") * 8),
    workloadPct: Math.min(100, Math.round((open / max) * 100)), openTasks: open, maxTasks: max,
  };
}

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
function ease(sim: StaffSim, to: Pt, t: number) {
  sim.pos = { x: clamp01(lerp(sim.pos.x, to.x, t)), y: clamp01(lerp(sim.pos.y, to.y, t)) };
}

/* ------------------------------ timeline -------------------------------- */
export type TimelineKind = "message" | "ai" | "assignment" | "accepted" | "enroute" | "completed" | "prediction";

export interface TimelineEvent {
  id: string;
  at: number; // epoch ms
  kind: TimelineKind;
  text: string;
  sub?: string;
  propertyId?: string | null;
  staffId?: string | null;
}

/* ------------------------------ AI thinking ----------------------------- */
export interface AiThought {
  id: string;
  at: number;
  severity: "critical" | "warn" | "info" | "calm";
  headline: string;
  reasoning: string;
  recommendation?: string;
  /** an actionable payload the copilot/manager can approve */
  action?: { label: string; taskId?: string; toStaffId?: string; kind: "reassign" | "wait" | "prepare" | "escalate" };
}

const firstName = (n: string) => n.split(" ")[0];

/**
 * The continuous reasoner. Given the world *and* the live staff snapshot, it
 * looks across workload, availability, arrivals, and who is about to free up —
 * and produces a short list of thoughts that explain the WHY. The signature
 * "wait vs reassign" decision lives here.
 */
export function think(db: Database, live: LiveStaff[], now: Date): AiThought[] {
  const out: AiThought[] = [];
  const at = now.getTime();
  const byId = new Map(live.map((l) => [l.id, l]));

  // 1 — heavily-loaded person + a teammate about to free up → recommend WAITING
  //     (fires when someone is at/over capacity OR clearly carrying the dept load)
  const active = (l: LiveStaff) => l.status === "working" || l.status === "busy" || l.status === "driving" || l.status === "walking";
  const overloaded = live
    .filter((l) => (l.workloadPct >= 90 || l.openTasks >= 3) && active(l))
    .sort((a, b) => b.openTasks - a.openTasks)
    .slice(0, 1);
  for (const person of overloaded) {
    const staff = db.staff.find((s) => s.id === person.id);
    if (!staff) continue;
    const peers = db.staff.filter((s) => s.department === staff.department && s.id !== staff.id);
    // a peer who is returning/working and will be free soon (short ETA back)
    const soon = peers
      .map((s) => byId.get(s.id))
      .filter((l): l is LiveStaff => !!l && (l.status === "returning" || (l.status === "working" && (l.etaMin ?? 99) <= 2)))
      .sort((a, b) => (a.etaMin ?? 9) - (b.etaMin ?? 9))[0];
    const freeMin = soon ? Math.max(2, (soon.etaMin ?? 0) + 3) : null;
    const available = peers.map((s) => byId.get(s.id)).find((l) => l && l.status === "available");

    if (soon && freeMin != null) {
      out.push({
        id: `wait_${person.id}`,
        at, severity: "info",
        headline: `${firstName(person.name)} is at capacity`,
        reasoning: `${firstName(person.name)} is carrying ${person.openTasks} ${deptLabel(staff.department).toLowerCase()} tasks. ${firstName(soon.name)} finishes their current job in ~${freeMin} min and is closer to the next one.`,
        recommendation: `Hold the queue ${freeMin} min for ${firstName(soon.name)} rather than pulling ${available ? firstName(available.name) : "someone"} off other work.`,
        action: { label: "Hold & watch", kind: "wait" },
      });
    } else if (available) {
      const move = db.tasks.filter((t) => t.assigneeId === person.id && statusMeta[t.status].open).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
      out.push({
        id: `reassign_${person.id}`,
        at, severity: "warn",
        headline: `${firstName(person.name)} is overloaded`,
        reasoning: `${firstName(person.name)} is at ${person.workloadPct}% with ${person.openTasks} open. ${firstName(available.name)} is available now with capacity to spare.`,
        recommendation: `Reassign the newest task to ${firstName(available.name)}.`,
        action: { label: `Reassign to ${firstName(available.name)}`, kind: "reassign", taskId: move?.id, toStaffId: available.id },
      });
    }
  }

  // 2 — a department has open work but nobody available at all → escalate
  const openDepts = new Set(db.tasks.filter((t) => statusMeta[t.status].open).map((t) => t.department));
  for (const dept of openDepts) {
    const team = db.staff.filter((s) => s.department === dept && !s.isManager);
    if (!team.length) continue;
    const anyFree = team.map((s) => byId.get(s.id)).some((l) => l && (l.status === "available" || l.status === "working" || l.status === "walking" || l.status === "driving"));
    if (!anyFree) {
      const mgr = db.staff.find((s) => s.isManager);
      out.push({
        id: `escalate_${dept}`,
        at, severity: "critical",
        headline: `${deptLabel(dept)} has no one on shift`,
        reasoning: `Every ${deptLabel(dept).toLowerCase()} member is off shift, on leave, or offline right now, yet there is open work.`,
        recommendation: mgr ? `Route ${deptLabel(dept).toLowerCase()} work to ${firstName(mgr.name)} (Operations Manager) until the next shift.` : `Assign a fallback manager for ${deptLabel(dept).toLowerCase()}.`,
        action: mgr ? { label: `Escalate to ${firstName(mgr.name)}`, kind: "escalate", toStaffId: mgr.id } : undefined,
      });
      break;
    }
  }

  // 3 — imminent arrival → prepare (calm, proactive)
  const arriving = db.properties.find((p) => p.status === "arriving");
  if (arriving) {
    out.push({
      id: `arrival_${arriving.id}`,
      at, severity: "calm",
      headline: `${arriving.name} guest arriving`,
      reasoning: `${arriving.name} flips to occupied today. Housekeeping pre-arrival inspection and the welcome set-up should complete before check-in.`,
      recommendation: `Prepare the welcome experience now — champagne, transfer, amenities.`,
      action: { label: "Prepare welcome", kind: "prepare", taskId: db.tasks.find((t) => t.propertyId === arriving.id && statusMeta[t.status].open)?.id },
    });
  }

  return out.slice(0, 4);
}

/**
 * A non-animated LiveStaff snapshot derived purely from availability + workload.
 * Used by the always-on copilot orb (every page) so it can answer questions
 * without running the full map simulation. The Live Operations page uses the
 * animated tick instead; both produce the same shape.
 */
export function deriveLiveStaff(db: Database, now = new Date()): LiveStaff[] {
  return db.staff.map((s) => {
    const av = computeAvailability(s, db, now);
    const max = typeof s.maxActiveTasks === "number" && s.maxActiveTasks > 0 ? s.maxActiveTasks : 5;
    const status: LiveStatus =
      av.state === "leave" || av.state === "off" ? "offline"
      : av.label === "On break" ? "break"
      : av.state === "busy" ? (av.open > 0 ? "working" : "busy")
      : av.open > 0 ? "working" : "available";
    const task = db.tasks.find((t) => t.assigneeId === s.id && statusMeta[t.status].open) ?? null;
    return {
      id: s.id, name: s.name, initials: s.initials, role: s.role, department: s.department,
      status, pos: { x: 0.5, y: 0.5 }, targetPropertyId: task?.propertyId ?? null, taskId: task?.id ?? null,
      taskTitle: task?.title ?? null, etaMin: null, completedToday: 0, responseMin: 4,
      workloadPct: Math.min(100, Math.round((av.open / max) * 100)), openTasks: av.open, maxTasks: max,
    };
  });
}

/** a small header pulse of the whole operation, for the live bar */
export function livePulse(db: Database, live: LiveStaff[]) {
  const open = db.tasks.filter((t) => statusMeta[t.status].open).length;
  const urgent = db.tasks.filter((t) => t.priority === "urgent" && statusMeta[t.status].open).length;
  const onShift = live.filter((l) => l.status !== "offline").length;
  const enroute = live.filter((l) => l.status === "driving" || l.status === "walking").length;
  const working = live.filter((l) => l.status === "working").length;
  return { open, urgent, onShift, enroute, working, staff: live.length };
}
