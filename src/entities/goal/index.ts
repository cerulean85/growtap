// Client-safe surface: server actions ("use server") + types only.
// Server-only queries (list, detail) live in ./server to avoid bundling
// db/env into the client when client components import this barrel.
export { createGoal } from "./api/create-goal";
export { updateGoal } from "./api/update-goal";
export { archiveGoal } from "./api/archive-goal";
export { deleteGoal } from "./api/delete-goal";
export type { GoalWithCount } from "./model/types";
