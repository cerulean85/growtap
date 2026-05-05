"use client";

import { Check, FileText, PartyPopper, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { RoutineEditDialog } from "@/features/routine-edit";
import { TaskMemoDialog } from "@/features/routine-task-memo";
import {
  toggleTask,
  type RoutineDetail,
  type TodayTaskState,
} from "@/entities/routine";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { ConfettiBurst } from "@/widgets/confetti";
import { StreakBadge } from "@/widgets/routine-streak";

export function RoutineChecklist({
  routineTitle,
  initialTasks,
  initialAllCleared,
  initialStreak,
  routineDetail,
}: {
  routineTitle: string;
  initialTasks: TodayTaskState[];
  initialAllCleared: boolean;
  initialStreak: number;
  routineDetail?: RoutineDetail | null;
}) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [allCleared, setAllCleared] = useState(initialAllCleared);
  const [memoTask, setMemoTask] = useState<TodayTaskState | null>(null);
  const [pending, startTransition] = useTransition();
  const [confettiTick, setConfettiTick] = useState(0);
  const [syncedTasks, setSyncedTasks] = useState(initialTasks);
  const [syncedAllCleared, setSyncedAllCleared] = useState(initialAllCleared);
  const [editOpen, setEditOpen] = useState(false);

  if (syncedTasks !== initialTasks || syncedAllCleared !== initialAllCleared) {
    setSyncedTasks(initialTasks);
    setSyncedAllCleared(initialAllCleared);
    setTasks(initialTasks);
    setAllCleared(initialAllCleared);
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const progress = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  const handleToggle = (task: TodayTaskState) => {
    const next = !task.completed;
    const optimistic = tasks.map((t) =>
      t.id === task.id ? { ...t, completed: next } : t,
    );
    setTasks(optimistic);
    const optimisticAll =
      optimistic.length > 0 && optimistic.every((t) => t.completed);
    const wasCleared = tasks.length > 0 && tasks.every((t) => t.completed);
    if (optimisticAll && !wasCleared) {
      setConfettiTick((n) => n + 1);
    }
    setAllCleared(optimisticAll);

    startTransition(async () => {
      try {
        await toggleTask({ taskId: task.id, completed: next });
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "기록에 실패했습니다.",
        );
        setTasks(tasks);
        setAllCleared(initialAllCleared);
      }
    });
  };

  return (
    <div className="space-y-3">
      <ConfettiBurst tick={confettiTick} />

      <Card className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <p className="text-muted-foreground text-xs">오늘의 루틴</p>
            <h2 className="truncate text-lg font-semibold">{routineTitle}</h2>
            <StreakBadge streak={initialStreak} />
          </div>
          <div className="flex shrink-0 items-start gap-2">
            <div className="text-right">
              <p className="text-2xl font-semibold tabular-nums">{progress}%</p>
              <p className="text-muted-foreground text-xs">
                {completedCount} / {total}
              </p>
            </div>
            {routineDetail ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setEditOpen(true)}
                aria-label={`${routineTitle} 편집`}
              >
                <Pencil className="size-4" aria-hidden />
              </Button>
            ) : null}
          </div>
        </div>
        <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
          <div
            className={cn(
              "h-full transition-all",
              allCleared ? "bg-emerald-500" : "bg-foreground/70",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
        {allCleared ? (
          <div className="text-emerald-600 dark:text-emerald-400 flex items-center gap-2 text-sm font-medium">
            <PartyPopper className="size-4" aria-hidden />
            오늘 루틴 완성! 멋져요.
          </div>
        ) : null}
      </Card>

      <ul className="grid grid-cols-2 gap-2">
        {tasks.map((t) => (
          <li key={t.id}>
            <Card
              className={cn(
                "flex h-full flex-col gap-2 p-3 transition-colors",
                t.completed && "bg-emerald-500/5",
              )}
            >
              <div className="flex items-start gap-2">
                <button
                  type="button"
                  onClick={() => handleToggle(t)}
                  disabled={pending}
                  aria-label={
                    t.completed
                      ? `${t.title} 완료 취소`
                      : `${t.title} 완료로 표시`
                  }
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                    t.completed
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-border hover:border-foreground",
                  )}
                >
                  {t.completed ? <Check className="size-3.5" aria-hidden /> : null}
                </button>
                <button
                  type="button"
                  onClick={() => handleToggle(t)}
                  className={cn(
                    "min-w-0 flex-1 break-words text-left text-sm leading-snug transition-colors",
                    t.completed && "text-muted-foreground line-through",
                  )}
                >
                  {t.title}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setMemoTask(t)}
                className={cn(
                  "text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-1 self-end rounded px-2 py-0.5 text-[11px]",
                  t.memo && "text-foreground",
                )}
                aria-label="메모"
              >
                <FileText className="size-3" aria-hidden />
                {t.memo ? "메모" : "메모 +"}
              </button>
            </Card>
          </li>
        ))}
      </ul>

      {memoTask ? (
        <TaskMemoDialog
          open={!!memoTask}
          onOpenChange={(open) => {
            if (!open) setMemoTask(null);
          }}
          taskId={memoTask.id}
          taskTitle={memoTask.title}
          initialMemo={memoTask.memo}
        />
      ) : null}
      {routineDetail ? (
        <RoutineEditDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          routine={routineDetail}
        />
      ) : null}
    </div>
  );
}
