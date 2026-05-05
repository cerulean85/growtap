"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/shared/api/db/client";
import { routines } from "@/shared/api/db/schema";
import { requireUserId } from "@/shared/lib/session-guard";

const TITLE_MAX = 30;

export async function updateRoutine(input: { id: string; title: string }) {
  const userId = await requireUserId();

  const title = input.title.trim();
  if (!title) throw new Error("루틴 이름을 입력해주세요.");
  if (title.length > TITLE_MAX) {
    throw new Error(`이름은 ${TITLE_MAX}자 이내로 입력해주세요.`);
  }

  await db
    .update(routines)
    .set({ title })
    .where(and(eq(routines.id, input.id), eq(routines.userId, userId)));

  revalidatePath("/");
  revalidatePath("/routine");
  revalidatePath("/routine/archive");
}
