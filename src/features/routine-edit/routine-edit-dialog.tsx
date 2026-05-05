"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  addTask,
  archiveRoutine,
  deleteRoutine,
  deleteTask,
  reorderTasks,
  updateRoutine,
  updateTask,
  type RoutineDetail,
} from "@/entities/routine";
import { Button } from "@/shared/ui/button";
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
const TASK_MAX = 60;

type TaskItem = { id: string; title: string };

function SortableRow({
  item,
  onTitleChange,
  onDelete,
}: {
  item: TaskItem;
  onTitleChange: (title: string) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-md border bg-background p-2"
    >
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground touch-none cursor-grab active:cursor-grabbing"
        aria-label="드래그하여 순서 변경"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <Input
        value={item.title}
        maxLength={TASK_MAX}
        onChange={(e) => onTitleChange(e.target.value)}
        className="border-0 shadow-none focus-visible:ring-1"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onDelete}
        aria-label="과업 삭제"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

export function RoutineEditDialog({
  open,
  onOpenChange,
  routine,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routine: RoutineDetail;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(routine.title);
  const [tasks, setTasks] = useState<TaskItem[]>(
    routine.tasks.map((t) => ({ id: t.id, title: t.title })),
  );
  const [newTask, setNewTask] = useState("");
  const [pending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    setTasks(arrayMove(tasks, oldIndex, newIndex));
  };

  const handleAddTask = () => {
    const trimmed = newTask.trim();
    if (!trimmed) return;
    startTransition(async () => {
      try {
        const { id } = await addTask({
          routineId: routine.id,
          title: trimmed,
        });
        setTasks([...tasks, { id, title: trimmed }]);
        setNewTask("");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "추가에 실패했습니다.",
        );
      }
    });
  };

  const handleDeleteTask = (id: string) => {
    startTransition(async () => {
      try {
        await deleteTask(id);
        setTasks(tasks.filter((t) => t.id !== id));
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "삭제에 실패했습니다.",
        );
      }
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("루틴 이름을 입력해주세요.");
      return;
    }
    startTransition(async () => {
      try {
        await updateRoutine({ id: routine.id, title: title.trim() });
        const trimmedNewTask = newTask.trim();
        let nextTasks = tasks;
        if (trimmedNewTask) {
          const { id } = await addTask({
            routineId: routine.id,
            title: trimmedNewTask,
          });
          nextTasks = [...tasks, { id, title: trimmedNewTask }];
          setTasks(nextTasks);
          setNewTask("");
        }
        const titleChanged = new Map(
          nextTasks
            .filter((t) => {
              const orig = routine.tasks.find((o) => o.id === t.id);
              return orig && orig.title !== t.title.trim();
            })
            .map((t) => [t.id, t.title.trim()]),
        );
        for (const [taskId, newTitle] of titleChanged) {
          if (!newTitle) continue;
          await updateTask({ id: taskId, title: newTitle });
        }
        const orderChanged =
          nextTasks.length !== routine.tasks.length ||
          nextTasks.some((t, i) => routine.tasks[i]?.id !== t.id);
        if (orderChanged) {
          await reorderTasks({
            routineId: routine.id,
            orderedTaskIds: nextTasks.map((t) => t.id),
          });
        }
        toast.success("저장됐어요");
        onOpenChange(false);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "저장에 실패했습니다.",
        );
      }
    });
  };

  const handleArchive = () => {
    if (!confirm("이 루틴을 아카이브로 옮기시겠어요?")) return;
    startTransition(async () => {
      try {
        await archiveRoutine(routine.id);
        toast.success("아카이브로 옮겼어요");
        onOpenChange(false);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "이동에 실패했습니다.",
        );
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("이 루틴과 모든 기록을 영구 삭제할까요?")) return;
    startTransition(async () => {
      try {
        await deleteRoutine(routine.id);
        toast.success("삭제했어요");
        onOpenChange(false);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "삭제에 실패했습니다.",
        );
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>루틴 편집</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="edit-title">루틴 이름</Label>
            <Input
              id="edit-title"
              value={title}
              maxLength={TITLE_MAX}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>과업 (드래그로 순서 변경)</Label>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={tasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {tasks.map((t) => (
                    <SortableRow
                      key={t.id}
                      item={t}
                      onTitleChange={(title) =>
                        setTasks(
                          tasks.map((x) =>
                            x.id === t.id ? { ...x, title } : x,
                          ),
                        )
                      }
                      onDelete={() => handleDeleteTask(t.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            <div className="flex gap-2 pt-1">
              <Input
                placeholder="새 과업"
                value={newTask}
                maxLength={TASK_MAX}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTask();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddTask}
                disabled={!newTask.trim()}
                aria-label="과업 추가"
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 border-t pt-4 text-xs">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleArchive}
              disabled={pending}
            >
              아카이브로 이동
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={pending}
            >
              영구 삭제
            </Button>
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
