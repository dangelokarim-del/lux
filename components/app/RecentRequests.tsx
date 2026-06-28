import { MessageCircle, Mail, Phone, Smartphone } from "lucide-react";
import { Card, CardHeader, Row } from "@/components/ui";
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
    <Card>
      <CardHeader title="Recent guest requests" meta="Live" />
      <div>
        {data.map((r) => {
          const Icon = channelIcon[r.channel];
          return (
            <Row key={r.id} className="flex gap-3.5">
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
                  <button className="focus-ring mt-2 rounded text-[12px] font-medium text-accent transition-opacity hover:opacity-80">
                    Create task →
                  </button>
                )}
              </div>
            </Row>
          );
        })}
      </div>
    </Card>
  );
}
