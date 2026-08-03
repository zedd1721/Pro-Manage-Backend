import {
  boolean,
  date,
  integer,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { projects } from "../invite/invite.schema";
import { users } from "../users/user.schema";

export const tasks = pgTable("tasks", {
  id: varchar("id", { length: 36 }).primaryKey(),

  projectId: varchar("project_id", { length: 36 })
    .notNull()
    .references(() => projects.id),

  title: varchar("title", { length: 255 }).notNull(),

  description: varchar("description", { length: 2000 }),

  category: varchar("category", { length: 50 }),

  priority: varchar("priority", { length: 20 }).notNull().default("medium"),

  assignedTo: varchar("assigned_to", { length: 36 }).references(() => users.id),

  dueDate: date("due_date"),

  status: varchar("status", { length: 20 }).notNull().default("todo"),

  position: integer("position").notNull().default(0),

  createdBy: varchar("created_by", { length: 36 })
    .notNull()
    .references(() => users.id),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const checklist = pgTable("checklist", {
  id: varchar("id", { length: 36 }).primaryKey(),

  taskId: varchar("task_id", { length: 36 })
    .notNull()
    .references(() => tasks.id),

  title: varchar("title", { length: 255 }).notNull(),

  isCompleted: boolean("is_completed").notNull().default(false),

  position: integer("position").notNull().default(0),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
