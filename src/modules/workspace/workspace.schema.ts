import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
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
