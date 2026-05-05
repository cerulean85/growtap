"use server";

import {
  getFailureMemos as getFailureMemosImpl,
  getRoutineTrend as getRoutineTrendImpl,
  type TrendUnit,
} from "./get-stats";

export async function fetchRoutineTrend(input: {
  routineId: string;
  unit: TrendUnit;
}) {
  return getRoutineTrendImpl(input);
}

export async function fetchFailureMemos(input: {
  routineId: string;
  taskId: string;
}) {
  return getFailureMemosImpl(input);
}
