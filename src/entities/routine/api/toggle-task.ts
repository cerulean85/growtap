"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/shared/api/db/client";
import {
  routineTaskCompletions,
  routineTasks,
  routines,
} from "@/shared/api/db/schema";
import { requireUserId } from "@/shared/lib/session-guard";
import {
  formatKstDayKey,
  getTodayKstParts,
} from "@/shared/lib/today";

export async function toggleTask(input: { taskId: string; completed: boolean }) {
  const userId = await requireUserId();

  const [task] = await db
    .select({
      id: routineTasks.id,
      routineId: routineTasks.routineId,
    })
    .from(routineTasks)
    .innerJoin(routines, eq(routines.id, routineTasks.routineId))
    .where(and(eq(routineTasks.id, input.taskId), eq(routines.userId, userId)))
    .limit(1);
  if (!task) throw new Error("과업을 찾을 수 없습니다.");

  const { year, month, day } = getTodayKstParts();
  const dayKey = formatKstDayKey(year, month, day);

  if (input.completed) {
    const [existing] = await db
      .select({ id: routineTaskCompletions.id })
      .from(routineTaskCompletions)
      .where(
        and(
          eq(routineTaskCompletions.taskId, input.taskId),
          eq(routineTaskCompletions.dayKey, dayKey),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .update(routineTaskCompletions)
        .set({ completed: true, completedAt: new Date() })
        .where(eq(routineTaskCompletions.id, existing.id));
    } else {
      await db.insert(routineTaskCompletions).values({
        userId,
        routineId: task.routineId,
        taskId: input.taskId,
        dayKey,
        completed: true,
      });
    }
  } else {
    await db
      .delete(routineTaskCompletions)
      .where(
        and(
          eq(routineTaskCompletions.taskId, input.taskId),
          eq(routineTaskCompletions.dayKey, dayKey),
        ),
      );
  }

  revalidatePath("/");
  revalidatePath("/routine");
}

export async function setTaskMemo(input: { taskId: string; memo: string }) {
  const userId = await requireUserId();

  const [task] = await db
    .select({
      id: routineTasks.id,
      routineId: routineTasks.routineId,
    })
    .from(routineTasks)
    .innerJoin(routines, eq(routines.id, routineTasks.routineId))
    .where(and(eq(routineTasks.id, input.taskId), eq(routines.userId, userId)))
    .limit(1);
  if (!task) throw new Error("과업을 찾을 수 없습니다.");

  const memo = input.memo.trim();
  const memoValue = memo.length === 0 ? null : memo.slice(0, 500);

  const { year, month, day } = getTodayKstParts();
  const dayKey = formatKstDayKey(year, month, day);

  const [existing] = await db
    .select({ id: routineTaskCompletions.id })
    .from(routineTaskCompletions)
    .where(
      and(
        eq(routineTaskCompletions.taskId, input.taskId),
        eq(routineTaskCompletions.dayKey, dayKey),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(routineTaskCompletions)
      .set({ memo: memoValue })
      .where(eq(routineTaskCompletions.id, existing.id));
  } else {
    await db.insert(routineTaskCompletions).values({
      userId,
      routineId: task.routineId,
      taskId: input.taskId,
      dayKey,
      completed: false,
      memo: memoValue,
    });
  }

  revalidatePath("/");
  revalidatePath("/routine");
}
