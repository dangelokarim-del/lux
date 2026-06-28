import { Topbar } from "@/components/app/Topbar";
import { RecentRequests } from "@/components/app/RecentRequests";
import { Card } from "@/components/ui";
import { requests } from "@/lib/data";

export default function RequestsPage() {
  const open = requests.filter((r) => !r.resolved).length;

  return (
    <>
      <Topbar title="Guest Requests" subtitle={`${open} open · ${requests.length} today`} />
      <div className="p-5 sm:p-7">
        <div className="mx-auto max-w-2xl">
          {/* incoming banner — shows the AI capture promise */}
          <Card className="mb-6 flex items-center gap-4 p-5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[rgba(46,125,255,0.3)] bg-accent-soft">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
            </div>
            <div>
              <div className="text-[14px] font-medium">Listening across all channels</div>
              <div className="text-[13px] text-ink-3">
                WhatsApp, email and calls are captured and structured automatically.
              </div>
            </div>
          </Card>

          <RecentRequests data={requests} />
        </div>
      </div>
    </>
  );
}
