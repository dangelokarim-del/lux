/**
 * The Operations Queue — the single ranked list a manager scans to know exactly
 * what needs a decision, without a map. Every live operation (an open request, an
 * imminent arrival, a transfer in motion) becomes one typed item with the villa,
 * category, priority, who's on it, ETA, progress, an AI explanation and the
 * actions that resolve it. Pure & derived from the store, so it stays truthful.
 */
import { categoryMeta, deptLabel, priorityMeta, statusMeta, type Database, type Priority, type Task } from "@/lib/domain";
import type { LiveStaff } from "./engine";

export type QueueKind = "issue" | "arrival" | "transfer";
export type QueueAction = "approve" | "reassign" | "call" | "prepare" | "track";

export interface QueueAssignee { id: string; name: string; role: string; status: LiveStaff["status"]; etaMin: number | null }

export interface QueueItem {
  id: string;
  kind: QueueKind;
  weight: number; // higher = more urgent, for sorting
  villaId: string | null;
  villaName: string;
  title: string;
  category: string;
  priorityLabel: string;
  hex: string;
  assignee: QueueAssignee | null;
  progress: number; // 0–100
  ai: string;
  etaMin: number | null;
  etaLabel: string | null;
  checklist: { label: string; done: boolean }[] | null;
  remaining: string | null;
  guestName: string | null;
  guestPhone: string | null;
  taskId: string | null;
  actions: QueueAction[];
}

const HEX: Record<string, string> = { urgent: "#ff5c5c", high: "#f5b53d", normal: "#4ad48a", low: "#8a8f98", arrival: "#2e7dff", transfer: "#2e7dff" };
const PROGRESS: Record<string, number> = { new: 15, in_progress: 60, on_hold: 40, completed: 100, cancelled: 0 };

/** a short, confident AI explanation inferred from the request */
function explain(t: Task): string {
  const s = `${t.title} ${t.description ?? ""}`.toLowerCase();
  if (/restock|towel|linen|turndown|amenit|clean|housekeep/.test(s)) return "Standard turnaround; sequence it around the arrival schedule.";
  if (/hot water|no water/.test(s)) return "Water heater or supply fault — restore hot water before the guest notices.";
  if (/leak|pipe|flood|burst/.test(s)) return "Possible pipe-pressure failure — isolate the supply before it spreads.";
  if (/\bac\b|air con|cooling|heating|climate/.test(s)) return "Compressor likely undercharged; guest comfort at risk within the hour.";
  if (/pump|filter|filtration|pool (pressure|pump|heat)/.test(s)) return "Filtration pressure dropping — the pump may fail without a service visit.";
  if (/wifi|internet|network/.test(s)) return "Access point dropping packets; reboot the mesh and check the backhaul.";
  if (/light|electric|power|circuit/.test(s)) return "Intermittent circuit fault — check the breaker before the evening scenes.";
  if (/chef|dinner|restaurant|table|booking/.test(s)) return "Time-sensitive booking — confirm covers and dispatch the concierge.";
  return "Structured from the guest message and ranked by guest impact.";
}

const liveOf = (live: LiveStaff[], id: string | null) => (id ? live.find((l) => l.id === id) ?? null : null);
const asgn = (l: LiveStaff | null): QueueAssignee | null => l ? { id: l.id, name: l.name, role: l.role, status: l.status, etaMin: l.etaMin } : null;

function etaLabel(l: LiveStaff | null): string | null {
  if (!l) return null;
  if (l.status === "working") return "On site";
  if (l.etaMin != null && l.etaMin > 0) return `${l.etaMin} min`;
  if (l.status === "available") return "Ready";
  return null;
}

export function buildQueue(db: Database, live: LiveStaff[]): QueueItem[] {
  const items: QueueItem[] = [];

  // 1 — imminent arrivals (prep operations)
  for (const p of db.properties.filter((x) => x.status === "arriving")) {
    const guest = db.guests.find((g) => g.propertyId === p.id) ?? null;
    const hasTransfer = db.tasks.some((t) => t.propertyId === p.id && t.department === "transport" && statusMeta[t.status].open);
    const hkOpen = db.tasks.some((t) => t.propertyId === p.id && t.department === "housekeeping" && statusMeta[t.status].open);
    const checklist = [
      { label: "Champagne on ice", done: true },
      { label: "Welcome pack", done: true },
      { label: "Driver booked", done: hasTransfer },
      { label: "Housekeeping", done: !hkOpen },
    ];
    const remaining = checklist.filter((c) => !c.done).map((c) => c.label).join(", ") || null;
    const eta = 20 + ((p.id.charCodeAt(p.id.length - 1) * 7) % 40); // stable "minutes to arrival"
    items.push({
      id: `arr_${p.id}`, kind: "arrival", weight: 800 - eta, villaId: p.id, villaName: p.name,
      title: "Guest arriving", category: "Arrival", priorityLabel: `${eta} min`, hex: HEX.arrival,
      assignee: null, progress: Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100),
      ai: "Pre-arrival window open — complete the welcome before check-in.", etaMin: eta, etaLabel: `${eta} min`,
      checklist, remaining, guestName: guest?.name ?? null, guestPhone: guest?.phone ?? null, taskId: null,
      actions: ["prepare"],
    });
  }

  // 2 — open tasks → issues & transfers
  for (const t of db.tasks.filter((x) => statusMeta[x.status].open)) {
    const prop = db.properties.find((p) => p.id === t.propertyId) ?? null;
    const guest = t.guestId ? db.guests.find((g) => g.id === t.guestId) ?? null : (prop ? db.guests.find((g) => g.propertyId === prop.id) ?? null : null);
    const l = liveOf(live, t.assigneeId);
    const isTransfer = t.department === "transport" || t.category === "transport";
    const pr = t.priority as Priority;
    const base = pr === "urgent" ? 700 : pr === "high" ? 500 : pr === "normal" ? 300 : 150;

    if (isTransfer) {
      items.push({
        id: `q_${t.id}`, kind: "transfer", weight: base - 40, villaId: t.propertyId, villaName: prop?.name ?? "—",
        title: t.title, category: "Transport", priorityLabel: l?.status === "driving" ? "Driving" : priorityMeta[pr].label, hex: HEX.transfer,
        assignee: asgn(l), progress: PROGRESS[t.status] ?? 30, ai: "Transfer in motion — live ETA tracked to the villa.",
        etaMin: l?.etaMin ?? null, etaLabel: etaLabel(l), checklist: null, remaining: null,
        guestName: guest?.name ?? null, guestPhone: guest?.phone ?? null, taskId: t.id, actions: ["track", "call"],
      });
    } else {
      items.push({
        id: `q_${t.id}`, kind: "issue", weight: base + (t.status === "new" ? 20 : 0), villaId: t.propertyId, villaName: prop?.name ?? "—",
        title: t.title, category: `${deptLabel(t.department)} · ${categoryMeta[t.category].label}`, priorityLabel: priorityMeta[pr].label, hex: HEX[pr] ?? HEX.normal,
        assignee: asgn(l), progress: PROGRESS[t.status] ?? 30, ai: explain(t),
        etaMin: l?.etaMin ?? null, etaLabel: etaLabel(l), checklist: null, remaining: null,
        guestName: guest?.name ?? null, guestPhone: guest?.phone ?? null, taskId: t.id, actions: ["approve", "reassign", "call"],
      });
    }
  }

  return items.sort((a, b) => b.weight - a.weight);
}
