"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/shared/api/db/client";
import { routines } from "@/shared/api/db/schema";
import { requireUserId } from "@/shared/lib/session-guard";

export async function deleteRoutine(id: string) {
  const userId = await requireUserId();

  await db
    .delete(routines)
    .where(and(eq(routines.id, id), eq(routines.userId, userId)));

  revalidatePath("/");
  revalidatePath("/routine");
  revalidatePath("/routine/archive");
  revalidatePath("/routine/stats");
}
