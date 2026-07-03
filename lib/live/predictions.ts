/**
 * AI Predictions — LUXA looking *ahead* of the operation. These are derived from
 * real patterns in the store (maintenance frequency, guest history, department
 * load, stay timing) and phrased as confident, pre-emptive calls a great GM would
 * make. Deterministic and explainable, so they never feel like noise.
 */
import { deptLabel, statusMeta, type Database } from "@/lib/domain";
import { computeAvailability } from "@/lib/services/availability";

export interface Prediction {
  id: string;
  kind: "maintenance" | "guest" | "staffing" | "anomaly";
  confidence: number; // 0–1
  horizon: string; // "this week", "tomorrow", "next 2h"
  title: string;
  detail: string;
}

const firstName = (n: string) => n.split(" ")[0];

export function computePredictions(db: Database, now = new Date()): Prediction[] {
  const out: Prediction[] = [];

  // 1 — maintenance recurrence: a villa with several maintenance tasks is likely
  //     to need attention again soon (pool/AC/filters trend)
  const maintByProp = new Map<string, number>();
  for (const t of db.tasks) if (t.department === "maintenance" && t.propertyId) maintByProp.set(t.propertyId, (maintByProp.get(t.propertyId) ?? 0) + 1);
  const hotProp = [...maintByProp.entries()].sort((a, b) => b[1] - a[1])[0];
  if (hotProp && hotProp[1] >= 2) {
    const prop = db.properties.find((p) => p.id === hotProp[0]);
    if (prop) {
      const pool = db.tasks.some((t) => t.propertyId === prop.id && /pool|filter|pump/i.test(t.title));
      out.push({
        id: `pred_maint_${prop.id}`,
        kind: pool ? "maintenance" : "anomaly",
        confidence: Math.min(0.92, 0.55 + hotProp[1] * 0.08),
        horizon: "this week",
        title: pool ? `${prop.name} pool filter likely needs service` : `${prop.name} has abnormal maintenance frequency`,
        detail: `${hotProp[1]} maintenance jobs logged here recently — above portfolio average. Schedule a preventative check before the next guest-facing failure.`,
      });
    }
  }

  // 2 — returning guest with a recurring request → predict it before they ask
  const guest = db.guests.find((g) => g.propertyId && (g.recurringRequests?.length ?? 0) > 0 && (g.previousPropertyIds?.length ?? 0) > 0);
  if (guest) {
    out.push({
      id: `pred_guest_${guest.id}`,
      kind: "guest",
      confidence: 0.86,
      horizon: "this stay",
      title: `${guest.name} will likely request ${guest.recurringRequests![0].toLowerCase()}`,
      detail: `Returning guest — requested it on previous stays. Offer proactively over WhatsApp to delight before they ask.`,
    });
  }

  // 3 — department overload tomorrow: many open + few available in a department
  const deptLoad = new Map<string, { open: number; avail: number; total: number }>();
  for (const t of db.tasks.filter((x) => statusMeta[x.status].open)) {
    const d = deptLoad.get(t.department) ?? { open: 0, avail: 0, total: 0 };
    d.open++; deptLoad.set(t.department, d);
  }
  for (const s of db.staff) {
    const d = deptLoad.get(s.department); if (!d) continue;
    d.total++;
    if (computeAvailability(s, db, now).state === "available") d.avail++;
  }
  const strained = [...deptLoad.entries()].filter(([, d]) => d.open >= Math.max(2, d.total) && d.avail <= 1).sort((a, b) => b[1].open - a[1].open)[0];
  if (strained) {
    out.push({
      id: `pred_staff_${strained[0]}`,
      kind: "staffing",
      confidence: 0.79,
      horizon: "tomorrow",
      title: `${deptLabel(strained[0])} will likely be overloaded tomorrow`,
      detail: `${strained[1].open} open jobs against ${strained[1].avail} available ${deptLabel(strained[0]).toLowerCase()} staff. Line up cover or shift a start time earlier.`,
    });
  }

  // 4 — checkout wave: multiple stays ending soon → housekeeping turnaround spike
  const soonCheckouts = db.guests.filter((g) => {
    if (!g.checkOut) return false;
    const h = (new Date(g.checkOut).getTime() - now.getTime()) / 3600000;
    return h > 0 && h < 48;
  });
  if (soonCheckouts.length >= 2) {
    out.push({
      id: "pred_turnaround",
      kind: "staffing",
      confidence: 0.74,
      horizon: "next 48h",
      title: `${soonCheckouts.length} checkouts incoming — turnaround spike`,
      detail: `Housekeeping will face back-to-back turnovers. Pre-stage linens and stagger the schedule to protect same-day arrivals.`,
    });
  }

  // 5 — a manager holding overflow → note the escalation load
  const mgr = db.staff.find((s) => s.isManager);
  if (mgr) {
    const mgrOpen = db.tasks.filter((t) => t.assigneeId === mgr.id && statusMeta[t.status].open).length;
    if (mgrOpen >= 2) {
      out.push({
        id: "pred_mgr",
        kind: "anomaly",
        confidence: 0.7,
        horizon: "today",
        title: `${firstName(mgr.name)} is absorbing escalations`,
        detail: `The Operations Manager is holding ${mgrOpen} escalated jobs — a sign a department is understaffed. Investigate the routing before it compounds.`,
      });
    }
  }

  return out.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}
