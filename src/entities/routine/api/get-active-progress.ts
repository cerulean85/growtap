import "server-only";

import { and, asc, eq, gte, inArray, isNull, lte } from "drizzle-orm";
import { auth } from "@/shared/api/auth/auth";
import { db } from "@/shared/api/db/client";
import {
  routineTaskCompletions,
  routineTasks,
  routines,
} from "@/shared/api/db/schema";
import {
  formatKstDayKey,
  getTodayKstParts,
} from "@/shared/lib/today";
import type { RoutineProgress } from "../model/types";

const STREAK_LOOKBACK_DAYS = 365;

function shiftDayKey(dayKey: string, deltaDays: number): string {
  const [y, m, d] = dayKey.split("-").map(Number);
  const ms = Date.UTC(y, m - 1, d) + deltaDays * 86400000;
  const dt = new Date(ms);
  return formatKstDayKey(
    dt.getUTCFullYear(),
    dt.getUTCMonth() + 1,
    dt.getUTCDate(),
  );
}

export async function getActiveRoutineProgresses(): Promise<RoutineProgress[]> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];

  const activeRoutines = await db
    .select({
      id: routines.id,
      title: routines.title,
      createdAt: routines.createdAt,
    })
    .from(routines)
    .where(
      and(
        eq(routines.userId, userId),
        eq(routines.isActive, true),
        isNull(routines.archivedAt),
      ),
    )
    .orderBy(asc(routines.createdAt));

  if (activeRoutines.length === 0) return [];

  const routineIds = activeRoutines.map((r) => r.id);

  const allTasks = await db
    .select({
      id: routineTasks.id,
      routineId: routineTasks.routineId,
      title: routineTasks.title,
      position: routineTasks.position,
      createdAt: routineTasks.createdAt,
    })
    .from(routineTasks)
    .where(
      and(
        inArray(routineTasks.routineId, routineIds),
        isNull(routineTasks.archivedAt),
      ),
    )
    .orderBy(asc(routineTasks.position), asc(routineTasks.createdAt));

  const tasksByRoutine = new Map<string, typeof allTasks>();
  for (const t of allTasks) {
    if (!tasksByRoutine.has(t.routineId)) tasksByRoutine.set(t.routineId, []);
    tasksByRoutine.get(t.routineId)!.push(t);
  }

  const { year, month, day } = getTodayKstParts();
  const todayKey = formatKstDayKey(year, month, day);

  const todayCompletions = await db
    .select({
      routineId: routineTaskCompletions.routineId,
      taskId: routineTaskCompletions.taskId,
      completed: routineTaskCompletions.completed,
      memo: routineTaskCompletions.memo,
    })
    .from(routineTaskCompletions)
    .where(
      and(
        inArray(routineTaskCompletions.routineId, routineIds),
        eq(routineTaskCompletions.dayKey, todayKey),
      ),
    );

  const completionByTask = new Map(
    todayCompletions.map((c) => [c.taskId, c]),
  );

  const results: RoutineProgress[] = [];
  for (const r of activeRoutines) {
    const tasks = tasksByRoutine.get(r.id) ?? [];
    const todayTasks = tasks.map((t) => {
      const c = completionByTask.get(t.id);
      return {
        id: t.id,
        title: t.title,
        position: t.position,
        completed: Boolean(c?.completed),
        memo: c?.memo ?? null,
      };
    });
    const allCleared =
      todayTasks.length > 0 && todayTasks.every((t) => t.completed);
    const streak = await computeStreak({
      userId,
      routineId: r.id,
      todayKey,
      taskIds: tasks.map((t) => t.id),
      todayCleared: allCleared,
    });
    results.push({
      routine: { id: r.id, title: r.title },
      tasks: todayTasks,
      allCleared,
      streak,
    });
  }
  return results;
}

async function computeStreak(input: {
  userId: string;
  routineId: string;
  todayKey: string;
  taskIds: string[];
  todayCleared: boolean;
}): Promise<number> {
  if (input.taskIds.length === 0) return 0;

  const startKey = shiftDayKey(input.todayKey, -(STREAK_LOOKBACK_DAYS - 1));

  const rows = await db
    .select({
      dayKey: routineTaskCompletions.dayKey,
      taskId: routineTaskCompletions.taskId,
      completed: routineTaskCompletions.completed,
    })
    .from(routineTaskCompletions)
    .where(
      and(
        eq(routineTaskCompletions.routineId, input.routineId),
        eq(routineTaskCompletions.userId, input.userId),
        gte(routineTaskCompletions.dayKey, startKey),
        lte(routineTaskCompletions.dayKey, input.todayKey),
      ),
    );

  const successByDay = new Map<string, Set<string>>();
  for (const r of rows) {
    if (!r.completed) continue;
    if (!input.taskIds.includes(r.taskId)) continue;
    if (!successByDay.has(r.dayKey)) successByDay.set(r.dayKey, new Set());
    successByDay.get(r.dayKey)!.add(r.taskId);
  }

  const isFullDay = (key: string) => {
    const set = successByDay.get(key);
    if (!set) return false;
    return input.taskIds.every((id) => set.has(id));
  };

  let streak = 0;
  let cursor = input.todayKey;
  if (input.todayCleared) {
    streak += 1;
  }
  cursor = shiftDayKey(cursor, -1);

  while (streak < STREAK_LOOKBACK_DAYS) {
    if (!isFullDay(cursor)) break;
    streak += 1;
    cursor = shiftDayKey(cursor, -1);
  }

  return streak;
}
