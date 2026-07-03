/**
 * AI operations intelligence — pure functions that turn the live store into the
 * decisions the AI Command Center and floating AI Manager surface. Everything is
 * derived from real data, so the assistant reacts to whatever is actually
 * happening in the portfolio (overloaded staff, imminent arrivals, VIP patterns,
 * departments with nobody on shift). This is the brain behind LUXA acting like an
 * autonomous operations manager rather than a static dashboard.
 */
import { deptLabel, statusMeta, type Database } from "@/lib/domain";
import { computeAvailability, isAvailable, openTaskCount } from "@/lib/services/availability";

const firstName = (n: string) => n.split(" ")[0];
const isOpen = (s: string) => statusMeta[s as keyof typeof statusMeta]?.open ?? false;
const minutesSince = (iso: string, now: Date) => Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60000));

export interface DailyPulse {
  handled: number; // requests handled across the portfolio
  solvedAuto: number; // resolved without human routing
  needAttention: number; // open + urgent/new
  needApproval: number; // decisions waiting on a human sign-off
}

export function computePulse(db: Database): DailyPulse {
  const completed = db.tasks.filter((t) => t.status === "completed");
  const open = db.tasks.filter((t) => isOpen(t.status));
  const attention = open.filter((t) => t.priority === "urgent" || t.status === "new");
  const managerIds = new Set(db.staff.filter((s) => s.isManager).map((s) => s.id));
  // a decision needs a human when the AI couldn't place it on the team: nobody took
  // it, or it had to be escalated up to a manager
  const needApproval = open.filter((t) => t.assigneeId == null || managerIds.has(t.assigneeId)).length;
  return { handled: db.tasks.length, solvedAuto: completed.length, needAttention: attention.length, needApproval };
}

export type RecKind = "reassign" | "arrival" | "proactive" | "escalation";

export interface Recommendation {
  id: string;
  kind: RecKind;
  severity: "warn" | "info";
  title: string;
  detail: string;
  actionLabel: string;
  checklist?: string[];
  /** action payload */
  taskId?: string;
  toStaffId?: string;
  toStaffName?: string;
  guestName?: string;
}

/**
 * The AI's current recommendations, most important first. Only surfaces what is
 * genuinely true of the data right now — never noise. Availability is computed
 * live from each person's schedule + workload, so recommendations respect who is
 * actually on shift.
 */
export function computeRecommendations(db: Database, now = new Date()): Recommendation[] {
  const recs: Recommendation[] = [];

  // 1 — workload imbalance → propose a concrete reassignment to an available peer
  const loaded = db.staff.map((s) => ({ s, n: openTaskCount(db, s.id) })).sort((a, b) => b.n - a.n);
  const top = loaded[0];
  if (top && top.n >= 3) {
    const peer = db.staff
      .filter((s) => s.department === top.s.department && s.id !== top.s.id)
      .map((s) => ({ s, n: openTaskCount(db, s.id), av: computeAvailability(s, db, now) }))
      .filter((x) => isAvailable(x.av))
      .sort((a, b) => a.n - b.n)[0];
    if (peer && peer.n < top.n) {
      const movable = db.tasks
        .filter((t) => t.assigneeId === top.s.id && isOpen(t.status))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
      const dept = deptLabel(top.s.department).toLowerCase();
      recs.push({
        id: "rec_overload",
        kind: "reassign",
        severity: "warn",
        title: `${firstName(top.s.name)} has ${top.n} open ${dept} ${top.n === 1 ? "task" : "tasks"}.`,
        detail: `${firstName(peer.s.name)} is on shift with ${peer.n} — reassign the latest to balance the ${dept} team.`,
        actionLabel: "Reassign",
        taskId: movable?.id,
        toStaffId: peer.s.id,
        toStaffName: peer.s.name,
      });
    }
  }

  // 2 — a department has open work but nobody available → recommend manager escalation
  const deptsWithOpen = new Set(db.tasks.filter((t) => isOpen(t.status)).map((t) => t.department));
  for (const dept of deptsWithOpen) {
    const team = db.staff.filter((s) => s.department === dept && !s.isManager);
    if (!team.length) continue;
    const anyAvailable = team.some((s) => isAvailable(computeAvailability(s, db, now)));
    if (!anyAvailable) {
      const mgr = db.staff.find((s) => s.isManager);
      // the concrete task to escalate: the oldest open one in this department not
      // already on the manager's desk
      const movable = db.tasks
        .filter((t) => t.department === dept && isOpen(t.status) && t.assigneeId !== mgr?.id)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0];
      recs.push({
        id: `rec_escalate_${dept}`,
        kind: "escalation",
        severity: "warn",
        title: `No ${deptLabel(dept)} staff available right now.`,
        detail: mgr
          ? `Route ${deptLabel(dept).toLowerCase()} work to ${firstName(mgr.name)}, Operations Manager, until the next shift.`
          : `Assign a fallback manager for ${deptLabel(dept).toLowerCase()} so urgent work still lands somewhere.`,
        actionLabel: mgr && movable ? "Escalate" : "Review",
        taskId: movable?.id,
        toStaffId: mgr?.id,
        toStaffName: mgr?.name,
      });
      break; // one escalation nudge at a time keeps the surface calm
    }
  }

  // 3 — imminent arrival → prepare the welcome experience
  const arriving = db.properties.find((p) => p.status === "arriving");
  if (arriving) {
    recs.push({
      id: "rec_arrival",
      kind: "arrival",
      severity: "info",
      title: `${arriving.name} guest arrives soon.`,
      detail: "Ready the welcome experience before check-in.",
      actionLabel: "Prepare now",
      checklist: ["Champagne on ice", "Airport transfer", "Welcome package"],
    });
  }

  // 4 — proactive guest memory: a returning VIP with a known recurring request
  const vip = db.guests.find((g) => g.propertyId && (g.recurringRequests?.length ?? 0) > 0);
  if (vip) {
    const usual = vip.recurringRequests![0].toLowerCase();
    recs.push({
      id: "rec_proactive",
      kind: "proactive",
      severity: "info",
      title: `${vip.name} usually requests ${usual}.`,
      detail: "Offer it proactively over WhatsApp before they ask.",
      actionLabel: "Send WhatsApp",
      guestName: vip.name,
    });
  }

  return recs;
}

/* ------------------------------ Predictive alerts (P6) ------------------------ */
export type AlertKind = "arrival" | "urgent" | "dept_overload" | "staff_overload" | "stale";

export interface OpsAlert {
  id: string;
  kind: AlertKind;
  severity: "critical" | "warn" | "info";
  title: string;
  detail: string;
}

const STALE_MINUTES = 20;

/**
 * Predictive operations alerts — LUXA looking ahead instead of showing static
 * cards. Surfaces arrivals, urgent villas, overloaded departments and staff, and
 * work that has been sitting unassigned too long.
 */
export function computeAlerts(db: Database, now = new Date()): OpsAlert[] {
  const alerts: OpsAlert[] = [];
  const openTasks = db.tasks.filter((t) => isOpen(t.status));

  // arrivals today
  const arriving = db.properties.filter((p) => p.status === "arriving");
  if (arriving.length) {
    alerts.push({
      id: "alert_arrivals",
      kind: "arrival",
      severity: "info",
      title: `${arriving.length} ${arriving.length === 1 ? "villa arrives" : "villas arrive"} today`,
      detail: arriving.map((p) => p.name).join(", ") + " — confirm the welcome is prepared.",
    });
  }

  // villas with open urgent work
  const urgentByProp = new Map<string, number>();
  for (const t of openTasks) if (t.priority === "urgent" && t.propertyId) urgentByProp.set(t.propertyId, (urgentByProp.get(t.propertyId) ?? 0) + 1);
  for (const [propId, n] of urgentByProp) {
    const prop = db.properties.find((p) => p.id === propId);
    if (!prop) continue;
    alerts.push({
      id: `alert_urgent_${propId}`,
      kind: "urgent",
      severity: "critical",
      title: `${prop.name} has ${n} urgent ${n === 1 ? "issue" : "issues"} open`,
      detail: "Guest-impacting — needs eyes now.",
    });
  }

  // overloaded departments — open work but nobody available
  const deptsWithOpen = new Set(openTasks.map((t) => t.department));
  for (const dept of deptsWithOpen) {
    const team = db.staff.filter((s) => s.department === dept && !s.isManager);
    if (!team.length) continue;
    const available = team.filter((s) => isAvailable(computeAvailability(s, db, now)));
    if (!available.length) {
      alerts.push({
        id: `alert_dept_${dept}`,
        kind: "dept_overload",
        severity: "warn",
        title: `${deptLabel(dept)} has nobody available`,
        detail: `Every ${deptLabel(dept).toLowerCase()} member is off shift, on leave, or at capacity.`,
      });
    }
  }

  // individual staff over capacity
  for (const s of db.staff) {
    const av = computeAvailability(s, db, now);
    const max = typeof s.maxActiveTasks === "number" && s.maxActiveTasks > 0 ? s.maxActiveTasks : Infinity;
    if (av.open >= max && max !== Infinity) {
      alerts.push({
        id: `alert_staff_${s.id}`,
        kind: "staff_overload",
        severity: "warn",
        title: `${firstName(s.name)} is at capacity (${av.open}/${max})`,
        detail: `Consider rebalancing ${deptLabel(s.department).toLowerCase()} work off ${firstName(s.name)}.`,
      });
    }
  }

  // unassigned work sitting too long
  const stale = openTasks
    .filter((t) => t.assigneeId == null && minutesSince(t.createdAt, now) >= STALE_MINUTES)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (stale.length) {
    const oldest = stale[0];
    alerts.push({
      id: "alert_stale",
      kind: "stale",
      severity: "warn",
      title: `${stale.length} unassigned ${stale.length === 1 ? "request" : "requests"} waiting`,
      detail: `"${oldest.title}" has been unassigned for ${minutesSince(oldest.createdAt, now)} min.`,
    });
  }

  const rank = { critical: 0, warn: 1, info: 2 } as const;
  return alerts.sort((a, b) => rank[a.severity] - rank[b.severity]);
}

/** time-aware greeting */
export function greeting(d = new Date()): string {
  const h = d.getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}
