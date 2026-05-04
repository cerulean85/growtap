import type { GoalColor } from "@/shared/lib/goal-colors";

export type GoalWithCount = {
  id: string;
  title: string;
  color: GoalColor;
  createdAt: Date;
  todayCount: number;
};
