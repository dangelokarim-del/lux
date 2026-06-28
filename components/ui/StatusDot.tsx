import { cn } from "@/lib/utils";
import type { Presence } from "@/lib/types";

const tone: Record<Presence, string> = {
  Available: "bg-ok",
  Busy: "bg-warn",
  Off: "bg-ink-4",
};

export function PresenceDot({ presence }: { presence: Presence }) {
  return (
    <span className="relative inline-flex h-2 w-2">
      {presence === "Available" && (
        <span className="absolute inset-0 animate-ping rounded-full bg-ok opacity-60" />
      )}
      <span className={cn("relative h-2 w-2 rounded-full", tone[presence])} />
    </span>
  );
}
