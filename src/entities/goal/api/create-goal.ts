"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/shared/api/auth/auth";
import { db } from "@/shared/api/db/client";
import { goals } from "@/shared/api/db/schema";
import {
  DEFAULT_GOAL_COLOR,
  isGoalColor,
  type GoalColor,
} from "@/shared/lib/goal-colors";

const TITLE_MAX = 30;

export async function createGoal(input: { title: string; color: string }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("로그인이 필요합니다.");
  }

  const title = input.title.trim();
  if (!title) {
    throw new Error("실천 항목 이름을 입력해주세요.");
  }
  if (title.length > TITLE_MAX) {
    throw new Error(`이름은 ${TITLE_MAX}자 이내로 입력해주세요.`);
  }

  const color: GoalColor = isGoalColor(input.color)
    ? input.color
    : DEFAULT_GOAL_COLOR;

  await db.insert(goals).values({ userId, title, color });

  revalidatePath("/");
}
