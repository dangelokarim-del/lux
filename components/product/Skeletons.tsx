import { Card, Skeleton } from "@/components/ui";

/** Mirrors the KPI card grid so the layout doesn't shift when data lands. */
export function KpiSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="p-5">
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="mt-4 h-8 w-12" />
        </Card>
      ))}
    </div>
  );
}

/** A single placeholder row matching TaskRow's metrics. */
function TaskRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line px-3.5 py-3">
      <Skeleton className="h-2.5 w-2.5 rounded-full" />
      <div className="min-w-0 flex-1">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="mt-2 h-2.5 w-1/3" />
      </div>
      <Skeleton className="hidden h-5 w-20 rounded-full sm:block" />
      <Skeleton className="h-[26px] w-[26px] rounded-full" />
    </div>
  );
}

export function TaskListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex gap-1.5 border-b border-line px-3 py-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-16 rounded-lg" />
        ))}
      </div>
      <div className="space-y-1.5 p-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ opacity: 1 - i * 0.12 }}>
            <TaskRowSkeleton />
          </div>
        ))}
      </div>
    </Card>
  );
}
