/**
 * Manager Copilot — answers a manager's natural-language questions from live
 * system data. No LLM needed for the core operational questions: the answers are
 * *facts* about the operation right now, so we compute them deterministically and
 * phrase them like a sharp chief-of-staff. (A real LLM can layer on top later;
 * this guarantees correct, instant answers grounded in the store.)
 */
import { deptLabel, statusMeta, type Database } from "@/lib/domain";
import { computeAvailability } from "@/lib/services/availability";
import type { LiveStaff } from "./engine";
import { villaState, VILLA_STATE_META } from "./engine";

export interface CopilotAnswer {
  title: string;
  lines: string[];
  empty?: boolean;
}

const first = (n: string) => n.split(" ")[0];
const openFor = (db: Database, id: string) => db.tasks.filter((t) => t.assigneeId === id && statusMeta[t.status].open).length;

const SUGGESTIONS = [
  "Who needs help?",
  "Which villa needs attention?",
  "Show overloaded staff",
  "What arrives tomorrow?",
  "Who should replace Diego?",
];
export const COPILOT_SUGGESTIONS = SUGGESTIONS;

export function askCopilot(raw: string, db: Database, live: LiveStaff[], now = new Date()): CopilotAnswer {
  const q = raw.toLowerCase().trim();
  const byId = new Map(live.map((l) => [l.id, l]));

  const findStaffInQuery = () =>
    db.staff.find((s) => q.includes(first(s.name).toLowerCase()) || q.includes(s.name.toLowerCase()));

  /* who needs help / overloaded */
  if (/(needs? help|overload|stretched|struggling|swamped|capacity)/.test(q)) {
    const ranked = live
      .map((l) => ({ l, load: l.workloadPct }))
      .filter((x) => x.load >= 60)
      .sort((a, b) => b.load - a.load);
    if (!ranked.length) return { title: "Nobody is overloaded", lines: ["Every team member is under capacity. The operation is balanced right now."], empty: true };
    return {
      title: `${ranked.length} ${ranked.length === 1 ? "person needs" : "people need"} attention`,
      lines: ranked.map(({ l }) => `${l.name} — ${deptLabel(l.department)} · ${l.openTasks}/${l.maxTasks} tasks (${l.workloadPct}%) · ${l.status}`),
    };
  }

  /* which villa needs attention */
  if (/(villa|propert|which house|where).*(attention|help|problem|worst|urgent|hot)/.test(q) || /(what|which).*(needs|need) attention/.test(q)) {
    const ranked = db.properties
      .map((p) => ({ p, state: villaState(db, p.id), open: db.tasks.filter((t) => t.propertyId === p.id && statusMeta[t.status].open).length }))
      .filter((x) => x.state === "urgent" || x.state === "active" || x.state === "arriving")
      .sort((a, b) => rank(a.state) - rank(b.state) || b.open - a.open);
    if (!ranked.length) return { title: "All villas are calm", lines: ["No urgent issues or open requests across the portfolio right now."], empty: true };
    const top = ranked[0];
    return {
      title: `${top.p.name} needs attention`,
      lines: [
        `${VILLA_STATE_META[top.state].label} · ${top.open} open ${top.open === 1 ? "request" : "requests"} · ${top.p.area}`,
        ...ranked.slice(1, 4).map((x) => `${x.p.name} — ${VILLA_STATE_META[x.state].label.toLowerCase()}, ${x.open} open`),
      ],
    };
  }

  /* why did X get this task */
  if (/why.*(get|got|assigned|has|picked|chosen)/.test(q)) {
    const s = findStaffInQuery();
    if (!s) return { title: "Which team member?", lines: ["Try: \"Why did Carlos get this task?\""], empty: true };
    const note = db.notes
      .filter((n) => n.system && /assign|escalat|rebalanc/i.test(n.body))
      .map((n) => ({ n, task: db.tasks.find((t) => t.id === n.taskId) }))
      .filter((x) => x.task?.assigneeId === s.id)
      .sort((a, b) => b.n.createdAt.localeCompare(a.n.createdAt))[0];
    const av = computeAvailability(s, db, now);
    if (note) return { title: `Why ${first(s.name)} was chosen`, lines: [note.n.body, `Right now: ${av.label} · ${av.reason} · ${openFor(db, s.id)} open.`] };
    return { title: `${first(s.name)}'s assignments`, lines: [`${first(s.name)} is in ${deptLabel(s.department)}, ${av.label.toLowerCase()} (${av.reason}), carrying ${openFor(db, s.id)} open tasks. The engine routes ${deptLabel(s.department).toLowerCase()} work to the available person with the lowest workload.`] };
  }

  /* who should replace / cover X */
  if (/(replace|cover|backup|instead of|stand in|fill in)/.test(q)) {
    const s = findStaffInQuery();
    if (!s) return { title: "Cover for whom?", lines: ["Try: \"Who should replace Diego?\""], empty: true };
    const candidates = db.staff
      .filter((c) => c.department === s.department && c.id !== s.id)
      .map((c) => ({ c, av: computeAvailability(c, db, now), load: openFor(db, c.id) }))
      .sort((a, b) => Number(b.av.state === "available") - Number(a.av.state === "available") || a.load - b.load);
    if (!candidates.length) {
      const mgr = db.staff.find((m) => m.isManager);
      return { title: `No direct cover for ${first(s.name)}`, lines: [mgr ? `Nobody else is in ${deptLabel(s.department)}. Escalate to ${first(mgr.name)}, Operations Manager.` : `Nobody else is in ${deptLabel(s.department)}. Add cover or a fallback manager.`] };
    }
    const best = candidates[0];
    return {
      title: `${first(best.c.name)} should cover ${first(s.name)}`,
      lines: [
        `${best.c.name} — ${best.c.role} · ${best.av.label}, ${best.av.reason} · ${best.load} open.`,
        ...candidates.slice(1, 3).map((x) => `Also: ${x.c.name} (${x.av.label.toLowerCase()}, ${x.load} open)`),
      ],
    };
  }

  /* what arrives (today / tomorrow) */
  if (/(arriv|arrival|checking in|check-in|incoming|coming)/.test(q)) {
    const arriving = db.properties.filter((p) => p.status === "arriving");
    const when = /tomorrow/.test(q) ? "tomorrow" : "today";
    if (!arriving.length) return { title: `No arrivals ${when}`, lines: ["No villas are flagged arriving right now."], empty: true };
    return {
      title: `${arriving.length} ${arriving.length === 1 ? "arrival" : "arrivals"} ${when}`,
      lines: arriving.map((p) => `${p.name} — ${p.area} · ${p.bedrooms} bd · prep the welcome experience`),
    };
  }

  /* status / summary */
  if (/(status|summary|overview|how.*we doing|everything|briefing)/.test(q)) {
    const open = db.tasks.filter((t) => statusMeta[t.status].open).length;
    const urgent = db.tasks.filter((t) => t.priority === "urgent" && statusMeta[t.status].open).length;
    const onShift = live.filter((l) => l.status !== "offline").length;
    const working = live.filter((l) => l.status === "working").length;
    return {
      title: "Operations briefing",
      lines: [
        `${open} open ${open === 1 ? "request" : "requests"}${urgent ? ` · ${urgent} urgent` : ""}.`,
        `${onShift}/${live.length} staff on shift, ${working} actively working.`,
        `${db.properties.filter((p) => p.status === "occupied").length} villas occupied, ${db.properties.filter((p) => p.status === "arriving").length} arriving.`,
      ],
    };
  }

  /* who is available / free */
  if (/(who.*(available|free|open)|available staff|free staff)/.test(q)) {
    const avail = live.filter((l) => l.status === "available");
    if (!avail.length) return { title: "Nobody is fully free", lines: ["Everyone is on a task, en route, or off shift. Check the overloaded list before assigning."], empty: true };
    return { title: `${avail.length} available now`, lines: avail.map((l) => `${l.name} — ${deptLabel(l.department)} · ${l.openTasks} open`) };
  }

  void byId;
  return {
    title: "Ask me about the operation",
    lines: ["I can answer: " + SUGGESTIONS.map((s) => `“${s}”`).join(", ") + "."],
    empty: true,
  };
}

const rank = (s: string) => (s === "urgent" ? 0 : s === "arriving" ? 1 : s === "active" ? 2 : 3);
