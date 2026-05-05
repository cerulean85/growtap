export type RoutineTask = {
  id: string;
  title: string;
  position: number;
};

export type RoutineSummary = {
  id: string;
  title: string;
  isActive: boolean;
  taskCount: number;
  createdAt: Date;
  archivedAt: Date | null;
};

export type RoutineDetail = {
  id: string;
  title: string;
  isActive: boolean;
  tasks: RoutineTask[];
};

export type TodayTaskState = RoutineTask & {
  completed: boolean;
  memo: string | null;
};

export type RoutineProgress = {
  routine: { id: string; title: string };
  tasks: TodayTaskState[];
  allCleared: boolean;
  streak: number;
};

export type TrendBucket = {
  key: string;
  label: string;
  successCount: number;
  totalDays: number;
  failures: { taskId: string; taskTitle: string; count: number }[];
};

export type FailureSlice = {
  taskId: string;
  taskTitle: string;
  failureCount: number;
};

export type FailureMemo = {
  dayKey: string;
  memo: string;
};
