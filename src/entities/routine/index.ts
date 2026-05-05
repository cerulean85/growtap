// Client-safe surface: server actions ("use server") + types only.
// Server-only queries live in ./server.
export { createRoutine } from "./api/create-routine";
export { updateRoutine } from "./api/update-routine";
export { deleteRoutine } from "./api/delete-routine";
export { archiveRoutine, unarchiveRoutine } from "./api/archive-routine";
export {
  activateRoutine,
  deactivateRoutine,
} from "./api/activate-routine";
export { addTask } from "./api/add-task";
export { updateTask } from "./api/update-task";
export { deleteTask } from "./api/delete-task";
export { reorderTasks } from "./api/reorder-tasks";
export { toggleTask, setTaskMemo } from "./api/toggle-task";
export { fetchRoutineTrend, fetchFailureMemos } from "./api/stats-actions";
export type {
  RoutineTask,
  RoutineSummary,
  RoutineDetail,
  TodayTaskState,
  RoutineProgress,
  TrendBucket,
  FailureSlice,
  FailureMemo,
} from "./model/types";
