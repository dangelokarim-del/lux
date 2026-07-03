"use client";

import { cn } from "@/lib/utils";

/**
 * A premium toggle — the Apple System Settings switch. A sliding knob over a
 * track that fills with the accent when on, with a soft spring and a focus ring.
 */
export function Switch({
  checked,
  onChange,
  disabled,
  label,
  className,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "focus-ring relative inline-flex h-[26px] w-[44px] shrink-0 items-center rounded-full transition-colors duration-300 ease-[var(--ease-premium)] disabled:opacity-40",
        checked ? "bg-accent [box-shadow:inset_0_0_0_1px_rgba(46,125,255,0.6),0_0_18px_-6px_rgba(46,125,255,0.7)]" : "bg-white/[0.09] [box-shadow:inset_0_0_0_1px_rgba(255,255,255,0.08)]",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute left-[3px] grid h-5 w-5 place-items-center rounded-full bg-white shadow-[0_2px_6px_-1px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-[var(--ease-premium)]",
          checked ? "translate-x-[18px]" : "translate-x-0"
        )}
      />
    </button>
  );
}
