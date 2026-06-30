"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquareText } from "lucide-react";
import { Topbar } from "@/components/app/Topbar";
import { Avatar, Badge, Card } from "@/components/ui";
import { statusMeta } from "@/lib/domain";
import { useDatabase, useReady } from "@/lib/store/hooks";
import { TaskDetail } from "@/components/product/TaskDetail";
import { timeAgo } from "@/components/product/format";

export default function RequestsPage() {
  const readyState = useReady();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const ready = readyState && mounted;

  const db = useDatabase();
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  const feed = useMemo(() => {
    return db.messages
      .filter((m) => m.direction === "inbound")
      .map((m) => {
        const conv = db.conversations.find((c) => c.id === m.conversationId) ?? null;
        const guest = db.guests.find((g) => g.id === conv?.guestId) ?? null;
        const property = db.properties.find((p) => p.id === conv?.propertyId) ?? null;
        const task = db.tasks.find((t) => t.id === m.taskId) ?? null;
        return { id: m.id, body: m.body, createdAt: m.createdAt, guest, property, task };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [db.messages, db.conversations, db.guests, db.properties, db.tasks]);

  const open = feed.filter((r) => r.task && statusMeta[r.task.status].open).length;

  return (
    <>
      <Topbar title="Guest Requests" subtitle={`${open} open · ${feed.length} captured`} />
      <div className="p-5 sm:p-7">
        <div className="mx-auto max-w-2xl">
          <Card className="mb-6 flex items-center gap-4 p-5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[rgba(46,125,255,0.3)] bg-accent-soft">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
            </div>
            <div>
              <div className="text-[14px] font-medium">Listening across all channels</div>
              <div className="text-[13px] text-ink-3">
                WhatsApp messages are captured and structured into tasks automatically.
              </div>
            </div>
          </Card>

          {!ready ? (
            <div className="space-y-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="skeleton h-3 w-1/3 rounded" />
                  <div className="skeleton mt-2.5 h-3 w-2/3 rounded" />
                </Card>
              ))}
            </div>
          ) : feed.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-[14px] border border-line bg-bg-elev text-ink-3">
                <MessageSquareText size={20} />
              </div>
              <h3 className="text-[15px] font-medium text-ink">No requests yet</h3>
              <p className="mt-1.5 max-w-xs text-[13px] text-ink-3">Guest messages will appear here the moment they arrive.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <AnimatePresence initial={false}>
                {feed.map((r) => (
                  <motion.button
                    key={r.id}
                    layout
                    onClick={() => r.task && setOpenTaskId(r.task.id)}
                    disabled={!r.task}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group flex w-full items-start gap-3 rounded-xl border border-line bg-white/[0.012] p-4 text-left transition-colors enabled:hover:border-line-2 enabled:hover:bg-white/[0.025] disabled:cursor-default"
                  >
                    <Avatar name={r.guest?.name ?? "Guest"} size={34} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13.5px] font-medium text-ink">{r.guest?.name ?? "Guest"}</span>
                        {r.property && <span className="truncate text-[12px] text-ink-4">· {r.property.name}</span>}
                        <span className="ml-auto shrink-0 text-[11px] text-ink-4">{timeAgo(r.createdAt)}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[13px] text-ink-2">{r.body}</p>
                      {r.task && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="tabular-nums text-[11px] text-ink-4">{r.task.code}</span>
                          <Badge tone={statusMeta[r.task.status].tone} variant="soft" size="sm">
                            {statusMeta[r.task.status].label}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <TaskDetail taskId={openTaskId} onClose={() => setOpenTaskId(null)} />
    </>
  );
}
