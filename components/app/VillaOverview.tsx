import { VillaStateTag } from "@/components/ui/Badge";
import type { Villa } from "@/lib/types";

export function VillaOverview({ data }: { data: Villa[] }) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h3 className="text-[14px] font-medium">Villa overview</h3>
        <span className="text-[12px] text-ink-3">{data.length} properties</span>
      </div>
      <div className="grid sm:grid-cols-2">
        {data.map((v, i) => (
          <div
            key={v.id}
            className="flex items-center justify-between border-b border-line px-5 py-3.5 transition-colors hover:bg-white/[0.02] sm:[&:nth-last-child(-n+1)]:border-b-0 sm:odd:border-r"
            style={{
              borderBottomWidth: i >= data.length - 2 ? undefined : undefined,
            }}
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
    </div>
  );
}
