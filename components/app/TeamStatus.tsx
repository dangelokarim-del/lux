import { Card, CardHeader, Row, Avatar, PresenceDot } from "@/components/ui";
import type { Member } from "@/lib/types";

export function TeamStatus({ data }: { data: Member[] }) {
  const available = data.filter((m) => m.presence === "Available").length;
  return (
    <Card>
      <CardHeader title="Team status" meta={`${available} available`} />
      <div>
        {data.map((m) => (
          <Row key={m.id} className="flex items-center gap-3 py-3">
            <Avatar name={m.name} size={32} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium">{m.name}</div>
              <div className="truncate text-[12px] text-ink-3">{m.role}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-ink-3">{m.load} open</span>
              <PresenceDot presence={m.presence} />
            </div>
          </Row>
        ))}
      </div>
    </Card>
  );
}
