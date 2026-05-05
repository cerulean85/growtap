"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/shared/api/db/client";
import { routines } from "@/shared/api/db/schema";
import { requireUserId } from "@/shared/lib/session-guard";

const TITLE_MAX = 30;

export async function createRoutine(input: {
  title: string;
  activate?: boolean;
}): Promise<{ id: string }> {
  const userId = await requireUserId();

  const title = input.title.trim();
  if (!title) throw new Error("루틴 이름을 입력해주세요.");
  if (title.length > TITLE_MAX) {
    throw new Error(`이름은 ${TITLE_MAX}자 이내로 입력해주세요.`);
  }

  const shouldActivate = input.activate ?? true;

  const [row] = await db
    .insert(routines)
    .values({ userId, title, isActive: shouldActivate })
    .returning({ id: routines.id });

  revalidatePath("/");
  revalidatePath("/routine");
  revalidatePath("/routine/archive");
  return { id: row.id };
}
