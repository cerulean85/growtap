"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { archiveGoal, deleteGoal, updateGoal } from "@/entities/goal";
import { type GoalColor } from "@/shared/lib/goal-colors";
import { Button } from "@/shared/ui/button";
import { ColorPicker } from "@/shared/ui/color-picker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

const TITLE_MAX = 30;

type Mode = "idle" | "confirmArchive" | "confirmDelete";

type Props = {
  goal: { id: string; title: string; color: GoalColor };
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function GoalEditDialog({ goal, open, onOpenChange }: Props) {
  const [title, setTitle] = useState(goal.title);
  const [color, setColor] = useState<GoalColor>(goal.color);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [mode, setMode] = useState<Mode>("idle");

  const [savePending, startSave] = useTransition();
  const [archivePending, startArchive] = useTransition();
  const [deletePending, startDelete] = useTransition();

  const reset = () => {
    setTitle(goal.title);
    setColor(goal.color);
    setConfirmTitle("");
    setMode("idle");
  };

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    startSave(async () => {
      try {
        await updateGoal({ id: goal.id, title, color });
        toast.success("저장되었습니다");
        onOpenChange(false);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "저장에 실패했습니다.",
        );
      }
    });
  };

  const onArchive = () => {
    startArchive(async () => {
      try {
        await archiveGoal(goal.id);
        toast.success("실천 항목을 보관했어요");
        onOpenChange(false);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "보관에 실패했습니다.",
        );
      }
    });
  };

  const onDelete = () => {
    startDelete(async () => {
      try {
        await deleteGoal(goal.id);
        toast.success("실천 항목을 삭제했어요");
        onOpenChange(false);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "삭제에 실패했습니다.",
        );
      }
    });
  };

  const deleteEnabled =
    confirmTitle.trim() === goal.title.trim() && !deletePending;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>실천 항목 수정</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSave} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="goal-edit-title">이름</Label>
            <Input
              id="goal-edit-title"
              maxLength={TITLE_MAX}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>색상</Label>
            <ColorPicker value={color} onChange={setColor} />
          </div>

          <div className="border-border/60 space-y-3 border-t pt-4">
            {mode === "idle" ? (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setMode("confirmArchive")}
                >
                  항목 보관
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setMode("confirmDelete")}
                >
                  영구 삭제
                </Button>
              </div>
            ) : null}

            {mode === "confirmArchive" ? (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">
                  보관하면 홈에서 사라지고 통계에서도 제외됩니다. 기록은
                  유지되며 추후 복원할 수 있습니다.
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setMode("idle")}
                    disabled={archivePending}
                  >
                    취소
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={onArchive}
                    disabled={archivePending}
                  >
                    {archivePending ? "보관 중..." : "보관하기"}
                  </Button>
                </div>
              </div>
            ) : null}

            {mode === "confirmDelete" ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-destructive text-sm font-medium">
                    영구 삭제는 되돌릴 수 없습니다.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    이 항목과 모든 탭 기록이 함께 삭제됩니다. 계속하려면 항목
                    이름{" "}
                    <span className="text-foreground font-mono">
                      {goal.title}
                    </span>
                    을(를) 입력해주세요.
                  </p>
                </div>
                <Input
                  placeholder={goal.title}
                  value={confirmTitle}
                  onChange={(e) => setConfirmTitle(e.target.value)}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setConfirmTitle("");
                      setMode("idle");
                    }}
                    disabled={deletePending}
                  >
                    취소
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={onDelete}
                    disabled={!deleteEnabled}
                  >
                    {deletePending ? "삭제 중..." : "영구 삭제"}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={savePending}
            >
              취소
            </Button>
            <Button type="submit" disabled={savePending || !title.trim()}>
              {savePending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
