import "server-only";

import { and, asc, eq, gte, isNull, lte } from "drizzle-orm";
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
import type {
  FailureMemo,
  FailureSlice,
  TrendBucket,
} from "../model/types";

export type TrendUnit = "day" | "week" | "month" | "year";

export type RangeBounds = { startKey: string; endKey: string };

const FAILURE_LOOKBACK_DAYS = 30;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

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

function dateToKstDayKey(date: Date): string {
  const kst = new Date(date.getTime() + KST_OFFSET_MS);
  return formatKstDayKey(
    kst.getUTCFullYear(),
    kst.getUTCMonth() + 1,
    kst.getUTCDate(),
  );
}

function maxDayKey(...keys: string[]): string {
  return keys.reduce((max, key) => (key > max ? key : max));
}

function listKeysBetween(start: string, end: string): string[] {
  const out: string[] = [];
  let cursor = start;
  while (cursor <= end) {
    out.push(cursor);
    cursor = shiftDayKey(cursor, 1);
  }
  return out;
}

function bucketKey(dayKey: string, unit: TrendUnit): string {
  const [y, m, d] = dayKey.split("-").map(Number);
  if (unit === "day") return dayKey;
  if (unit === "month") return `${y}-${String(m).padStart(2, "0")}`;
  if (unit === "year") return `${y}`;
  // week (ISO-like): align to Monday in KST
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dayOfWeek = dt.getUTCDay() || 7; // 1..7, Mon=1
  const monday = new Date(dt.getTime() - (dayOfWeek - 1) * 86400000);
  const wy = monday.getUTCFullYear();
  const wm = String(monday.getUTCMonth() + 1).padStart(2, "0");
  const wd = String(monday.getUTCDate()).padStart(2, "0");
  return `${wy}-${wm}-${wd}`;
}

function bucketLabel(key: string, unit: TrendUnit): string {
  if (unit === "year") return `${key}년`;
  if (unit === "month") {
    const [, m] = key.split("-").map(Number);
    return `${m}월`;
  }
  if (unit === "week") {
    const [, m, d] = key.split("-").map(Number);
    return `${m}/${d}주`;
  }
  const [, m, d] = key.split("-").map(Number);
  return `${m}/${d}`;
}

export function defaultRangeFor(unit: TrendUnit): RangeBounds {
  const { year, month, day } = getTodayKstParts();
  const today = formatKstDayKey(year, month, day);
  const lookbackDays =
    unit === "day"
      ? 14
      : unit === "week"
        ? 12 * 7
        : unit === "month"
          ? 365
          : 365 * 5;
  return { startKey: shiftDayKey(today, -(lookbackDays - 1)), endKey: today };
}

function defaultFailureRange(): RangeBounds {
  const { year, month, day } = getTodayKstParts();
  const today = formatKstDayKey(year, month, day);
  return {
    startKey: shiftDayKey(today, -(FAILURE_LOOKBACK_DAYS - 1)),
    endKey: today,
  };
}

export async function getRoutineTrend(input: {
  routineId: string;
  unit: TrendUnit;
  startKey?: string;
  endKey?: string;
}): Promise<TrendBucket[]> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];

  const [owned] = await db
    .select({ id: routines.id, createdAt: routines.createdAt })
    .from(routines)
    .where(and(eq(routines.id, input.routineId), eq(routines.userId, userId)))
    .limit(1);
  if (!owned) return [];

  const { startKey: defStart, endKey: defEnd } = defaultRangeFor(input.unit);
  const routineStartKey = dateToKstDayKey(owned.createdAt);
  const startKey = maxDayKey(input.startKey ?? defStart, routineStartKey);
  const endKey = input.endKey ?? defEnd;
  if (startKey > endKey) return [];

  const tasks = await db
    .select({
      id: routineTasks.id,
      title: routineTasks.title,
      createdAt: routineTasks.createdAt,
    })
    .from(routineTasks)
    .where(
      and(
        eq(routineTasks.routineId, input.routineId),
        isNull(routineTasks.archivedAt),
      ),
    );
  if (tasks.length === 0) return [];
  const taskIdSet = new Set(tasks.map((t) => t.id));
  const taskTitles = new Map(tasks.map((t) => [t.id, t.title]));
  const tasksWithStart = tasks.map((t) => ({
    ...t,
    startKey: maxDayKey(routineStartKey, dateToKstDayKey(t.createdAt)),
  }));

  const completions = await db
    .select({
      dayKey: routineTaskCompletions.dayKey,
      taskId: routineTaskCompletions.taskId,
      completed: routineTaskCompletions.completed,
    })
    .from(routineTaskCompletions)
    .where(
      and(
        eq(routineTaskCompletions.routineId, input.routineId),
        gte(routineTaskCompletions.dayKey, startKey),
        lte(routineTaskCompletions.dayKey, endKey),
      ),
    );

  const completedByDay = new Map<string, Set<string>>();
  for (const c of completions) {
    if (!c.completed) continue;
    if (!taskIdSet.has(c.taskId)) continue;
    if (!completedByDay.has(c.dayKey)) completedByDay.set(c.dayKey, new Set());
    completedByDay.get(c.dayKey)!.add(c.taskId);
  }

  const days = listKeysBetween(startKey, endKey);
  const buckets = new Map<
    string,
    {
      successCount: number;
      totalDays: number;
      failures: Map<string, number>;
    }
  >();

  for (const day of days) {
    const bk = bucketKey(day, input.unit);
    if (!buckets.has(bk)) {
      buckets.set(bk, {
        successCount: 0,
        totalDays: 0,
        failures: new Map(),
      });
    }
    const b = buckets.get(bk)!;
    const activeTasks = tasksWithStart.filter((t) => t.startKey <= day);
    if (activeTasks.length === 0) continue;
    b.totalDays += 1;
    const completedSet = completedByDay.get(day) ?? new Set();
    const allDone = activeTasks.every((t) => completedSet.has(t.id));
    if (allDone) {
      b.successCount += 1;
    } else {
      for (const t of activeTasks) {
        if (!completedSet.has(t.id)) {
          b.failures.set(t.id, (b.failures.get(t.id) ?? 0) + 1);
        }
      }
    }
  }

  return Array.from(buckets.entries()).map(([key, val]) => ({
    key,
    label: bucketLabel(key, input.unit),
    successCount: val.successCount,
    totalDays: val.totalDays,
    failures: Array.from(val.failures.entries())
      .map(([taskId, count]) => ({
        taskId,
        taskTitle: taskTitles.get(taskId) ?? "(삭제됨)",
        count,
      }))
      .sort((a, b) => b.count - a.count),
  }));
}

export async function getFailureBreakdown(input: {
  routineId: string;
  startKey?: string;
  endKey?: string;
}): Promise<FailureSlice[]> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];

  const [owned] = await db
    .select({ id: routines.id, createdAt: routines.createdAt })
    .from(routines)
    .where(and(eq(routines.id, input.routineId), eq(routines.userId, userId)))
    .limit(1);
  if (!owned) return [];

  const def = defaultFailureRange();
  const routineStartKey = dateToKstDayKey(owned.createdAt);
  const startKey = maxDayKey(input.startKey ?? def.startKey, routineStartKey);
  const endKey = input.endKey ?? def.endKey;
  if (startKey > endKey) return [];

  const tasks = await db
    .select({
      id: routineTasks.id,
      title: routineTasks.title,
      createdAt: routineTasks.createdAt,
    })
    .from(routineTasks)
    .where(
      and(
        eq(routineTasks.routineId, input.routineId),
        isNull(routineTasks.archivedAt),
      ),
    );
  if (tasks.length === 0) return [];
  const taskIdSet = new Set(tasks.map((t) => t.id));
  const tasksWithStart = tasks.map((t) => ({
    ...t,
    startKey: maxDayKey(routineStartKey, dateToKstDayKey(t.createdAt)),
  }));

  const completions = await db
    .select({
      dayKey: routineTaskCompletions.dayKey,
      taskId: routineTaskCompletions.taskId,
      completed: routineTaskCompletions.completed,
    })
    .from(routineTaskCompletions)
    .where(
      and(
        eq(routineTaskCompletions.routineId, input.routineId),
        gte(routineTaskCompletions.dayKey, startKey),
        lte(routineTaskCompletions.dayKey, endKey),
      ),
    );

  const completedByDay = new Map<string, Set<string>>();
  for (const c of completions) {
    if (!c.completed) continue;
    if (!taskIdSet.has(c.taskId)) continue;
    if (!completedByDay.has(c.dayKey)) completedByDay.set(c.dayKey, new Set());
    completedByDay.get(c.dayKey)!.add(c.taskId);
  }

  const days = listKeysBetween(startKey, endKey);
  const failureCounts = new Map<string, number>();

  for (const day of days) {
    const activeTasks = tasksWithStart.filter((t) => t.startKey <= day);
    if (activeTasks.length === 0) continue;
    const completedSet = completedByDay.get(day) ?? new Set();
    const allDone = activeTasks.every((t) => completedSet.has(t.id));
    if (allDone) continue;
    for (const t of activeTasks) {
      if (!completedSet.has(t.id)) {
        failureCounts.set(t.id, (failureCounts.get(t.id) ?? 0) + 1);
      }
    }
  }

  return tasks
    .map((t) => ({
      taskId: t.id,
      taskTitle: t.title,
      failureCount: failureCounts.get(t.id) ?? 0,
    }))
    .filter((s) => s.failureCount > 0)
    .sort((a, b) => b.failureCount - a.failureCount);
}

export async function getFailureMemos(input: {
  routineId: string;
  taskId: string;
  startKey?: string;
  endKey?: string;
}): Promise<FailureMemo[]> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];

  const [owned] = await db
    .select({ id: routines.id, createdAt: routines.createdAt })
    .from(routines)
    .where(and(eq(routines.id, input.routineId), eq(routines.userId, userId)))
    .limit(1);
  if (!owned) return [];

  const [task] = await db
    .select({ id: routineTasks.id, createdAt: routineTasks.createdAt })
    .from(routineTasks)
    .where(
      and(
        eq(routineTasks.id, input.taskId),
        eq(routineTasks.routineId, input.routineId),
        isNull(routineTasks.archivedAt),
      ),
    )
    .limit(1);
  if (!task) return [];

  const def = defaultFailureRange();
  const startKey = maxDayKey(
    input.startKey ?? def.startKey,
    dateToKstDayKey(owned.createdAt),
    dateToKstDayKey(task.createdAt),
  );
  const endKey = input.endKey ?? def.endKey;
  if (startKey > endKey) return [];

  const rows = await db
    .select({
      dayKey: routineTaskCompletions.dayKey,
      memo: routineTaskCompletions.memo,
      completed: routineTaskCompletions.completed,
    })
    .from(routineTaskCompletions)
    .where(
      and(
        eq(routineTaskCompletions.routineId, input.routineId),
        eq(routineTaskCompletions.taskId, input.taskId),
        gte(routineTaskCompletions.dayKey, startKey),
        lte(routineTaskCompletions.dayKey, endKey),
      ),
    )
    .orderBy(asc(routineTaskCompletions.dayKey));

  return rows
    .filter((r) => !r.completed && r.memo && r.memo.trim().length > 0)
    .map((r) => ({ dayKey: r.dayKey, memo: r.memo as string }));
}
