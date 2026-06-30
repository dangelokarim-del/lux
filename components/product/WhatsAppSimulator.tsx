"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Send, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui";
import {
  categoryMeta,
  departmentMeta,
  intentMeta,
  priorityMeta,
  type Extraction,
} from "@/lib/domain";
import { useDatabase, useGuests, useLuxa } from "@/lib/store/hooks";
import { buildWhatsAppWebhook, parseWhatsAppWebhook } from "@/lib/services/whatsapp/inbound";
import { SlideOver } from "./SlideOver";
import { clockTime } from "./format";

const PRESETS = [
  "Hi, the AC is not working in the master bedroom.",
  "Could we get fresh towels by the pool please?",
  "We'd like a private chef for dinner tonight, 6 people.",
  "Can you arrange an airport transfer for tomorrow at 10am?",
  "The WiFi has stopped working in the living room.",
];

type Phase = "compose" | "analyzing" | "done";

export function WhatsAppSimulator({ open, onClose, onOpenTask }: { open: boolean; onClose: () => void; onOpenTask: (id: string) => void }) {
  const db = useDatabase();
  const guests = useGuests();
  const store = useLuxa();

  const occupants = useMemo(() => guests.filter((g) => g.propertyId), [guests]);
  const [guestId, setGuestId] = useState(occupants[0]?.id ?? "");
  const guest = occupants.find((g) => g.id === guestId) ?? occupants[0];
  const property = store.propertyById(guest?.propertyId ?? null);

  const [body, setBody] = useState(PRESETS[0]);
  const [phase, setPhase] = useState<Phase>("compose");
  const [result, setResult] = useState<{ extraction: Extraction; taskId: string; code: string } | null>(null);

  const conversation = db.conversations.find((c) => c.guestId === guest?.id && c.channel === "whatsapp") ?? null;
  const thread = useMemo(
    () => db.messages.filter((m) => m.conversationId === conversation?.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [db.messages, conversation?.id]
  );

  async function send() {
    if (!guest || !body.trim() || phase === "analyzing") return;
    setPhase("analyzing");
    setResult(null);
    const payload = buildWhatsAppWebhook({ from: guest.phone, body: body.trim(), name: guest.name });
    const [inbound] = parseWhatsAppWebhook(payload);
    const res = await store.ingestWhatsApp(inbound);
    setResult({ extraction: res.extraction, taskId: res.taskId, code: res.code });
    setPhase("done");
    setBody("");
  }

  function reset() {
    setPhase("compose");
    setResult(null);
    setBody(PRESETS[0]);
  }

  return (
    <SlideOver open={open} onClose={onClose} width={480} subtitle="WhatsApp · inbound" title="Guest message simulator">
      <div className="flex h-full flex-col">
        {/* guest selector */}
        <div className="flex items-center gap-3 border-b border-line px-5 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#25D366]/15 text-[12px] font-semibold text-[#43d178]">WA</span>
          <select
            value={guestId}
            onChange={(e) => { setGuestId(e.target.value); reset(); }}
            className="flex-1 rounded-lg border border-line-2 bg-bg px-2.5 py-1.5 text-[13px] text-ink outline-none focus:border-accent"
          >
            {occupants.map((g) => {
              const p = store.propertyById(g.propertyId);
              return <option key={g.id} value={g.id}>{g.name} · {p?.name}</option>;
            })}
          </select>
        </div>

        {/* chat thread */}
        <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto bg-[#070809] px-4 py-4">
          {thread.length === 0 && phase === "compose" && (
            <p className="mt-6 text-center text-[12.5px] text-ink-4">No messages yet — send one to see LUXA work.</p>
          )}
          {thread.map((m) => (
            <Bubble key={m.id} side={m.direction === "inbound" ? "left" : "right"} time={clockTime(m.createdAt)}>
              {m.body}
            </Bubble>
          ))}

          <AnimatePresence>
            {phase === "analyzing" && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-1 py-1 text-[12.5px] text-accent">
                <Sparkles size={14} className="animate-pulse" /> LUXA is analysing the request
                <Dots />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {phase === "done" && result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mt-1 rounded-xl border border-[rgba(46,125,255,0.22)] bg-accent-soft/40 p-3.5"
              >
                <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-accent">
                  <Sparkles size={13} /> Structured by AI
                  <span className="ml-auto tabular-nums text-ink-3">{Math.round(result.extraction.confidence * 100)}%</span>
                </div>
                <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-2">
                  <Field k="Intent" v={intentMeta[result.extraction.intent].label} delay={0.05} />
                  <Field k="Category" v={categoryMeta[result.extraction.category].label} delay={0.12} />
                  <Field k="Property" v={result.extraction.propertyName ?? property?.name ?? "—"} delay={0.19} />
                  <Field k="Room" v={result.extraction.room ?? "—"} delay={0.26} />
                  <Field k="Priority" v={priorityMeta[result.extraction.priority].label} delay={0.33} />
                  <Field k="Department" v={departmentMeta[result.extraction.department].label} delay={0.4} />
                </div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-3 flex items-center justify-between rounded-lg border border-ok/30 bg-[rgba(74,212,138,0.06)] px-3 py-2">
                  <span className="flex items-center gap-1.5 text-[12.5px] text-ok"><span className="h-1.5 w-1.5 rounded-full bg-ok" /> Task {result.code} created</span>
                  <button onClick={() => { onOpenTask(result.taskId); onClose(); }} className="flex items-center gap-1 text-[12.5px] font-medium text-accent hover:opacity-80">
                    Open <ArrowRight size={13} />
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* composer */}
        <div className="border-t border-line px-4 py-3">
          {phase !== "done" && (
            <div className="mb-2.5 flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button key={p} onClick={() => setBody(p)} className="rounded-full border border-line px-2.5 py-1 text-[11px] text-ink-3 transition-colors hover:border-line-2 hover:text-ink-2">
                  {p.length > 34 ? p.slice(0, 32) + "…" : p}
                </button>
              ))}
            </div>
          )}
          {phase === "done" ? (
            <button onClick={reset} className={buttonVariants({ variant: "secondary", size: "md", className: "w-full justify-center" })}>
              Send another message
            </button>
          ) : (
            <div className="flex items-end gap-2">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                rows={2}
                placeholder="Type a guest message…"
                className="flex-1 resize-none rounded-[var(--radius-control)] border border-line-2 bg-bg px-3 py-2 text-[13.5px] text-ink outline-none transition-colors placeholder:text-ink-4 focus:border-accent"
              />
              <button onClick={send} disabled={!body.trim() || phase === "analyzing"} className={buttonVariants({ variant: "accent", size: "icon", className: "h-[42px] w-[42px] shrink-0" })} aria-label="Send">
                <Send size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </SlideOver>
  );
}

function Bubble({ side, time, children }: { side: "left" | "right"; time: string; children: React.ReactNode }) {
  const left = side === "left";
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className={`flex ${left ? "justify-start" : "justify-end"}`}>
      <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-[13.5px] leading-snug ${left ? "rounded-tl-md bg-white/[0.06] text-ink" : "rounded-tr-md bg-[#155b3f] text-white"}`}>
        <p>{children}</p>
        <div className={`mt-0.5 text-right text-[9.5px] ${left ? "text-ink-4" : "text-white/55"}`}>{time}</div>
      </div>
    </motion.div>
  );
}

function Field({ k, v, delay }: { k: string; v: string; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}>
      <div className="text-[10px] uppercase tracking-[0.1em] text-ink-4">{k}</div>
      <div className="text-[13px] font-medium text-ink">{v}</div>
    </motion.div>
  );
}

function Dots() {
  return (
    <span className="inline-flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="h-1 w-1 rounded-full bg-accent" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
      ))}
    </span>
  );
}
