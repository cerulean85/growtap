"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/shared/api/db/client";
import { routineTasks, routines } from "@/shared/api/db/schema";
import { requireUserId } from "@/shared/lib/session-guard";

const TITLE_MAX = 60;

export async function updateTask(input: { id: string; title: string }) {
  const userId = await requireUserId();

  const title = input.title.trim();
  if (!title) throw new Error("과업 이름을 입력해주세요.");
  if (title.length > TITLE_MAX) {
    throw new Error(`이름은 ${TITLE_MAX}자 이내로 입력해주세요.`);
  }

  const [task] = await db
    .select({ routineId: routineTasks.routineId })
    .from(routineTasks)
    .innerJoin(routines, eq(routines.id, routineTasks.routineId))
    .where(and(eq(routineTasks.id, input.id), eq(routines.userId, userId)))
    .limit(1);
  if (!task) throw new Error("과업을 찾을 수 없습니다.");

  await db
    .update(routineTasks)
    .set({ title })
    .where(eq(routineTasks.id, input.id));

  revalidatePath("/");
  revalidatePath("/routine");
}
