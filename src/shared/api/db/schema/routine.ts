import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./auth";

export const routines = pgTable("routine", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  isActive: boolean("isActive").notNull().default(false),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  archivedAt: timestamp("archivedAt", { mode: "date" }),
});

export const routineTasks = pgTable("routine_task", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  routineId: text("routineId")
    .notNull()
    .references(() => routines.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  archivedAt: timestamp("archivedAt", { mode: "date" }),
});

export const routineTaskCompletions = pgTable(
  "routine_task_completion",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    routineId: text("routineId")
      .notNull()
      .references(() => routines.id, { onDelete: "cascade" }),
    taskId: text("taskId")
      .notNull()
      .references(() => routineTasks.id, { onDelete: "cascade" }),
    dayKey: text("dayKey").notNull(),
    completed: boolean("completed").notNull().default(true),
    memo: text("memo"),
    completedAt: timestamp("completedAt", { mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    uniqueDayTask: uniqueIndex("routine_task_completion_day_task_idx").on(
      table.taskId,
      table.dayKey,
    ),
  }),
);
