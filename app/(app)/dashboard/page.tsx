import { Topbar } from "@/components/app/Topbar";
import { StatCard } from "@/components/app/StatCard";
import { TaskTable } from "@/components/app/TaskTable";
import { RecentRequests } from "@/components/app/RecentRequests";
import { TeamStatus } from "@/components/app/TeamStatus";
import { VillaOverview } from "@/components/app/VillaOverview";
import { stats, tasks, requests, team, villas } from "@/lib/data";

export default function DashboardPage() {
  return (
    <>
      <Topbar title="Operations" subtitle="Tuesday · Marbella portfolio" />

      <div className="space-y-6 p-5 sm:p-7">
        {/* stats */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* main grid */}
        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div className="space-y-6">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[15px] font-medium">Active tasks</h2>
                <a href="/tasks" className="text-[13px] text-accent hover:opacity-80">
                  View all →
                </a>
              </div>
              <TaskTable data={tasks.slice(0, 5)} />
            </div>

            <VillaOverview data={villas} />
          </div>

          <div className="space-y-6">
            <RecentRequests data={requests} />
            <TeamStatus data={team} />
          </div>
        </div>
      </div>
    </>
  );
}
