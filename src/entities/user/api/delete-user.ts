"use server";

import { eq } from "drizzle-orm";
import { db } from "@/shared/api/db/client";
import { users } from "@/shared/api/db/schema";

export async function deleteUserById(userId: string) {
  await db.delete(users).where(eq(users.id, userId));
}
