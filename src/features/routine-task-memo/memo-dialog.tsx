"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { setTaskMemo } from "@/entities/routine";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";

const MEMO_MAX = 500;

export function TaskMemoDialog({
  open,
  onOpenChange,
  taskId,
  taskTitle,
  initialMemo,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  taskTitle: string;
  initialMemo: string | null;
}) {
  const router = useRouter();
  const [memo, setMemo] = useState(initialMemo ?? "");
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await setTaskMemo({ taskId, memo });
        toast.success("메모를 저장했어요");
        onOpenChange(false);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "저장에 실패했습니다.",
        );
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>특이사항 메모</DialogTitle>
          <DialogDescription>{taskTitle}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="memo-input">오늘의 메모</Label>
            <textarea
              id="memo-input"
              className="border-input bg-transparent placeholder:text-muted-foreground focus-visible:ring-ring/40 flex min-h-24 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2"
              maxLength={MEMO_MAX}
              placeholder="성공/실패 요인을 짧게 남겨보세요."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              autoFocus
            />
            <p className="text-muted-foreground text-xs">
              {memo.length} / {MEMO_MAX}
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              취소
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
