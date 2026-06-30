"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

const ease = [0.32, 0.72, 0, 1] as const;

/** Right-side drawer used for task detail + the WhatsApp simulator. */
export function SlideOver({
  open,
  onClose,
  title,
  subtitle,
  width = 460,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  width?: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            onClick={onClose}
          />
          <motion.aside
            className="absolute right-0 top-0 flex h-full max-w-[94vw] flex-col border-l border-line bg-bg-elev shadow-[-40px_0_120px_-40px_rgba(0,0,0,0.8)]"
            style={{ width }}
            initial={{ x: width + 40 }}
            animate={{ x: 0 }}
            exit={{ x: width + 40 }}
            transition={{ duration: 0.42, ease }}
            role="dialog"
            aria-modal="true"
          >
            {(title || subtitle) && (
              <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
                <div className="min-w-0">
                  {subtitle && <div className="text-[11px] uppercase tracking-[0.14em] text-ink-3">{subtitle}</div>}
                  {title && <div className="mt-0.5 truncate text-[16px] font-medium text-ink">{title}</div>}
                </div>
                <button
                  onClick={onClose}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-3 transition-colors hover:bg-white/[0.06] hover:text-ink"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </header>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
            {footer && <footer className="border-t border-line px-5 py-4">{footer}</footer>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
