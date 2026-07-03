/**
 * Smart Availability — LUXA computes, in real time, whether each staff member is
 * available to take work, and *why*. The manager sets a schedule and an optional
 * override; everything else is derived. This is what lets the assignment engine
 * (and the whole UI) answer "who is available?" honestly.
 *
 * Rules, in order:
 *   1. override = Off shift / On leave      → unavailable
 *   2. outside working hours (or on break)  → Off shift
 *   3. active open tasks >= max active tasks → Busy
 *   4. override = Busy                       → Busy
 *   5. otherwise                             → Available
 */
import { statusMeta, type Database, type Staff } from "@/lib/domain";

export type AvailabilityState = "available" | "busy" | "off" | "leave";

export interface Availability {
  state: AvailabilityState;
  /** short label: "Available" · "Busy" · "Off shift" · "On leave" */
  label: string;
  /** the reason shown next to the label: "on shift" · "3 active tasks" · … */
  reason: string;
  open: number; // current open-task load
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DEFAULT_DAYS = [1, 2, 3, 4, 5]; // Mon–Fri

const toMin = (t?: string | null): number | null => {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return Number.isFinite(h) ? h * 60 + (m || 0) : null;
};

export function openTaskCount(db: Database, staffId: string): number {
  return db.tasks.filter((t) => t.assigneeId === staffId && statusMeta[t.status].open).length;
}

/** describe the next shift, e.g. "next shift tomorrow 09:00" */
function nextShift(staff: Staff, now: Date): string {
  const days = staff.workingDays?.length ? staff.workingDays : DEFAULT_DAYS;
  const start = staff.shiftStart ?? "09:00";
  const startMin = toMin(start) ?? 540;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const dow = now.getDay();

  for (let i = 0; i < 8; i++) {
    const day = (dow + i) % 7;
    if (!days.includes(day)) continue;
    if (i === 0) {
      if (nowMin < startMin) return `next shift ${start}`;
      continue; // today's shift already over — look ahead
    }
    if (i === 1) return `next shift tomorrow ${start}`;
    return `next shift ${DAY_SHORT[day]} ${start}`;
  }
  return "no upcoming shift";
}

export function computeAvailability(staff: Staff, db: Database, now = new Date()): Availability {
  const open = openTaskCount(db, staff.id);
  const max = typeof staff.maxActiveTasks === "number" && staff.maxActiveTasks > 0 ? staff.maxActiveTasks : Infinity;
  const override = staff.availabilityOverride ?? "auto";

  // 1 — hard manual overrides
  if (override === "leave") {
    const back = staff.leaveUntil ? DAY_NAMES[new Date(staff.leaveUntil).getDay()] : null;
    return { state: "leave", label: "On leave", reason: back ? `back ${back}` : "back soon", open };
  }
  if (override === "off") {
    return { state: "off", label: "Off shift", reason: "off today", open };
  }

  // 2 — schedule window
  const days = staff.workingDays?.length ? staff.workingDays : DEFAULT_DAYS;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const start = toMin(staff.shiftStart);
  const end = toMin(staff.shiftEnd);
  const withinDay = days.includes(now.getDay());
  const withinHours = (start == null || nowMin >= start) && (end == null || nowMin < end);
  if (!withinDay || !withinHours) {
    return { state: "off", label: "Off shift", reason: nextShift(staff, now), open };
  }
  const bs = toMin(staff.breakStart);
  const be = toMin(staff.breakEnd);
  if (bs != null && be != null && nowMin >= bs && nowMin < be) {
    return { state: "busy", label: "On break", reason: `back ${staff.breakEnd}`, open };
  }

  // 3 — workload cap
  if (open >= max) {
    return { state: "busy", label: "Busy", reason: `${open} active ${open === 1 ? "task" : "tasks"}`, open };
  }

  // 4 — soft manual override
  if (override === "busy") {
    return { state: "busy", label: "Busy", reason: "marked busy", open };
  }

  // 5 — good to go
  return { state: "available", label: "Available", reason: "on shift", open };
}

export const isAvailable = (a: Availability) => a.state === "available";
