"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Info, TriangleAlert, X, Sparkles } from "lucide-react";
import { tones, type Tone } from "@/lib/tone";

type ToastKind = "success" | "info" | "error" | "ai";

interface Toast {
  id: string;
  title: string;
  body?: string;
  kind: ToastKind;
  action?: { label: string; onClick: () => void };
}

const kindMeta: Record<ToastKind, { tone: Tone; icon: typeof Check }> = {
  success: { tone: "ok", icon: Check },
  info: { tone: "neutral", icon: Info },
  error: { tone: "urgent", icon: TriangleAlert },
  ai: { tone: "accent", icon: Sparkles },
};

const ToastCtx = createContext<{ show: (t: Omit<Toast, "id">) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    const tm = timers.current.get(id);
    if (tm) clearTimeout(tm);
    timers.current.delete(id);
  }, []);

  const show = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev.slice(-3), { ...t, id }]);
      timers.current.set(id, setTimeout(() => dismiss(id), t.kind === "error" ? 6000 : 4500));
    },
    [dismiss]
  );

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[200] flex flex-col items-center gap-2 p-4 sm:bottom-5 sm:right-5 sm:left-auto sm:items-end sm:p-0" aria-live="polite" role="status">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const m = kindMeta[t.kind];
            const Icon = m.icon;
            const c = tones[m.tone];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.96, transition: { duration: 0.25 } }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="pointer-events-auto flex w-full max-w-[380px] items-start gap-3 rounded-xl border border-line-2 bg-bg-elev/90 p-3.5 shadow-[0_24px_70px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl"
              >
                <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${c.bg} ${c.text}`}>
                  <Icon size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-medium text-ink">{t.title}</div>
                  {t.body && <div className="mt-0.5 truncate text-[12.5px] text-ink-3">{t.body}</div>}
                  {t.action && (
                    <button onClick={() => { t.action!.onClick(); dismiss(t.id); }} className="mt-1.5 text-[12.5px] font-medium text-accent hover:opacity-80">
                      {t.action.label}
                    </button>
                  )}
                </div>
                <button onClick={() => dismiss(t.id)} className="shrink-0 text-ink-4 transition-colors hover:text-ink-2" aria-label="Dismiss">
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
