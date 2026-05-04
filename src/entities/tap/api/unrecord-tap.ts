"use server";

import { and, desc, eq, gte, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/shared/api/auth/auth";
import { db } from "@/shared/api/db/client";
import { taps } from "@/shared/api/db/schema";
import { getTodayRangeKST } from "@/shared/lib/today";

export async function unrecordTap(goalId: string) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("로그인이 필요합니다.");
  }

  const { start, end } = getTodayRangeKST();

  const latest = await db
    .select({ id: taps.id })
    .from(taps)
    .where(
      and(
        eq(taps.goalId, goalId),
        eq(taps.userId, userId),
        gte(taps.tappedAt, start),
        lt(taps.tappedAt, end),
      ),
    )
    .orderBy(desc(taps.tappedAt))
    .limit(1);

  if (latest.length === 0) return;

  await db.delete(taps).where(eq(taps.id, latest[0].id));

  revalidatePath("/");
}
