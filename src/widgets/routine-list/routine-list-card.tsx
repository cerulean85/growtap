"use client";

import { CheckCircle2, MoreVertical, Pencil, Power } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { RoutineEditDialog } from "@/features/routine-edit";
import {
  activateRoutine,
  deactivateRoutine,
  unarchiveRoutine,
  type RoutineDetail,
  type RoutineSummary,
} from "@/entities/routine";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

type Variant = "active-space" | "archive";

export function RoutineListCard({
  routine,
  variant,
  detail,
}: {
  routine: RoutineSummary;
  variant: Variant;
  detail: RoutineDetail;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleActivate = () => {
    startTransition(async () => {
      try {
        await activateRoutine(routine.id);
        toast.success("이 루틴을 활성화했어요");
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "활성화에 실패했습니다.",
        );
      }
    });
  };

  const handleDeactivate = () => {
    startTransition(async () => {
      try {
        await deactivateRoutine(routine.id);
        toast.success("비활성화했어요");
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "비활성화에 실패했습니다.",
        );
      }
    });
  };

  const handleUnarchive = () => {
    startTransition(async () => {
      try {
        await unarchiveRoutine(routine.id);
        toast.success("아카이브에서 꺼냈어요");
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "이동에 실패했습니다.",
        );
      }
    });
  };

  return (
    <>
      <Card
        className={cn(
          "flex items-center justify-between gap-3 p-4",
          routine.isActive && "ring-emerald-500/40 ring-2",
        )}
      >
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-2">
            {routine.isActive ? (
              <CheckCircle2
                className="text-emerald-500 size-4 shrink-0"
                aria-hidden
              />
            ) : null}
            <h3 className="truncate text-sm font-semibold">{routine.title}</h3>
          </div>
          <p className="text-muted-foreground text-xs">
            과업 {routine.taskCount}개
            {routine.isActive ? " · 활성" : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {variant === "active-space" ? (
            routine.isActive ? (
              <Button
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={handleDeactivate}
              >
                <Power className="size-3.5" aria-hidden />
                해제
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                disabled={pending}
                onClick={handleActivate}
              >
                <Power className="size-3.5" aria-hidden />
                활성화
              </Button>
            )
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={handleUnarchive}
            >
              꺼내기
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setEditOpen(true)}
            aria-label="편집"
          >
            <Pencil className="size-4" aria-hidden />
          </Button>
        </div>
      </Card>
      <RoutineEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        routine={detail}
      />
    </>
  );
}

export { MoreVertical };
