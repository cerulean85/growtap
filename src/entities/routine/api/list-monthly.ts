import "server-only";

import { and, asc, eq, gte, inArray, isNull, lt, lte } from "drizzle-orm";
import { auth } from "@/shared/api/auth/auth";
import { db } from "@/shared/api/db/client";
import {
  routineTaskCompletions,
  routineTasks,
  routines,
} from "@/shared/api/db/schema";
import {
  formatKstDayKey,
  getMonthRangeKST,
  getTodayKstParts,
} from "@/shared/lib/today";

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export type MonthlyRoutineEntry = {
  routineId: string;
  title: string;
  day: string;
  totalTasks: number;
  completedTasks: number;
  success: boolean;
};

function dateToKstDayKey(date: Date): string {
  const kst = new Date(date.getTime() + KST_OFFSET_MS);
  return formatKstDayKey(
    kst.getUTCFullYear(),
    kst.getUTCMonth() + 1,
    kst.getUTCDate(),
  );
}

function listMonthDayKeys(year: number, month: number): string[] {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return Array.from({ length: daysInMonth }, (_, i) =>
    formatKstDayKey(year, month, i + 1),
  );
}

export async function listMonthlyRoutineEntries(
  year: number,
  month: number,
): Promise<MonthlyRoutineEntry[]> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];

  const { end } = getMonthRangeKST(year, month);
  const today = getTodayKstParts();
  const todayKey = formatKstDayKey(today.year, today.month, today.day);
  const monthDays = listMonthDayKeys(year, month);
  const startKey = monthDays[0];
  const endKey = monthDays[monthDays.length - 1];

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
        lt(routines.createdAt, end),
      ),
    )
    .orderBy(asc(routines.createdAt));

  if (activeRoutines.length === 0) return [];

  const routineIds = activeRoutines.map((r) => r.id);

  const tasks = await db
    .select({
      id: routineTasks.id,
      routineId: routineTasks.routineId,
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

  if (tasks.length === 0) return [];

  const completions = await db
    .select({
      dayKey: routineTaskCompletions.dayKey,
      taskId: routineTaskCompletions.taskId,
    })
    .from(routineTaskCompletions)
    .where(
      and(
        inArray(routineTaskCompletions.routineId, routineIds),
        eq(routineTaskCompletions.completed, true),
        gte(routineTaskCompletions.dayKey, startKey),
        lte(routineTaskCompletions.dayKey, endKey),
      ),
    );

  const completedTaskIdsByDay = new Map<string, Set<string>>();
  for (const completion of completions) {
    if (!completedTaskIdsByDay.has(completion.dayKey)) {
      completedTaskIdsByDay.set(completion.dayKey, new Set());
    }
    completedTaskIdsByDay.get(completion.dayKey)!.add(completion.taskId);
  }

  const tasksByRoutine = new Map<string, typeof tasks>();
  for (const task of tasks) {
    if (!tasksByRoutine.has(task.routineId)) {
      tasksByRoutine.set(task.routineId, []);
    }
    tasksByRoutine.get(task.routineId)!.push(task);
  }

  const entries: MonthlyRoutineEntry[] = [];
  const days = monthDays.filter((day) => day <= todayKey);

  for (const routine of activeRoutines) {
    const routineStartKey = dateToKstDayKey(routine.createdAt);
    const routineTasksForMonth = tasksByRoutine.get(routine.id) ?? [];

    for (const day of days) {
      if (day < routineStartKey) continue;

      const activeTasks = routineTasksForMonth.filter(
        (task) => dateToKstDayKey(task.createdAt) <= day,
      );
      if (activeTasks.length === 0) continue;

      const completedTaskIds = completedTaskIdsByDay.get(day) ?? new Set();
      const completedTasks = activeTasks.filter((task) =>
        completedTaskIds.has(task.id),
      ).length;

      entries.push({
        routineId: routine.id,
        title: routine.title,
        day,
        totalTasks: activeTasks.length,
        completedTasks,
        success: completedTasks === activeTasks.length,
      });
    }
  }

  return entries;
}
