import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./auth";

export const goals = pgTable("goal", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  color: text("color").notNull().default("zinc"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  archivedAt: timestamp("archivedAt", { mode: "date" }),
});

export const taps = pgTable("tap", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  goalId: text("goalId")
    .notNull()
    .references(() => goals.id, { onDelete: "cascade" }),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tappedAt: timestamp("tappedAt", { mode: "date" }).notNull().defaultNow(),
});
