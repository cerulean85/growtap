import "server-only";

import { and, asc, desc, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { auth } from "@/shared/api/auth/auth";
import { db } from "@/shared/api/db/client";
import { routineTasks, routines } from "@/shared/api/db/schema";
import type { RoutineSummary } from "../model/types";

async function listByCondition(
  archived: boolean,
): Promise<RoutineSummary[]> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];

  const condition = archived
    ? isNotNull(routines.archivedAt)
    : isNull(routines.archivedAt);

  const rows = await db
    .select({
      id: routines.id,
      title: routines.title,
      isActive: routines.isActive,
      createdAt: routines.createdAt,
      archivedAt: routines.archivedAt,
      taskCount:
        sql<number>`coalesce(count(${routineTasks.id}) filter (where ${routineTasks.archivedAt} is null), 0)`.mapWith(
          Number,
        ),
    })
    .from(routines)
    .leftJoin(routineTasks, eq(routineTasks.routineId, routines.id))
    .where(and(eq(routines.userId, userId), condition))
    .groupBy(routines.id)
    .orderBy(archived ? desc(routines.archivedAt) : asc(routines.createdAt));

  return rows;
}

export function listActiveSpaceRoutines(): Promise<RoutineSummary[]> {
  return listByCondition(false);
}

export function listArchivedRoutines(): Promise<RoutineSummary[]> {
  return listByCondition(true);
}
