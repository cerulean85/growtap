"use client";

import { Minus, MoreVertical } from "lucide-react";
import { useState } from "react";
import { GoalEditDialog } from "@/features/goal-edit";
import { useGoalTap } from "@/features/goal-tap";
import type { GoalWithCount } from "@/entities/goal";
import { GOAL_COLOR_DOT, GOAL_COLOR_RING } from "@/shared/lib/goal-colors";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

export function GoalCard({ goal }: { goal: GoalWithCount }) {
  const { count, tap, untap } = useGoalTap(goal.id, goal.todayCount);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <Card
        className={cn(
          "group relative cursor-pointer p-0 transition-all select-none",
          "hover:ring-2 active:scale-[0.98]",
          GOAL_COLOR_RING[goal.color],
        )}
        onClick={tap}
        role="button"
        aria-label={`${goal.title} 탭하여 기록`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            tap();
          }
        }}
      >
        <div className="flex items-start justify-between gap-2 px-4 pt-3">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={cn(
                "size-2.5 shrink-0 rounded-full",
                GOAL_COLOR_DOT[goal.color],
              )}
              aria-hidden
            />
            <span className="truncate text-sm font-medium">{goal.title}</span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="메뉴"
            onClick={(e) => {
              e.stopPropagation();
              setEditOpen(true);
            }}
          >
            <MoreVertical className="size-4" />
          </Button>
        </div>

        <div className="flex items-end justify-between gap-2 px-4 pb-4 pt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-semibold tabular-nums tracking-tight">
              {count}
            </span>
            <span className="text-muted-foreground text-xs">회 / 오늘</span>
          </div>
          {count > 0 ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="기록 1회 취소"
              onClick={(e) => {
                e.stopPropagation();
                untap();
              }}
            >
              <Minus className="size-4" />
            </Button>
          ) : null}
        </div>
      </Card>

      <GoalEditDialog
        goal={{ id: goal.id, title: goal.title, color: goal.color }}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
