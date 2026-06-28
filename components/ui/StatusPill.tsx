import { cn } from "@/lib/utils";
import { tones, type Tone } from "@/lib/tone";
import type { Presence, Priority } from "@/lib/types";

/** Generic dot + label pill. */
export function StatusPill({
  tone = "neutral",
  children,
  pulse = false,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  pulse?: boolean;
  className?: string;
}) {
  const t = tones[tone];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[12px] font-medium", t.text, className)}>
      <span className="relative inline-flex h-1.5 w-1.5">
        {pulse && (
          <span className={cn("absolute inset-0 animate-ping rounded-full opacity-60", t.dot)} />
        )}
        <span className={cn("relative h-1.5 w-1.5 rounded-full", t.dot)} />
      </span>
      {children}
    </span>
  );
}

const priorityTone: Record<Priority, Tone> = {
  Urgent: "urgent",
  High: "warn",
  Normal: "muted",
};

export function PriorityTag({ priority }: { priority: Priority }) {
  if (priority === "Normal") {
    return <span className="text-[12px] text-ink-3">Normal</span>;
  }
  return <StatusPill tone={priorityTone[priority]}>{priority}</StatusPill>;
}

const presenceTone: Record<Presence, Tone> = {
  Available: "ok",
  Busy: "warn",
  Off: "muted",
};

export function PresenceTag({ presence }: { presence: Presence }) {
  return (
    <StatusPill tone={presenceTone[presence]} pulse={presence === "Available"}>
      {presence}
    </StatusPill>
  );
}
