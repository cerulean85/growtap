import "server-only";

import { and, asc, eq, isNull } from "drizzle-orm";
import { auth } from "@/shared/api/auth/auth";
import { db } from "@/shared/api/db/client";
import { routineTasks, routines } from "@/shared/api/db/schema";
import type { RoutineDetail } from "../model/types";

export async function getRoutineDetail(
  id: string,
): Promise<RoutineDetail | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const [routine] = await db
    .select({
      id: routines.id,
      title: routines.title,
      isActive: routines.isActive,
    })
    .from(routines)
    .where(and(eq(routines.id, id), eq(routines.userId, userId)))
    .limit(1);
  if (!routine) return null;

  const tasks = await db
    .select({
      id: routineTasks.id,
      title: routineTasks.title,
      position: routineTasks.position,
    })
    .from(routineTasks)
    .where(
      and(eq(routineTasks.routineId, id), isNull(routineTasks.archivedAt)),
    )
    .orderBy(asc(routineTasks.position), asc(routineTasks.createdAt));

  return { ...routine, tasks };
}
