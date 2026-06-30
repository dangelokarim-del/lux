"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { useNotifications } from "@/lib/store/hooks";
import { timeAgo } from "./format";

export function NotificationBell({ onOpenTask }: { onOpenTask: (id: string) => void }) {
  const { items, unread, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="focus-ring grid h-9 w-9 place-items-center rounded-[var(--radius-control)] border border-line bg-white/[0.02] text-ink-2 transition-colors hover:text-ink"
      >
        <span className="relative">
          <Bell size={16} />
          {unread > 0 && (
            <span className="absolute -right-1.5 -top-1.5 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-accent px-1 text-[9px] font-semibold leading-none text-white">
              {unread}
            </span>
          )}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 z-50 mt-2 w-[340px] overflow-hidden rounded-xl border border-line-2 bg-bg-elev shadow-[0_40px_100px_-30px_rgba(0,0,0,0.85)]"
            >
              <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                <span className="text-[13px] font-medium text-ink">Notifications</span>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-[12px] text-accent hover:opacity-80">Mark all read</button>
                )}
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {items.length === 0 && <p className="px-4 py-6 text-center text-[13px] text-ink-3">You're all caught up.</p>}
                {items.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => { markRead(n.id); if (n.taskId) onOpenTask(n.taskId); setOpen(false); }}
                    className={`flex w-full gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-0 hover:bg-white/[0.03] ${n.read ? "" : "bg-accent-soft/30"}`}
                  >
                    <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${n.read ? "bg-ink-4" : "bg-accent"}`} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="text-[13px] font-medium text-ink">{n.title}</span>
                        <span className="shrink-0 text-[11px] text-ink-4">{timeAgo(n.createdAt)}</span>
                      </span>
                      <span className="block truncate text-[12.5px] text-ink-3">{n.body}</span>
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
