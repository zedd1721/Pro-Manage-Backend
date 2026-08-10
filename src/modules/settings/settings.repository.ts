import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../users/user.schema";
import { members, projects } from "../invite/invite.schema";

export const findUserById = async (userId: string) => {
  const result = await db.select().from(users).where(eq(users.id, userId));
  return result[0];
};

export const findUserByEmail = async (email: string) => {
  const result = await db.select().from(users).where(eq(users.email, email));
  return result[0];
};

export const updateUserById = async (
  userId: string,
  data: Partial<typeof users.$inferInsert>,
) => {
  const result = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();

  return result[0];
};

export const findMemberByProjectAndUser = async (
  projectId: string,
  userId: string,
) => {
  const result = await db
    .select()
    .from(members)
    .where(and(eq(members.projectId, projectId), eq(members.userId, userId)));

  return result[0];
};

export const updateMemberById = async (
  memberId: string,
  data: Partial<typeof members.$inferInsert>,
) => {
  const result = await db
    .update(members)
    .set(data)
    .where(eq(members.id, memberId))
    .returning();

  return result[0];
};

export const findProjectById = async (projectId: string) => {
  const result = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId));
  return result[0];
};

export const updateProjectById = async (
  projectId: string,
  data: Partial<typeof projects.$inferInsert>,
) => {
  const result = await db
    .update(projects)
    .set(data)
    .where(eq(projects.id, projectId))
    .returning();

  return result[0];
};
