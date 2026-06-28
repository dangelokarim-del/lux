import { Topbar } from "@/components/app/Topbar";
import { Card, Avatar, PresenceTag } from "@/components/ui";
import { team } from "@/lib/data";

export default function TeamPage() {
  const available = team.filter((m) => m.presence === "Available").length;

  return (
    <>
      <Topbar title="Team" subtitle={`${team.length} staff · ${available} available now`} />
      <div className="p-5 sm:p-7">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {team.map((m) => (
            <Card key={m.id} hover className="p-5">
              <div className="flex items-start justify-between">
                <Avatar name={m.name} size={48} />
                <PresenceTag presence={m.presence} />
              </div>
              <div className="mt-4 text-[15px] font-medium">{m.name}</div>
              <div className="text-[13px] text-ink-3">{m.role}</div>

              <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                <span className="text-[12px] text-ink-3">{m.department}</span>
                <span className="text-[12px] text-ink-2">
                  <span className="font-medium text-ink">{m.load}</span> open tasks
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
