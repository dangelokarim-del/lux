/**
 * The assignment engine.
 *
 * Two pure functions the store calls when a task is born:
 *   • `applyRules`   — client-defined keyword rules can override the AI's category
 *                      / department / priority (the configurable routing layer).
 *   • `chooseAssignee` — picks the right person: in the target department, on
 *                      shift, under their max workload, least-loaded first, with
 *                      graceful fallbacks (any in dept → department lead).
 *
 * No dependencies beyond the domain, so it works identically in demo and live.
 */
import { statusMeta, type AssignmentRule, type Database, type Priority, type Staff, type TaskCategory } from "@/lib/domain";

export interface Routing {
  category: TaskCategory;
  department: string;
  priority: Priority;
  /** the rule that matched, if any (for the activity log) */
  matchedRule: AssignmentRule | null;
}

/** apply the first enabled rule whose keywords appear in the message */
export function applyRules(
  body: string,
  base: { category: TaskCategory; department: string; priority: Priority },
  rules: AssignmentRule[]
): Routing {
  const text = body.toLowerCase();
  for (const rule of rules) {
    if (!rule.enabled) continue;
    if (rule.keywords.some((k) => k && text.includes(k.toLowerCase()))) {
      return {
        category: rule.category,
        department: rule.department,
        priority: rule.priority ?? base.priority,
        matchedRule: rule,
      };
    }
  }
  return { ...base, matchedRule: null };
}

/** current open-task load for a staff member */
function loadFor(db: Database, staffId: string): number {
  return db.tasks.filter((t) => t.assigneeId === staffId && statusMeta[t.status].open).length;
}

const capFor = (s: Staff): number => (typeof s.maxActiveTasks === "number" && s.maxActiveTasks > 0 ? s.maxActiveTasks : Infinity);

/**
 * Choose the best assignee for a task in `department`, optionally scoped to a
 * property. Returns null when auto-assign is off or nobody exists in that dept.
 */
export function chooseAssignee(
  db: Database,
  department: string,
  opts: { autoAssign: boolean; propertyId?: string | null } = { autoAssign: true }
): string | null {
  if (!opts.autoAssign) return null;

  const inDept = db.staff.filter((s) => s.department === department);
  if (inDept.length === 0) return null;

  // prefer staff dedicated to this property, if any are
  const scoped = opts.propertyId
    ? inDept.filter((s) => (s.assignedPropertyIds?.length ?? 0) === 0 || s.assignedPropertyIds!.includes(opts.propertyId!))
    : inDept;
  const pool = scoped.length ? scoped : inDept;

  const byLoad = (a: Staff, b: Staff) => loadFor(db, a.id) - loadFor(db, b.id);

  // 1) available + under cap, least loaded
  const available = pool.filter((s) => s.presence === "available" && loadFor(db, s.id) < capFor(s)).sort(byLoad);
  if (available.length) return available[0].id;

  // 2) anyone under cap, least loaded (busy but not off/over capacity)
  const anyUnderCap = pool.filter((s) => s.presence !== "off" && loadFor(db, s.id) < capFor(s)).sort(byLoad);
  if (anyUnderCap.length) return anyUnderCap[0].id;

  // 3) fallback: the department lead, else the least-loaded person in the dept
  const lead = inDept.find((s) => /lead|head|manager/i.test(s.role));
  return lead?.id ?? [...inDept].sort(byLoad)[0]?.id ?? null;
}
