import {
  pgTable,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "../users/user.schema";

export const projects = pgTable("projects", {
  id: varchar("id", { length: 36 }).primaryKey(),

  name: varchar("name", { length: 100 }).notNull(),

  description: varchar("description", { length: 1000 }),

  joinCode: varchar("join_code", { length: 6 }).notNull().unique(),

  managerId: varchar("manager_id", { length: 36 })
    .notNull()
    .references(() => users.id),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const members = pgTable(
  "members",
  {
    id: varchar("id", { length: 36 }).primaryKey(),

    projectId: varchar("project_id", { length: 36 })
      .notNull()
      .references(() => projects.id),

    userId: varchar("user_id", { length: 36 })
      .notNull()
      .references(() => users.id),

    role: varchar("role", { length: 20 }).notNull().default("member"),

    designation: varchar("designation", { length: 100 }).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("members_project_user_unique").on(table.projectId, table.userId),
  ],
);

export const pendingMembers = pgTable(
  "pending_members",
  {
    id: varchar("id", { length: 36 }).primaryKey(),

    projectId: varchar("project_id", { length: 36 })
      .notNull()
      .references(() => projects.id),

    email: varchar("email", { length: 255 }).notNull(),

    role: varchar("role", { length: 20 }).notNull().default("member"),

    designation: varchar("designation", { length: 100 }).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("pending_members_project_email_unique").on(
      table.projectId,
      table.email,
    ),
  ],
);
