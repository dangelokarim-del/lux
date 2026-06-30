/**
 * Id + reference helpers. Centralised so a future backend can swap these for
 * database-generated UUIDs / sequences without touching call sites.
 */

let counter = 0;

/** prefixed, sortable-ish unique id (e.g. "task_lq9f2_3") for in-memory rows */
export function newId(prefix: string): string {
  counter += 1;
  const rand = Math.random().toString(36).slice(2, 7);
  return `${prefix}_${rand}${counter}`;
}

let taskSeq = 1042;
/** human-facing task reference, e.g. "REQ-1043" */
export function nextTaskCode(): string {
  taskSeq += 1;
  return `REQ-${taskSeq}`;
}

/** seed the task sequence from existing data so codes stay monotonic */
export function primeTaskSeq(highest: number): void {
  if (highest >= taskSeq) taskSeq = highest;
}
