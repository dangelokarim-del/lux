"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, MessageSquareText, Sparkles } from "lucide-react";
import { Topbar } from "@/components/app/Topbar";
import { Avatar, Badge, Card } from "@/components/ui";
import { categoryMeta, deptLabel, intentMeta, priorityMeta, statusMeta, type Task } from "@/lib/domain";
import { useDatabase, useReady } from "@/lib/store/hooks";
import { TaskDetail } from "@/components/product/TaskDetail";
import { timeAgo } from "@/components/product/format";

interface Req {
  id: string;
  body: string;
  createdAt: string;
  guestName: string;
  villaName: string | null;
  task: Task | null;
}

export default function RequestsPage() {
  const readyState = useReady();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const ready = readyState && mounted;

  const db = useDatabase();
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  const feed: Req[] = useMemo(() => {
    return db.messages
      .filter((m) => m.direction === "inbound")
      .map((m) => {
        const conv = db.conversations.find((c) => c.id === m.conversationId) ?? null;
        const guest = db.guests.find((g) => g.id === conv?.guestId) ?? null;
        const property = db.properties.find((p) => p.id === conv?.propertyId) ?? null;
        const task = db.tasks.find((t) => t.id === m.taskId) ?? null;
        return { id: m.id, body: m.body, createdAt: m.createdAt, guestName: guest?.name ?? m.author, villaName: property?.name ?? null, task };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [db.messages, db.conversations, db.guests, db.properties, db.tasks]);

  const open = feed.filter((r) => r.task && statusMeta[r.task.status].open).length;

  // detect freshly-arrived requests → play the AI-analyzing animation
  const seen = useRef<Set<string> | null>(null);
  const [analyzing, setAnalyzing] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!ready) return;
    if (seen.current === null) {
      seen.current = new Set(feed.map((r) => r.id));
      return;
    }
    for (const r of feed) {
      if (!seen.current.has(r.id)) {
        seen.current.add(r.id);
        setAnalyzing((s) => new Set(s).add(r.id));
        setTimeout(() => setAnalyzing((s) => { const n = new Set(s); n.delete(r.id); return n; }), 1600);
      }
    }
  }, [feed, ready]);

  return (
    <>
      <Topbar title="Guest Requests" subtitle={`${open} open · ${feed.length} captured`} />
      <div className="p-5 sm:p-7">
        <div className="mx-auto max-w-2xl">
          <Card className="mb-6 flex items-center gap-4 p-5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[rgba(46,125,255,0.3)] bg-accent-soft">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative h-2 w-2 rounded-full bg-accent" />
              </span>
            </div>
            <div>
              <div className="text-[14px] font-medium">AI inbox · listening across all channels</div>
              <div className="text-[13px] text-ink-3">
                Every WhatsApp message is read, understood and turned into a structured task automatically.
              </div>
            </div>
          </Card>

          {!ready ? (
            <div className="space-y-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
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
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {feed.map((r) => (
                  <RequestCard key={r.id} req={r} analyzing={analyzing.has(r.id)} onOpen={() => r.task && setOpenTaskId(r.task.id)} />
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

function RequestCard({ req, analyzing, onOpen }: { req: Req; analyzing: boolean; onOpen: () => void }) {
  const t = req.task;
  const chips = t
    ? [
        t.intent ? { k: "Intent", v: intentMeta[t.intent].label } : null,
        { k: "Villa", v: req.villaName ?? "—" },
        t.room ? { k: "Room", v: t.room } : null,
        { k: "Department", v: deptLabel(t.department) },
        { k: "Priority", v: priorityMeta[t.priority].label },
        t.aiConfidence != null ? { k: "Confidence", v: `${Math.round(t.aiConfidence * 100)}%` } : null,
        { k: "Category", v: categoryMeta[t.category].label },
      ].filter(Boolean) as { k: string; v: string }[]
    : [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(4px)" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden rounded-xl border border-line bg-white/[0.012]"
    >
      {/* incoming message */}
      <div className="flex items-start gap-3 p-4">
        <Avatar name={req.guestName} size={34} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[13.5px] font-medium text-ink">{req.guestName}</span>
            {req.villaName && <span className="truncate text-[12px] text-ink-3">· {req.villaName}</span>}
            <span className="ml-auto shrink-0 text-[11px] text-ink-4">{timeAgo(req.createdAt)}</span>
          </div>
          <p className="mt-1 text-[13px] text-ink-2">{req.body}</p>
        </div>
      </div>

      {/* AI analysis */}
      <div className="border-t border-line bg-black/20 px-4 py-3">
        <AnimatePresence mode="wait">
          {analyzing ? (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-[12.5px] text-accent"
            >
              <Sparkles size={14} className="animate-pulse" /> LUXA is analysing the request
              <span className="inline-flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} className="h-1 w-1 rounded-full bg-accent" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                ))}
              </span>
            </motion.div>
          ) : t ? (
            <motion.div key="done" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
              <div className="flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.12em] text-accent">
                <Sparkles size={12} /> Structured by AI
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {chips.map((c, i) => (
                  <motion.span
                    key={c.k}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.05, duration: 0.3 }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line-2 bg-white/[0.03] px-2 py-1 text-[11.5px]"
                  >
                    <span className="text-ink-4">{c.k}</span>
                    <span className="font-medium text-ink-2">{c.v}</span>
                  </motion.span>
                ))}
              </div>
              <button onClick={onOpen} className="group mt-3 flex w-full items-center justify-between rounded-lg border border-ok/25 bg-[rgba(74,212,138,0.05)] px-3 py-2 text-left transition-colors hover:bg-[rgba(74,212,138,0.09)]">
                <span className="flex items-center gap-1.5 text-[12.5px] text-ok">
                  <span className="h-1.5 w-1.5 rounded-full bg-ok" /> Task {t.code} created
                  <Badge tone={statusMeta[t.status].tone} variant="soft" size="sm" className="ml-1">{statusMeta[t.status].label}</Badge>
                </span>
                <span className="flex items-center gap-1 text-[12.5px] font-medium text-accent">
                  Open <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            </motion.div>
          ) : (
            <p className="text-[12px] text-ink-4">Awaiting structuring…</p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
