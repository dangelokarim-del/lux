import { cn } from "@/lib/utils";
import { tones, type Tone } from "@/lib/tone";
import type { Presence } from "@/lib/types";

const presenceTone: Record<Presence, Tone> = {
  Available: "ok",
  Busy: "warn",
  Off: "muted",
};

/** Bare status dot with optional ping. */
export function StatusDot({
  tone = "neutral",
  pulse = false,
  className,
}: {
  tone?: Tone;
  pulse?: boolean;
  className?: string;
}) {
  const t = tones[tone];
  return (
    <span className={cn("relative inline-flex h-2 w-2", className)}>
      {pulse && <span className={cn("absolute inset-0 animate-ping rounded-full opacity-60", t.dot)} />}
      <span className={cn("relative h-2 w-2 rounded-full", t.dot)} />
    </span>
  );
}

export function PresenceDot({ presence }: { presence: Presence }) {
  return <StatusDot tone={presenceTone[presence]} pulse={presence === "Available"} />;
}
