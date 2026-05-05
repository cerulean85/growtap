"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { MonthlyTapEntry } from "@/entities/tap/server";
import { GOAL_COLOR_DOT } from "@/shared/lib/goal-colors";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import {
  buildCalendarCells,
  shiftMonth,
  WEEKDAY_LABELS,
} from "./calendar-utils";
import { DayDetail } from "./day-detail";

type Props = {
  year: number;
  month: number;
  todayKey: string;
  entries: MonthlyTapEntry[];
};

type DayBucket = { total: number; goals: MonthlyTapEntry[] };

function aggregateByDay(entries: MonthlyTapEntry[]): Map<string, DayBucket> {
  const byDay = new Map<string, DayBucket>();
  for (const entry of entries) {
    let bucket = byDay.get(entry.day);
    if (!bucket) {
      bucket = { total: 0, goals: [] };
      byDay.set(entry.day, bucket);
    }
    bucket.total += entry.count;
    bucket.goals.push(entry);
  }
  return byDay;
}

export function Calendar({ year, month, todayKey, entries }: Props) {
  const router = useRouter();
  const cells = useMemo(
    () => buildCalendarCells(year, month, todayKey),
    [year, month, todayKey],
  );
  const byDay = useMemo(() => aggregateByDay(entries), [entries]);

  const initialSelected = useMemo(() => {
    const todayCell = cells.find((c) => c.isToday && c.inMonth);
    if (todayCell) return todayCell.day;
    const firstWithTaps = cells.find((c) => c.inMonth && byDay.has(c.day));
    if (firstWithTaps) return firstWithTaps.day;
    return cells.find((c) => c.inMonth)?.day ?? null;
  }, [cells, byDay]);

  const [selected, setSelected] = useState<string | null>(initialSelected);

  const navigateMonth = (delta: number) => {
    const next = shiftMonth(year, month, delta);
    router.push(`/calendar?y=${next.year}&m=${next.month}`);
  };

  const selectedEntries = selected ? byDay.get(selected)?.goals ?? [] : [];

  return (
    <div className="space-y-4">
      <Card className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="이전 달"
            onClick={() => navigateMonth(-1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <h2 className="text-base font-semibold tracking-tight">
            {year}년 {month}월
          </h2>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="다음 달"
            onClick={() => navigateMonth(1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground">
          {WEEKDAY_LABELS.map((label, i) => (
            <div
              key={label}
              className={cn(
                "py-1",
                i === 0 && "text-rose-500/80 dark:text-rose-300/80",
              )}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell) => {
            const bucket = byDay.get(cell.day);
            const hasTaps = !!bucket && bucket.total > 0;
            const isSelected = selected === cell.day;
            const dotGoals = bucket?.goals.slice(0, 3) ?? [];
            const sundayText =
              cell.weekday === 0 && cell.inMonth
                ? "text-rose-500/90 dark:text-rose-300/90"
                : "";

            return (
              <button
                key={cell.day}
                type="button"
                onClick={() => setSelected(cell.day)}
                disabled={!cell.inMonth}
                aria-pressed={isSelected}
                aria-label={`${cell.day}${
                  hasTaps ? `, ${bucket?.total}회 기록` : ""
                }`}
                className={cn(
                  "relative flex aspect-square flex-col items-center justify-start gap-1 rounded-md p-1 text-xs transition-colors",
                  "ring-1 ring-foreground/5",
                  cell.inMonth
                    ? "bg-card hover:bg-muted/60 active:scale-[0.97]"
                    : "bg-transparent text-muted-foreground/40",
                  cell.isToday && "ring-2 ring-foreground/40",
                  isSelected && cell.inMonth && "bg-muted ring-2 ring-foreground/60",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 text-xs font-medium tabular-nums",
                    sundayText,
                  )}
                >
                  {cell.date}
                </span>
                {hasTaps ? (
                  <span className="mt-auto flex items-center gap-0.5 pb-0.5">
                    {dotGoals.map((g) => (
                      <span
                        key={g.goalId}
                        className={cn(
                          "size-1.5 rounded-full",
                          GOAL_COLOR_DOT[g.color],
                        )}
                        aria-hidden
                      />
                    ))}
                    {(bucket?.goals.length ?? 0) > 3 ? (
                      <span className="text-muted-foreground text-[9px]">
                        +
                      </span>
                    ) : null}
                  </span>
                ) : (
                  <span className="mt-auto h-1.5 pb-0.5" aria-hidden />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {selected ? (
        <DayDetail day={selected} entries={selectedEntries} />
      ) : null}
    </div>
  );
}
