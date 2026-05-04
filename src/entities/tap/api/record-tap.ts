"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/shared/api/auth/auth";
import { db } from "@/shared/api/db/client";
import { goals, taps } from "@/shared/api/db/schema";

export async function recordTap(goalId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("로그인이 필요합니다.");
  }

  const owned = await db
    .select({ id: goals.id })
    .from(goals)
    .where(
      and(
        eq(goals.id, goalId),
        eq(goals.userId, userId),
        isNull(goals.archivedAt),
      ),
    )
    .limit(1);

  if (owned.length === 0) {
    throw new Error("실천 항목을 찾을 수 없습니다.");
  }

  await db.insert(taps).values({ goalId, userId });

  revalidatePath("/");
}
