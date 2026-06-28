import { Card, StatusBadge, PriorityTag, Avatar, EmptyState } from "@/components/ui";
import { ListChecks } from "lucide-react";
import type { Task } from "@/lib/types";

export function TaskTable({ data, dense = false }: { data: Task[]; dense?: boolean }) {
  if (data.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={<ListChecks size={20} />}
          title="No tasks here"
          description="Nothing matches this view right now. New requests will appear automatically."
        />
      </Card>
    );
  }

  return (
    <Card>
      {/* head — hidden on mobile */}
      <div className="hidden grid-cols-[1.6fr_1fr_0.9fr_0.9fr_0.8fr] gap-4 border-b border-line px-5 py-3 text-[11px] uppercase tracking-wider text-ink-4 md:grid">
        <span>Task</span>
        <span>Department</span>
        <span>Priority</span>
        <span>Assignee</span>
        <span className="text-right">Status</span>
      </div>

      <div>
        {data.map((t) => (
          <div
            key={t.id}
            className="grid grid-cols-1 gap-3 border-b border-line px-5 py-4 transition-colors last:border-0 hover:bg-white/[0.02] md:grid-cols-[1.6fr_1fr_0.9fr_0.9fr_0.8fr] md:items-center md:gap-4"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-ink-4">{t.id}</span>
                <span className="text-[13px] font-medium text-ink">{t.villa}</span>
              </div>
              <div className="mt-0.5 truncate text-[13px] text-ink-2">{t.title}</div>
            </div>

            <div className="text-[13px] text-ink-2">
              <span className="text-ink-4 md:hidden">Dept · </span>
              {t.department}
            </div>

            <div>
              <PriorityTag priority={t.priority} />
            </div>

            <div className="flex items-center gap-2">
              {t.assignee ? (
                <>
                  <Avatar name={t.assignee} size={24} />
                  <span className="text-[13px] text-ink-2">{t.assignee}</span>
                </>
              ) : (
                <span className="text-[13px] text-ink-4">Unassigned</span>
              )}
            </div>

            <div className="flex items-center justify-between md:flex-col md:items-end md:gap-1">
              <StatusBadge status={t.status} />
              {!dense && <span className="text-[11px] text-ink-3">{t.when}</span>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
