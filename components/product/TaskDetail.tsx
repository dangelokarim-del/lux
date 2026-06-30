"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Sparkles } from "lucide-react";
import { Avatar, Badge, StatusPill, buttonVariants } from "@/components/ui";
import {
  BOARD_STATUSES,
  categoryMeta,
  departmentMeta,
  intentMeta,
  presenceMeta,
  priorityMeta,
  statusMeta,
  type Staff,
  type TaskStatus,
} from "@/lib/domain";
import { useConversation, useLuxa, useNotesForTask, useStaff, useTask } from "@/lib/store/hooks";
import { SlideOver } from "./SlideOver";
import { clockTime, timeAgo } from "./format";

export function TaskDetail({ taskId, onClose }: { taskId: string | null; onClose: () => void }) {
  const task = useTask(taskId);
  const store = useLuxa();
  const staff = useStaff();
  const notes = useNotesForTask(taskId);
  const { messages } = useConversation(task?.conversationId ?? null);
  const [noteDraft, setNoteDraft] = useState("");
  const [assignOpen, setAssignOpen] = useState(false);

  const property = store.propertyById(task?.propertyId ?? null);
  const guest = store.guestById(task?.guestId ?? null);
  const assignee = store.staffById(task?.assigneeId ?? null);
  const sourceMessage = messages.find((m) => m.id === task?.sourceMessageId) ?? null;
  const completed = task?.status === "completed";

  function submitNote() {
    if (!task || !noteDraft.trim()) return;
    store.addNote(task.id, noteDraft, { name: "You" });
    setNoteDraft("");
  }

  return (
    <SlideOver
      open={!!task}
      onClose={onClose}
      width={480}
      subtitle={task?.code}
      title={task?.title}
      footer={
        task && (
          <button
            onClick={() => store.setTaskStatus(task.id, completed ? "in_progress" : "completed")}
            className={buttonVariants({ variant: completed ? "secondary" : "accent", size: "md", className: "w-full justify-center" })}
          >
            {completed ? "Reopen task" : (<><Check size={16} /> Mark completed</>)}
          </button>
        )
      }
    >
      {task && (
        <div className="space-y-6 px-5 py-5">
          {/* status control */}
          <section>
            <Label>Status</Label>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {BOARD_STATUSES.map((s) => (
                <StatusButton key={s} status={s} active={task.status === s} onClick={() => store.setTaskStatus(task.id, s)} />
              ))}
            </div>
          </section>

          {/* assignment */}
          <section className="relative">
            <Label>Assignee</Label>
            <button
              onClick={() => setAssignOpen((v) => !v)}
              className="mt-2 flex w-full items-center justify-between rounded-[var(--radius-control)] border border-line-2 bg-bg px-3 py-2.5 text-left transition-colors hover:border-white/20"
            >
              <span className="flex items-center gap-2.5">
                {assignee ? (
                  <>
                    <Avatar name={assignee.name} size={26} />
                    <span className="text-[13.5px] text-ink">{assignee.name}</span>
                    <StatusPill tone={presenceMeta[assignee.presence].tone}>{presenceMeta[assignee.presence].label}</StatusPill>
                  </>
                ) : (
                  <span className="text-[13.5px] text-ink-3">Unassigned</span>
                )}
              </span>
              <ChevronDown size={15} className={`text-ink-3 transition-transform ${assignOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {assignOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="absolute z-20 mt-1.5 max-h-72 w-full overflow-y-auto rounded-[var(--radius-control)] border border-line-2 bg-bg-elev p-1.5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]"
                >
                  <AssignRow label="Unassigned" active={!assignee} onClick={() => { store.assignTask(task.id, null); setAssignOpen(false); }} />
                  {sortStaff(staff, task.department).map((s) => (
                    <AssignRow
                      key={s.id}
                      label={s.name}
                      sub={`${s.role} · ${presenceMeta[s.presence].label}`}
                      avatar={s.name}
                      recommended={s.department === task.department}
                      active={assignee?.id === s.id}
                      onClick={() => { store.assignTask(task.id, s.id); setAssignOpen(false); }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* details */}
          <section className="grid grid-cols-2 gap-x-4 gap-y-3.5 rounded-xl border border-line bg-white/[0.012] p-4">
            <Meta label="Villa">{property ? `${property.name}` : "—"}</Meta>
            <Meta label="Room">{task.room ?? "—"}</Meta>
            <Meta label="Department">{departmentMeta[task.department].label}</Meta>
            <Meta label="Category">{categoryMeta[task.category].label}</Meta>
            <Meta label="Priority"><StatusPill tone={priorityMeta[task.priority].tone}>{priorityMeta[task.priority].label}</StatusPill></Meta>
            <Meta label="Guest">{guest?.name ?? "—"}</Meta>
          </section>

          {/* AI extraction / source */}
          {sourceMessage && (
            <section className="rounded-xl border border-[rgba(46,125,255,0.18)] bg-accent-soft/40 p-4">
              <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-accent">
                <Sparkles size={13} /> Extracted by LUXA AI
                {task.aiConfidence != null && (
                  <span className="ml-auto tabular-nums text-ink-3">{Math.round(task.aiConfidence * 100)}% confidence</span>
                )}
              </div>
              <p className="mt-2.5 rounded-lg bg-white/[0.03] px-3 py-2 text-[13px] italic text-ink-2">“{sourceMessage.body}”</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {task.intent && <Badge tone="accent" variant="outline" size="sm">{intentMeta[task.intent].label}</Badge>}
                <Badge tone="accent" variant="outline" size="sm">{categoryMeta[task.category].label}</Badge>
                {task.room && <Badge tone="accent" variant="outline" size="sm">{task.room}</Badge>}
                <Badge tone={priorityMeta[task.priority].tone} variant="outline" size="sm">{priorityMeta[task.priority].label}</Badge>
              </div>
            </section>
          )}

          {/* activity + notes */}
          <section>
            <Label>Activity</Label>
            <div className="mt-2.5 space-y-3">
              {notes.length === 0 && <p className="text-[13px] text-ink-3">No activity yet.</p>}
              {notes.map((n) => (
                <div key={n.id} className="flex gap-2.5">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${n.system ? "bg-ink-4" : "bg-accent"}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-[12.5px] font-medium text-ink-2">{n.authorName}</span>
                      <span className="text-[11px] text-ink-4">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className={`text-[13px] ${n.system ? "text-ink-3" : "text-ink"}`}>{n.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <input
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitNote()}
                placeholder="Add a note…"
                className="h-10 flex-1 rounded-[var(--radius-control)] border border-line-2 bg-bg px-3 text-[13.5px] text-ink outline-none transition-colors placeholder:text-ink-4 focus:border-accent"
              />
              <button onClick={submitNote} disabled={!noteDraft.trim()} className={buttonVariants({ variant: "secondary", size: "md" })}>
                Add
              </button>
            </div>
          </section>

          <p className="text-[11px] text-ink-4">Created {clockTime(task.createdAt)} · Updated {timeAgo(task.updatedAt)}</p>
        </div>
      )}
    </SlideOver>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-ink-3">{children}</div>;
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] text-ink-4">{label}</div>
      <div className="mt-0.5 text-[13.5px] text-ink">{children}</div>
    </div>
  );
}

function StatusButton({ status, active, onClick }: { status: TaskStatus; active: boolean; onClick: () => void }) {
  const meta = statusMeta[status];
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border px-1 py-2 text-[11.5px] font-medium transition-colors ${
        active
          ? "border-accent/40 bg-accent-soft text-ink"
          : "border-line text-ink-3 hover:border-line-2 hover:text-ink-2"
      }`}
    >
      {meta.label}
    </button>
  );
}

function AssignRow({ label, sub, avatar, active, recommended, onClick }: { label: string; sub?: string; avatar?: string; active?: boolean; recommended?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/[0.05] ${active ? "bg-white/[0.04]" : ""}`}>
      {avatar ? <Avatar name={avatar} size={26} /> : <span className="grid h-[26px] w-[26px] place-items-center rounded-full border border-dashed border-line-2 text-[10px] text-ink-4">—</span>}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-[13px] text-ink">
          {label}
          {recommended && <span className="rounded-full bg-accent-soft px-1.5 py-0.5 text-[9px] font-medium text-accent">Dept</span>}
        </span>
        {sub && <span className="block truncate text-[11px] text-ink-4">{sub}</span>}
      </span>
      {active && <Check size={14} className="text-accent" />}
    </button>
  );
}

function sortStaff(staff: Staff[], dept: Staff["department"]): Staff[] {
  return [...staff].sort((a, b) => {
    if (a.department === dept && b.department !== dept) return -1;
    if (b.department === dept && a.department !== dept) return 1;
    return a.name.localeCompare(b.name);
  });
}
