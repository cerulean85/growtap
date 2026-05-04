"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { recordTap, unrecordTap } from "@/entities/tap";

export function useGoalTap(goalId: string, initialCount: number) {
  const [optimisticCount, addOptimistic] = useOptimistic(
    initialCount,
    (curr, delta: number) => Math.max(0, curr + delta),
  );
  const [pending, startTransition] = useTransition();

  const tap = () => {
    startTransition(async () => {
      addOptimistic(1);
      try {
        await recordTap(goalId);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "기록에 실패했습니다.",
        );
      }
    });
  };

  const untap = () => {
    if (optimisticCount <= 0) return;
    startTransition(async () => {
      addOptimistic(-1);
      try {
        await unrecordTap(goalId);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "취소에 실패했습니다.",
        );
      }
    });
  };

  return { count: optimisticCount, pending, tap, untap };
}
