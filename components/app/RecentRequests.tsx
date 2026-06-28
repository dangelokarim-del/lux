import { MessageCircle, Mail, Phone, Smartphone } from "lucide-react";
import type { GuestRequest } from "@/lib/types";
import { cn } from "@/lib/utils";

const channelIcon = {
  WhatsApp: MessageCircle,
  Email: Mail,
  Call: Phone,
  "In-App": Smartphone,
};

export function RecentRequests({ data }: { data: GuestRequest[] }) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h3 className="text-[14px] font-medium">Recent guest requests</h3>
        <span className="text-[12px] text-ink-3">Live</span>
      </div>
      <div>
        {data.map((r) => {
          const Icon = channelIcon[r.channel];
          return (
            <div
              key={r.id}
              className="flex gap-3.5 border-b border-line px-5 py-4 transition-colors last:border-0 hover:bg-white/[0.02]"
            >
              <div
                className={cn(
                  "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border",
                  r.resolved
                    ? "border-line text-ink-4"
                    : "border-[rgba(46,125,255,0.3)] bg-accent-soft text-accent"
                )}
              >
                <Icon size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-medium">{r.guest}</span>
                  <span className="shrink-0 text-[11px] text-ink-4">{r.receivedAgo}</span>
                </div>
                <div className="text-[12px] text-ink-3">
                  {r.villa} · {r.channel}
                </div>
                <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-ink-2">
                  &ldquo;{r.message}&rdquo;
                </p>
                {!r.resolved && (
                  <button className="mt-2 text-[12px] font-medium text-accent transition-opacity hover:opacity-80">
                    Create task →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
