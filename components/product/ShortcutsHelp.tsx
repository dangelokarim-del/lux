"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

const GROUPS: { title: string; items: { keys: string[]; label: string }[] }[] = [
  {
    title: "General",
    items: [
      { keys: ["N"], label: "New message" },
      { keys: ["/"], label: "Focus search" },
      { keys: ["?"], label: "Toggle this help" },
      { keys: ["Esc"], label: "Close panel or dialog" },
    ],
  },
  {
    title: "Task board",
    items: [
      { keys: ["J"], label: "Next request" },
      { keys: ["K"], label: "Previous request" },
      { keys: ["↵"], label: "Open selected request" },
      { keys: ["1", "–", "5"], label: "Filter by status" },
    ],
  },
];

export function ShortcutsHelp({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[150] grid place-items-center px-5">
          <motion.div
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard shortcuts"
            className="relative w-full max-w-[440px] overflow-hidden rounded-2xl border border-line-2 bg-bg-elev shadow-[0_50px_120px_-30px_rgba(0,0,0,0.85)]"
          >
            <div className="border-b border-line px-5 py-4">
              <div className="text-[11px] uppercase tracking-[0.14em] text-ink-3">Keyboard</div>
              <div className="mt-0.5 text-[16px] font-medium text-ink">Shortcuts</div>
            </div>
            <div className="grid gap-6 p-5 sm:grid-cols-2">
              {GROUPS.map((g) => (
                <div key={g.title}>
                  <div className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.12em] text-ink-4">{g.title}</div>
                  <div className="space-y-2">
                    {g.items.map((it) => (
                      <div key={it.label} className="flex items-center justify-between gap-3">
                        <span className="text-[13px] text-ink-2">{it.label}</span>
                        <span className="flex items-center gap-1">
                          {it.keys.map((k) => (
                            <kbd key={k} className="grid h-5 min-w-5 place-items-center rounded-[6px] border border-line-2 bg-white/[0.04] px-1.5 text-[11px] font-medium text-ink-2">
                              {k}
                            </kbd>
                          ))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
