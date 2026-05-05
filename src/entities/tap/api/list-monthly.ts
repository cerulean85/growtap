import { and, asc, eq, sql } from "drizzle-orm";
import { auth } from "@/shared/api/auth/auth";
import { db } from "@/shared/api/db/client";
import { goals, taps } from "@/shared/api/db/schema";
import {
  DEFAULT_GOAL_COLOR,
  isGoalColor,
  type GoalColor,
} from "@/shared/lib/goal-colors";
import { getMonthRangeKST } from "@/shared/lib/today";

export type MonthlyTapEntry = {
  goalId: string;
  title: string;
  color: GoalColor;
  day: string;
  count: number;
};

export async function listMonthlyTapEntries(
  year: number,
  month: number,
): Promise<MonthlyTapEntry[]> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];

  const { start, end } = getMonthRangeKST(year, month);

  const dayExpr = sql<string>`to_char(${taps.tappedAt} at time zone 'Asia/Seoul', 'YYYY-MM-DD')`;

  const rows = await db
    .select({
      goalId: goals.id,
      title: goals.title,
      color: goals.color,
      day: dayExpr,
      count: sql<number>`count(${taps.id})`.mapWith(Number),
    })
    .from(taps)
    .innerJoin(goals, eq(taps.goalId, goals.id))
    .where(
      and(
        eq(goals.userId, userId),
        sql`${taps.tappedAt} >= ${start}`,
        sql`${taps.tappedAt} < ${end}`,
      ),
    )
    .groupBy(goals.id, dayExpr)
    .orderBy(asc(goals.createdAt));

  return rows.map((r) => ({
    goalId: r.goalId,
    title: r.title,
    color: isGoalColor(r.color) ? r.color : DEFAULT_GOAL_COLOR,
    day: r.day,
    count: r.count,
  }));
}
