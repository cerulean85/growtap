import { listGoalsWithTodayCount } from "@/entities/goal/server";
import { GoalCreateDialog } from "@/features/goal-create";
import { GoalCard } from "./goal-card";
import { GoalListEmptyState } from "./empty-state";

export async function GoalList() {
  const goals = await listGoalsWithTodayCount();

  if (goals.length === 0) {
    return <GoalListEmptyState />;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium tracking-tight">오늘의 실천</h2>
        <div className="hidden sm:block">
          <GoalCreateDialog />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>
    </section>
  );
}
