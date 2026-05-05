"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/shared/api/db/client";
import { routineTasks, routines } from "@/shared/api/db/schema";
import { requireUserId } from "@/shared/lib/session-guard";

export async function reorderTasks(input: {
  routineId: string;
  orderedTaskIds: string[];
}) {
  const userId = await requireUserId();

  const [owned] = await db
    .select({ id: routines.id })
    .from(routines)
    .where(and(eq(routines.id, input.routineId), eq(routines.userId, userId)))
    .limit(1);
  if (!owned) throw new Error("루틴을 찾을 수 없습니다.");

  await Promise.all(
    input.orderedTaskIds.map((taskId, index) =>
      db
        .update(routineTasks)
        .set({ position: index })
        .where(
          and(
            eq(routineTasks.id, taskId),
            eq(routineTasks.routineId, input.routineId),
          ),
        ),
    ),
  );

  revalidatePath("/");
  revalidatePath("/routine");
}
