"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/shared/api/db/client";
import { routineTasks, routines } from "@/shared/api/db/schema";
import { requireUserId } from "@/shared/lib/session-guard";

export async function deleteTask(id: string) {
  const userId = await requireUserId();

  const [task] = await db
    .select({ id: routineTasks.id })
    .from(routineTasks)
    .innerJoin(routines, eq(routines.id, routineTasks.routineId))
    .where(and(eq(routineTasks.id, id), eq(routines.userId, userId)))
    .limit(1);
  if (!task) throw new Error("과업을 찾을 수 없습니다.");

  // Soft-delete to preserve historical completion data for stats.
  await db
    .update(routineTasks)
    .set({ archivedAt: new Date() })
    .where(eq(routineTasks.id, id));

  revalidatePath("/");
  revalidatePath("/routine");
}
