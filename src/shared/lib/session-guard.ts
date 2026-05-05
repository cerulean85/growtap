import { eq } from "drizzle-orm";
import { auth } from "@/shared/api/auth/auth";
import { db } from "@/shared/api/db/client";
import { users } from "@/shared/api/db/schema";

const STALE_SESSION_MESSAGE =
  "세션이 만료됐어요. 로그아웃 후 다시 로그인해주세요.";

export async function requireUserId(): Promise<string> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("로그인이 필요합니다.");

  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!row) throw new Error(STALE_SESSION_MESSAGE);

  return userId;
}

export function isFkViolation(err: unknown): boolean {
  if (!err) return false;
  const msg =
    err instanceof Error
      ? `${err.message} ${err.cause instanceof Error ? err.cause.message : ""}`
      : String(err);
  return /foreign key constraint/i.test(msg);
}

export function rethrowAsSessionError(err: unknown): never {
  if (isFkViolation(err)) {
    throw new Error(STALE_SESSION_MESSAGE);
  }
  throw err;
}
