import { Avatar } from "@/components/ui/Avatar";
import { PresenceDot } from "@/components/ui/StatusDot";
import type { Member } from "@/lib/types";

export function TeamStatus({ data }: { data: Member[] }) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h3 className="text-[14px] font-medium">Team status</h3>
        <span className="text-[12px] text-ink-3">
          {data.filter((m) => m.presence === "Available").length} available
        </span>
      </div>
      <div>
        {data.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-3 border-b border-line px-5 py-3 transition-colors last:border-0 hover:bg-white/[0.02]"
          >
            <Avatar name={m.name} size={32} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium">{m.name}</div>
              <div className="truncate text-[12px] text-ink-3">{m.role}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-ink-3">{m.load} open</span>
              <PresenceDot presence={m.presence} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
