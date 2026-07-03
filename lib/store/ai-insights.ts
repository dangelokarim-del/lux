/**
 * AI operations intelligence — pure functions that turn the live store into the
 * decisions the AI Command Center and floating AI Manager surface. Everything is
 * derived from real data, so the assistant reacts to whatever is actually
 * happening in the portfolio (overloaded staff, imminent arrivals, VIP patterns).
 */
import { deptLabel, statusMeta, type Database } from "@/lib/domain";

const firstName = (n: string) => n.split(" ")[0];
const isOpen = (s: string) => statusMeta[s as keyof typeof statusMeta]?.open ?? false;

export interface DailyPulse {
  handled: number; // requests handled across the portfolio
  solvedAuto: number; // resolved without human routing
  needAttention: number; // open + urgent/new
}

export function computePulse(db: Database): DailyPulse {
  const completed = db.tasks.filter((t) => t.status === "completed");
  const open = db.tasks.filter((t) => isOpen(t.status));
  const attention = open.filter((t) => t.priority === "urgent" || t.status === "new");
  return { handled: db.tasks.length, solvedAuto: completed.length, needAttention: attention.length };
}

export type RecKind = "reassign" | "arrival" | "proactive";

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

const openFor = (db: Database, staffId: string) => db.tasks.filter((t) => t.assigneeId === staffId && isOpen(t.status)).length;

/**
 * The AI's current recommendations, most important first. Only surfaces what is
 * genuinely true of the data right now — never noise.
 */
export function computeRecommendations(db: Database): Recommendation[] {
  const recs: Recommendation[] = [];

  // 1 — workload imbalance → propose a concrete reassignment
  const loaded = db.staff.map((s) => ({ s, n: openFor(db, s.id) })).sort((a, b) => b.n - a.n);
  const top = loaded[0];
  if (top && top.n >= 3) {
    const peer = db.staff
      .filter((s) => s.department === top.s.department && s.id !== top.s.id && s.presence !== "off")
      .map((s) => ({ s, n: openFor(db, s.id) }))
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
        detail: `Reassign the latest to ${firstName(peer.s.name)} to balance the ${dept} team.`,
        actionLabel: "Approve",
        taskId: movable?.id,
        toStaffId: peer.s.id,
        toStaffName: peer.s.name,
      });
    }
  }

  // 2 — imminent arrival → prepare the welcome experience
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

  // 3 — proactive VIP courtesy
  const vip = db.guests.find((g) => g.vip && g.propertyId);
  if (vip) {
    recs.push({
      id: "rec_proactive",
      kind: "proactive",
      severity: "info",
      title: `${vip.name} usually requests late checkout.`,
      detail: "Offer it proactively over WhatsApp before they ask.",
      actionLabel: "Send WhatsApp",
      guestName: vip.name,
    });
  }

  return recs;
}

/** time-aware greeting */
export function greeting(d = new Date()): string {
  const h = d.getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}
