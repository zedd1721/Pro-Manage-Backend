import { db } from "../../db";
import { and, eq } from "drizzle-orm";
import { members, pendingMembers, projects } from "./workspace.schema";

export const insertProject = async (data: typeof projects.$inferInsert) => {
  const result = await db.insert(projects).values(data).returning();
  return result[0];
};

export const findProjectById = async (projectId: string) => {
  const result = await db.select().from(projects).where(eq(projects.id, projectId));
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

export const createMember = async (data: typeof members.$inferInsert) => {
  const result = await db.insert(members).values(data).returning();
  return result[0];
};

export const findProjectByJoinCode = async (joinCode: string) => {
  const result = await db.select().from(projects).where(eq(projects.joinCode, joinCode));
  return result[0];
};

export const findPendingMemberByProjectAndEmail = async (
  projectId: string,
  email: string,
) => {
  const result = await db
    .select()
    .from(pendingMembers)
    .where(
      and(
        eq(pendingMembers.projectId, projectId),
        eq(pendingMembers.email, email),
      ),
    );

  return result[0];
};

export const createPendingMember = async (
  data: typeof pendingMembers.$inferInsert,
) => {
  const result = await db.insert(pendingMembers).values(data).returning();
  return result[0];
};

export const deletePendingMemberById = async (pendingMemberId: string) => {
  await db.delete(pendingMembers).where(eq(pendingMembers.id, pendingMemberId));
};
