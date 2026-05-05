"use client";

import { Check, X } from "lucide-react";
import type { MonthlyRoutineEntry } from "@/entities/routine/server";
import type { MonthlyTapEntry } from "@/entities/tap/server";
import { GOAL_COLOR_DOT } from "@/shared/lib/goal-colors";
import { cn } from "@/shared/lib/utils";
import { Card } from "@/shared/ui/card";
import { formatDayLabel } from "./calendar-utils";

type Props = {
  day: string;
  entries: MonthlyTapEntry[];
  routineEntries: MonthlyRoutineEntry[];
};

export function DayDetail({ day, entries, routineEntries }: Props) {
  const total = entries.reduce((sum, e) => sum + e.count, 0);
  const routineSuccessCount = routineEntries.filter((e) => e.success).length;

  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold tracking-tight">
          {formatDayLabel(day)}
        </h3>
        <div className="text-muted-foreground flex flex-col items-end gap-0.5 text-xs sm:flex-row sm:items-center sm:gap-2">
          <span>
            실천{" "}
            <span className="text-foreground font-semibold tabular-nums">
              {total}
            </span>{" "}
            회
          </span>
          {routineEntries.length > 0 ? (
            <span>
              루틴{" "}
              <span className="text-foreground font-semibold tabular-nums">
                {routineSuccessCount}/{routineEntries.length}
              </span>{" "}
              성공
            </span>
          ) : null}
        </div>
      </div>

      {entries.length === 0 && routineEntries.length === 0 ? (
        <p className="text-muted-foreground text-xs">
          이 날에는 기록이 없어요.
        </p>
      ) : (
        <div className="space-y-4">
          {entries.length > 0 ? (
            <section className="space-y-2">
              <h4 className="text-muted-foreground text-xs font-medium">
                실천 항목
              </h4>
              <ul className="space-y-2">
                {entries.map((entry) => (
                  <li
                    key={entry.goalId}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={cn(
                          "size-2.5 shrink-0 rounded-full",
                          GOAL_COLOR_DOT[entry.color],
                        )}
                        aria-hidden
                      />
                      <span className="truncate text-sm">{entry.title}</span>
                    </div>
                    <span className="text-foreground text-sm font-semibold tabular-nums">
                      {entry.count}회
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {routineEntries.length > 0 ? (
            <section className="space-y-2">
              <h4 className="text-muted-foreground text-xs font-medium">
                루틴
              </h4>
              <ul className="space-y-2">
                {routineEntries.map((entry) => (
                  <li
                    key={entry.routineId}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-full",
                          entry.success
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-300",
                        )}
                        aria-hidden
                      >
                        {entry.success ? (
                          <Check className="size-3.5" />
                        ) : (
                          <X className="size-3.5" />
                        )}
                      </span>
                      <span className="truncate text-sm">{entry.title}</span>
                    </div>
                    <span className="text-muted-foreground text-sm font-semibold tabular-nums">
                      {entry.completedTasks}/{entry.totalTasks}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </Card>
  );
}
