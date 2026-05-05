import { Archive, ListChecks, Sparkles } from "lucide-react";
import Link from "next/link";
import { auth } from "@/shared/api/auth/auth";
import {
  getActiveRoutineProgresses,
  getRoutineDetail,
  listActiveSpaceRoutines,
} from "@/entities/routine/server";
import { RoutineCreateDialog } from "@/features/routine-create";
import { RoutineEditButton } from "@/features/routine-edit";
import type { RoutineDetail } from "@/entities/routine";
import { Button } from "@/shared/ui/button";
import { RoutineChecklist } from "@/widgets/routine-checklist";
import { RoutineListCard } from "@/widgets/routine-list";

export async function RoutineSection() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [progresses, routines] = await Promise.all([
    getActiveRoutineProgresses(),
    listActiveSpaceRoutines(),
  ]);

  if (progresses.length === 0 && routines.length === 0) {
    return <NoActiveRoutine hasAnyRoutine={false} />;
  }

  const detailById = new Map(
    await Promise.all(
      routines.map(async (r) => {
        const d = await getRoutineDetail(r.id);
        return [r.id, d] as const;
      }),
    ),
  );

  const inactiveRoutines = routines.filter((r) => !r.isActive);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-medium tracking-tight">
          <ListChecks className="size-4" aria-hidden />
          루틴
        </h2>
        <div className="flex gap-2">
          <RoutineCreateDialog />
          <Link href="/routine/archive">
            <Button variant="outline" size="sm" className="gap-1">
              <Archive className="size-4" aria-hidden />
              아카이브
            </Button>
          </Link>
        </div>
      </div>

      {progresses.length > 0 ? (
        <ul className="space-y-5">
          {progresses.map((p) => (
            <li key={p.routine.id}>
              {p.tasks.length > 0 ? (
                <RoutineChecklist
                  routineTitle={p.routine.title}
                  initialTasks={p.tasks}
                  initialAllCleared={p.allCleared}
                  initialStreak={p.streak}
                  routineDetail={detailById.get(p.routine.id)}
                />
              ) : (
                <EmptyTasks
                  routineTitle={p.routine.title}
                  routineDetail={detailById.get(p.routine.id)}
                />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <NoActiveRoutine hasAnyRoutine={routines.length > 0} />
      )}

      {inactiveRoutines.length > 0 ? (
        <section className="space-y-3">
          <h3 className="text-muted-foreground text-sm font-semibold">
            비활성 루틴
          </h3>
          <ul className="space-y-2">
            {inactiveRoutines.map((r) => {
              const detail = detailById.get(r.id);
              if (!detail) return null;
              return (
                <li key={r.id}>
                  <RoutineListCard
                    routine={r}
                    variant="active-space"
                    detail={detail}
                  />
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </section>
  );
}

function NoActiveRoutine({ hasAnyRoutine }: { hasAnyRoutine: boolean }) {
  return (
    <div className="border-border/60 bg-card flex flex-col items-center gap-4 rounded-xl border border-dashed px-6 py-12 text-center">
      <div className="bg-muted text-foreground flex size-12 items-center justify-center rounded-full">
        <Sparkles className="size-5" />
      </div>
      <div className="space-y-1">
        <h2 className="text-base font-semibold">
          {hasAnyRoutine
            ? "활성화된 루틴이 없어요"
            : "첫 루틴을 만들어보세요"}
        </h2>
        <p className="text-muted-foreground text-sm">
          {hasAnyRoutine
            ? "아래 목록에서 루틴을 활성화하면 오늘의 체크리스트가 나타납니다."
            : "매일 반복할 작은 과업들을 묶어 루틴을 만들어보세요."}
        </p>
      </div>
      <RoutineCreateDialog />
    </div>
  );
}

function EmptyTasks({
  routineTitle,
  routineDetail,
}: {
  routineTitle: string;
  routineDetail?: RoutineDetail | null;
}) {
  return (
    <div className="border-border/60 bg-card flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-8 text-center">
      <div className="space-y-2">
        <p className="text-sm font-medium">{routineTitle}</p>
        <p className="text-muted-foreground text-xs">
          과업이 없어요. 편집에서 과업을 추가해주세요.
        </p>
      </div>
      {routineDetail ? (
        <RoutineEditButton routine={routineDetail} />
      ) : null}
    </div>
  );
}
