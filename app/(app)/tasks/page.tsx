import { Topbar } from "@/components/app/Topbar";
import { TasksView } from "@/components/app/TasksView";
import { tasks } from "@/lib/data";

export default function TasksPage() {
  return (
    <>
      <Topbar title="Tasks" subtitle={`${tasks.length} tasks across the portfolio`} />
      <div className="p-5 sm:p-7">
        <TasksView data={tasks} />
      </div>
    </>
  );
}
