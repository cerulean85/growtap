"use client";

import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createGoal } from "@/entities/goal";
import {
  DEFAULT_GOAL_COLOR,
  type GoalColor,
} from "@/shared/lib/goal-colors";
import { Button } from "@/shared/ui/button";
import { ColorPicker } from "@/shared/ui/color-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

const TITLE_MAX = 30;

export function GoalCreateDialog({
  trigger,
}: {
  trigger?: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [color, setColor] = useState<GoalColor>(DEFAULT_GOAL_COLOR);
  const [pending, startTransition] = useTransition();

  const reset = () => {
    setTitle("");
    setColor(DEFAULT_GOAL_COLOR);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createGoal({ title, color });
        toast.success("실천 항목이 추가됐어요");
        setOpen(false);
        reset();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "추가에 실패했습니다.",
        );
      }
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger
        render={
          trigger ?? (
            <Button size="sm" className="gap-1">
              <Plus className="size-4" />새 항목
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>새 실천 항목</DialogTitle>
          <DialogDescription>
            매일 탭으로 기록할 작은 실천을 만들어보세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="goal-title">이름</Label>
            <Input
              id="goal-title"
              placeholder="예: 물 한 컵 마시기"
              maxLength={TITLE_MAX}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
            <p className="text-muted-foreground text-xs">
              {title.length} / {TITLE_MAX}
            </p>
          </div>

          <div className="space-y-2">
            <Label>색상</Label>
            <ColorPicker value={color} onChange={setColor} />
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              취소
            </Button>
            <Button type="submit" disabled={pending || !title.trim()}>
              {pending ? "추가 중..." : "추가하기"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
