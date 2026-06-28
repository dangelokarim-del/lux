import { Card, CardHeader, VillaStateTag } from "@/components/ui";
import type { Villa } from "@/lib/types";

export function VillaOverview({ data }: { data: Villa[] }) {
  return (
    <Card>
      <CardHeader title="Villa overview" meta={`${data.length} properties`} />
      <div className="grid sm:grid-cols-2">
        {data.map((v) => (
          <div
            key={v.id}
            className="flex items-center justify-between border-b border-line px-5 py-3.5 transition-colors hover:bg-white/[0.02] sm:odd:border-r"
          >
            <div>
              <div className="text-[13px] font-medium">{v.name}</div>
              <div className="text-[12px] text-ink-3">{v.area}</div>
            </div>
            <div className="text-right">
              <VillaStateTag state={v.state} />
              <div className="mt-0.5 text-[11px] text-ink-4">
                {v.guests > 0 ? `${v.guests} guests` : "—"} · {v.openTasks} tasks
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
