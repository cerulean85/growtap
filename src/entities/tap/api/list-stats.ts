import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { auth } from "@/shared/api/auth/auth";
import { db } from "@/shared/api/db/client";
import { goals, taps } from "@/shared/api/db/schema";
import {
  DEFAULT_GOAL_COLOR,
  isGoalColor,
  type GoalColor,
} from "@/shared/lib/goal-colors";
import { getRangeKST, listKstDayKeys } from "@/shared/lib/today";

export type DailyCount = { day: string; count: number };

export type GoalDailyStats = {
  goalId: string;
  title: string;
  color: GoalColor;
  total: number;
  daily: DailyCount[];
};

export async function listGoalDailyStats(
  daysBack: number,
): Promise<{ days: string[]; goals: GoalDailyStats[] }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { days: [], goals: [] };

  const { start, end } = getRangeKST(daysBack);
  const days = listKstDayKeys(start, end);

  const dayExpr = sql<string>`to_char(${taps.tappedAt} at time zone 'Asia/Seoul', 'YYYY-MM-DD')`;

  const rows = await db
    .select({
      goalId: goals.id,
      title: goals.title,
      color: goals.color,
      createdAt: goals.createdAt,
      day: dayExpr,
      count: sql<number>`coalesce(count(${taps.id}), 0)`.mapWith(Number),
    })
    .from(goals)
    .leftJoin(
      taps,
      and(
        eq(taps.goalId, goals.id),
        sql`${taps.tappedAt} >= ${start}`,
        sql`${taps.tappedAt} < ${end}`,
      ),
    )
    .where(and(eq(goals.userId, userId), isNull(goals.archivedAt)))
    .groupBy(goals.id, dayExpr)
    .orderBy(asc(goals.createdAt));

  // Group rows by goal, fill missing days with 0.
  const byGoal = new Map<
    string,
    { title: string; color: GoalColor; counts: Map<string, number> }
  >();

  for (const row of rows) {
    const color: GoalColor = isGoalColor(row.color)
      ? row.color
      : DEFAULT_GOAL_COLOR;
    let bucket = byGoal.get(row.goalId);
    if (!bucket) {
      bucket = { title: row.title, color, counts: new Map() };
      byGoal.set(row.goalId, bucket);
    }
    if (row.day && row.count > 0) {
      bucket.counts.set(row.day, row.count);
    }
  }

  const result: GoalDailyStats[] = [];
  for (const [goalId, bucket] of byGoal) {
    const daily = days.map((day) => ({
      day,
      count: bucket.counts.get(day) ?? 0,
    }));
    const total = daily.reduce((sum, d) => sum + d.count, 0);
    result.push({
      goalId,
      title: bucket.title,
      color: bucket.color,
      total,
      daily,
    });
  }

  return { days, goals: result };
}
