"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/shared/api/auth/auth";
import { db } from "@/shared/api/db/client";
import { goals } from "@/shared/api/db/schema";

export async function deleteGoal(id: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("로그인이 필요합니다.");
  }

  // Cascade FK on tap.goalId removes related tap rows automatically.
  await db
    .delete(goals)
    .where(and(eq(goals.id, id), eq(goals.userId, userId)));

  revalidatePath("/");
  revalidatePath("/stats");
}
