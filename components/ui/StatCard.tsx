import { cn } from "@/lib/utils";
import { Card } from "./Card";

type StatTone = "default" | "urgent" | "ok" | "accent";

const valueTone: Record<StatTone, string> = {
  default: "text-ink",
  urgent: "text-urgent",
  ok: "text-ok",
  accent: "text-ink",
};

const deltaTone: Record<StatTone, string> = {
  default: "text-ink-3",
  urgent: "text-urgent",
  ok: "text-ok",
  accent: "text-accent",
};

export function StatCard({
  label,
  value,
  delta,
  tone = "default",
}: {
  label: string;
  value: number | string;
  delta?: string;
  tone?: StatTone;
}) {
  return (
    <Card hover className="relative p-5">
      {tone === "accent" && (
        <div className="glow-accent pointer-events-none absolute -right-6 -top-8 h-24 w-24 opacity-70 blur-xl" />
      )}
      <div className="text-[12px] uppercase tracking-wider text-ink-3">{label}</div>
      <div className={cn("mt-3 text-4xl font-semibold tracking-tight tabular-nums", valueTone[tone])}>
        {value}
      </div>
      {delta && <div className={cn("mt-2 text-[12px]", deltaTone[tone])}>{delta}</div>}
    </Card>
  );
}
