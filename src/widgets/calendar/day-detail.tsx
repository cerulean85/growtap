"use client";

import type { MonthlyTapEntry } from "@/entities/tap/server";
import { GOAL_COLOR_DOT } from "@/shared/lib/goal-colors";
import { cn } from "@/shared/lib/utils";
import { Card } from "@/shared/ui/card";
import { formatDayLabel } from "./calendar-utils";

type Props = {
  day: string;
  entries: MonthlyTapEntry[];
};

export function DayDetail({ day, entries }: Props) {
  const total = entries.reduce((sum, e) => sum + e.count, 0);

  return (
    <Card className="space-y-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold tracking-tight">
          {formatDayLabel(day)}
        </h3>
        <span className="text-muted-foreground text-xs">
          총{" "}
          <span className="text-foreground font-semibold tabular-nums">
            {total}
          </span>{" "}
          회
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="text-muted-foreground text-xs">
          이 날에는 기록이 없어요.
        </p>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li
              key={entry.goalId}
              className="flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
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
      )}
    </Card>
  );
}
