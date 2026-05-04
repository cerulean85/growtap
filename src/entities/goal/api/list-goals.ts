import { and, asc, eq, gte, isNull, lt, sql } from "drizzle-orm";
import { auth } from "@/shared/api/auth/auth";
import { db } from "@/shared/api/db/client";
import { goals, taps } from "@/shared/api/db/schema";
import { isGoalColor, DEFAULT_GOAL_COLOR } from "@/shared/lib/goal-colors";
import { getTodayRangeKST } from "@/shared/lib/today";
import type { GoalWithCount } from "../model/types";

export async function listGoalsWithTodayCount(): Promise<GoalWithCount[]> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];

  const { start, end } = getTodayRangeKST();

  const rows = await db
    .select({
      id: goals.id,
      title: goals.title,
      color: goals.color,
      createdAt: goals.createdAt,
      todayCount: sql<number>`coalesce(count(${taps.id}), 0)`.mapWith(Number),
    })
    .from(goals)
    .leftJoin(
      taps,
      and(
        eq(taps.goalId, goals.id),
        gte(taps.tappedAt, start),
        lt(taps.tappedAt, end),
      ),
    )
    .where(and(eq(goals.userId, userId), isNull(goals.archivedAt)))
    .groupBy(goals.id)
    .orderBy(asc(goals.createdAt));

  return rows.map((r) => ({
    ...r,
    color: isGoalColor(r.color) ? r.color : DEFAULT_GOAL_COLOR,
  }));
}
