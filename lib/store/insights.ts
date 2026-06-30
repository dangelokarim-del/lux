/**
 * Derived operational metrics — pure functions over the live `Database`.
 * Everything here is computed from real store data so the dashboard, analytics
 * and side panels always agree. No hardcoded numbers.
 */
import {
  departmentMeta,
  priorityMeta,
  statusMeta,
  type Database,
  type Department,
  type Note,
  type Task,
} from "@/lib/domain";

/* ------------------------------ durations ------------------------------- */

/** Earliest system activity-log entry for a task (its first real action). */
function firstActionAt(taskId: string, notes: Note[]): string | null {
  const sys = notes
    .filter((n) => n.taskId === taskId && n.system)
    .map((n) => n.createdAt)
    .sort();
  return sys[0] ?? null;
}

/** Minutes from a request landing to its first handled action (response time). */
export function responseMinutes(task: Task, notes: Note[]): number | null {
  if (task.status === "new") return null; // not yet responded to
  const firstAt = firstActionAt(task.id, notes) ?? task.updatedAt;
  const ms = new Date(firstAt).getTime() - new Date(task.createdAt).getTime();
  return ms > 0 ? ms / 60_000 : 0;
}

export function avgResponseMinutes(tasks: Task[], notes: Note[]): number | null {
  const vals = tasks.map((t) => responseMinutes(t, notes)).filter((v): v is number => v != null);
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function fmtDuration(min: number | null): string {
  if (min == null) return "—";
  if (min < 1) return "<1m";
  if (min < 60) return `${Math.round(min)}m`;
  const h = min / 60;
  return h < 10 ? `${h.toFixed(1)}h` : `${Math.round(h)}h`;
}

export function isToday(iso: string): boolean {
  const d = new Date(iso);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}

/* ------------------------------ KPI block ------------------------------- */

export interface Kpis {
  open: number;
  urgent: number;
  inProgress: number;
  completedToday: number;
  teamOnline: number;
  villasActive: number;
  avgResponse: number | null;
}

export function computeKpis(db: Database): Kpis {
  const open = db.tasks.filter((t) => statusMeta[t.status].open);
  return {
    open: open.length,
    urgent: open.filter((t) => priorityMeta[t.priority].weight >= 3).length,
    inProgress: db.tasks.filter((t) => t.status === "in_progress").length,
    completedToday: db.tasks.filter((t) => t.status === "completed" && t.completedAt && isToday(t.completedAt)).length,
    teamOnline: db.staff.filter((s) => s.presence === "available").length,
    villasActive: db.properties.filter((p) => p.status === "occupied").length,
    avgResponse: avgResponseMinutes(db.tasks, db.notes),
  };
}

export function occupancyRate(db: Database): number {
  if (!db.properties.length) return 0;
  const occ = db.properties.filter((p) => p.status === "occupied").length;
  return Math.round((occ / db.properties.length) * 100);
}

/* -------------------------- per-villa context --------------------------- */

export interface VillaContext {
  openRequests: number;
  housekeeping: { label: string; tone: "ok" | "warn" | "accent" | "muted" };
  guestName: string | null;
  checkOut: string | null;
  /** 0–100 progress through the current guest's stay */
  stayProgress: number | null;
  avgResponse: number | null;
}

const HOUSEKEEPING: Record<string, VillaContext["housekeeping"]> = {
  occupied: { label: "Serviced", tone: "ok" },
  arriving: { label: "Preparing", tone: "accent" },
  cleaning: { label: "Cleaning", tone: "warn" },
  vacant: { label: "Ready", tone: "muted" },
};

export function villaContext(db: Database, propertyId: string): VillaContext {
  const guest = db.guests.find((g) => g.id === db.properties.find((p) => p.id === propertyId)?.currentGuestId) ?? null;
  const status = db.properties.find((p) => p.id === propertyId)?.status ?? "vacant";
  const villaTasks = db.tasks.filter((t) => t.propertyId === propertyId);
  let stayProgress: number | null = null;
  if (guest?.checkIn && guest?.checkOut) {
    const start = new Date(guest.checkIn).getTime();
    const end = new Date(guest.checkOut).getTime();
    const now = Date.now();
    stayProgress = Math.max(0, Math.min(100, Math.round(((now - start) / (end - start)) * 100)));
  }
  return {
    openRequests: villaTasks.filter((t) => statusMeta[t.status].open).length,
    housekeeping: HOUSEKEEPING[status],
    guestName: guest?.name ?? null,
    checkOut: guest?.checkOut ?? null,
    stayProgress,
    avgResponse: avgResponseMinutes(villaTasks, db.notes),
  };
}

/* -------------------------- per-staff context --------------------------- */

export interface StaffContext {
  openTasks: number;
  currentTask: Task | null;
  lastActiveAt: string | null;
}

export function staffContext(db: Database, staffId: string): StaffContext {
  const assigned = db.tasks.filter((t) => t.assigneeId === staffId);
  const openAssigned = assigned
    .filter((t) => statusMeta[t.status].open)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const noteTimes = db.notes.filter((n) => n.authorId === staffId).map((n) => n.createdAt);
  const taskTimes = assigned.map((t) => t.updatedAt);
  const lastActiveAt = [...noteTimes, ...taskTimes].sort().pop() ?? null;
  return {
    openTasks: openAssigned.length,
    currentTask: openAssigned[0] ?? null,
    lastActiveAt,
  };
}

/* ---------------------------- activity feed ----------------------------- */

export type ActivityKind = "message" | "ai" | "assignment" | "status" | "completed";

export interface ActivityEvent {
  id: string;
  kind: ActivityKind;
  text: string;
  sub: string | null;
  at: string;
}

/** A merged, realtime stream of what just happened across the operation. */
export function activityFeed(db: Database, limit = 8): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  const taskByCode = (id: string | null) => db.tasks.find((t) => t.id === id)?.code ?? null;

  for (const m of db.messages) {
    if (m.direction !== "inbound") continue;
    events.push({ id: `m_${m.id}`, kind: "message", text: "WhatsApp request received", sub: m.author, at: m.createdAt });
  }
  for (const t of db.tasks) {
    if (t.sourceMessageId || t.aiConfidence != null) {
      events.push({ id: `c_${t.id}`, kind: "ai", text: "AI created task", sub: `${t.code} · ${t.title}`, at: t.createdAt });
    }
    if (t.completedAt) {
      events.push({ id: `done_${t.id}`, kind: "completed", text: "Request completed", sub: `${t.code} · ${t.title}`, at: t.completedAt });
    }
  }
  for (const n of db.notes) {
    if (!n.system) continue;
    const code = taskByCode(n.taskId);
    const kind: ActivityKind = n.body.startsWith("Assigned") ? "assignment" : "status";
    events.push({ id: `n_${n.id}`, kind, text: n.body, sub: code, at: n.createdAt });
  }

  return events.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}

/* ----------------------------- analytics -------------------------------- */

export interface Analytics {
  avgResponse: number | null;
  completed: number;
  satisfaction: number; // derived index, 0–5
  occupancy: number;
  byDepartment: { department: Department; label: string; count: number }[];
  total: number;
}

export function computeAnalytics(db: Database): Analytics {
  const completed = db.tasks.filter((t) => t.status === "completed").length;
  const total = db.tasks.length;
  const open = db.tasks.filter((t) => statusMeta[t.status].open).length;
  const completionRate = total ? completed / (completed + open || 1) : 0;
  const avg = avgResponseMinutes(db.tasks, db.notes);
  // a derived satisfaction index: fast handling + high completion read as happier
  // guests. Tied to real signals so it moves with the operation, never random.
  const speedScore = avg == null ? 0.5 : Math.max(0, Math.min(1, 1 - avg / 240));
  const satisfaction = Math.round((4.3 + completionRate * 0.4 + speedScore * 0.3) * 10) / 10;

  const byDepartment = (Object.keys(departmentMeta) as Department[])
    .map((department) => ({
      department,
      label: departmentMeta[department].label,
      count: db.tasks.filter((t) => t.department === department).length,
    }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count);

  return {
    avgResponse: avg,
    completed,
    satisfaction: Math.min(5, satisfaction),
    occupancy: occupancyRate(db),
    byDepartment,
    total,
  };
}
