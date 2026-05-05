"use server";

import { and, eq, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/shared/api/db/client";
import { routineTasks, routines } from "@/shared/api/db/schema";
import { requireUserId } from "@/shared/lib/session-guard";

const TITLE_MAX = 60;

export async function addTask(input: {
  routineId: string;
  title: string;
}): Promise<{ id: string }> {
  const userId = await requireUserId();

  const title = input.title.trim();
  if (!title) throw new Error("과업 이름을 입력해주세요.");
  if (title.length > TITLE_MAX) {
    throw new Error(`이름은 ${TITLE_MAX}자 이내로 입력해주세요.`);
  }

  const [owned] = await db
    .select({ id: routines.id })
    .from(routines)
    .where(and(eq(routines.id, input.routineId), eq(routines.userId, userId)))
    .limit(1);
  if (!owned) throw new Error("루틴을 찾을 수 없습니다.");

  const [maxRow] = await db
    .select({
      maxPos: sql<number>`coalesce(max(${routineTasks.position}), -1)`.mapWith(
        Number,
      ),
    })
    .from(routineTasks)
    .where(
      and(
        eq(routineTasks.routineId, input.routineId),
        isNull(routineTasks.archivedAt),
      ),
    );

  const nextPosition = (maxRow?.maxPos ?? -1) + 1;

  const [row] = await db
    .insert(routineTasks)
    .values({ routineId: input.routineId, title, position: nextPosition })
    .returning({ id: routineTasks.id });

  revalidatePath("/");
  revalidatePath("/routine");
  return { id: row.id };
}
