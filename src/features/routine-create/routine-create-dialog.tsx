"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { addTask, createRoutine } from "@/entities/routine";
import { Button } from "@/shared/ui/button";
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
const TASK_MAX = 60;

export function RoutineCreateDialog({
  trigger,
}: {
  trigger?: React.ReactElement;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [tasks, setTasks] = useState<string[]>([""]);
  const [activate, setActivate] = useState(true);
  const [pending, startTransition] = useTransition();

  const reset = () => {
    setTitle("");
    setTasks([""]);
    setActivate(true);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTasks = tasks.map((t) => t.trim()).filter(Boolean);
    if (!title.trim()) {
      toast.error("루틴 이름을 입력해주세요.");
      return;
    }
    if (trimmedTasks.length === 0) {
      toast.error("최소 1개의 과업을 추가해주세요.");
      return;
    }
    startTransition(async () => {
      try {
        const { id } = await createRoutine({
          title: title.trim(),
          activate,
        });
        for (const t of trimmedTasks) {
          await addTask({ routineId: id, title: t });
        }
        toast.success("루틴이 만들어졌어요");
        setOpen(false);
        reset();
        router.refresh();
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
              <Plus className="size-4" />새 루틴
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>새 루틴</DialogTitle>
          <DialogDescription>
            매일 반복할 과업들을 묶어 루틴을 만들어보세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="routine-title">루틴 이름</Label>
            <Input
              id="routine-title"
              placeholder="예: 아침 루틴"
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
            <Label>과업</Label>
            <div className="space-y-2">
              {tasks.map((task, idx) => (
                <Input
                  key={idx}
                  placeholder={`과업 ${idx + 1}`}
                  maxLength={TASK_MAX}
                  value={task}
                  onChange={(e) => {
                    const next = tasks.slice();
                    next[idx] = e.target.value;
                    setTasks(next);
                  }}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => setTasks([...tasks, ""])}
            >
              <Plus className="size-3.5" />과업 추가
            </Button>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={activate}
              onChange={(e) => setActivate(e.target.checked)}
              className="size-4 rounded border-border"
            />
            <span>이 루틴을 바로 활성화하기</span>
          </label>

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
