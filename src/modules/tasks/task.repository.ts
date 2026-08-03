import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "../../db";
import { members, projects } from "../invite/invite.schema";
import { users } from "../users/user.schema";
import { checklist, tasks } from "./task.schema";

export const findProjectById = async (projectId: string) => {
  const result = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId));
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

export const findTasksByProjectId = async (projectId: string) => {
  return db
    .select()
    .from(tasks)
    .where(eq(tasks.projectId, projectId))
    .orderBy(desc(tasks.createdAt));
};

export const findTaskById = async (taskId: string) => {
  const result = await db.select().from(tasks).where(eq(tasks.id, taskId));
  return result[0];
};

export const findChecklistByTaskId = async (taskId: string) => {
  return db
    .select()
    .from(checklist)
    .where(eq(checklist.taskId, taskId))
    .orderBy(asc(checklist.position), asc(checklist.createdAt));
};

export const findChecklistItemById = async (checklistId: string) => {
  const result = await db
    .select()
    .from(checklist)
    .where(eq(checklist.id, checklistId));

  return result[0];
};

export const findUsersByIds = async (userIds: string[]) => {
  if (userIds.length === 0) {
    return [];
  }

  return db.select().from(users).where(inArray(users.id, userIds));
};

export const createTaskWithChecklist = async (
  taskData: typeof tasks.$inferInsert,
  checklistItems: Array<typeof checklist.$inferInsert>,
) => {
  return db.transaction(async (tx) => {
    const insertedTasks = await tx.insert(tasks).values(taskData).returning();
    const task = insertedTasks[0];

    if (checklistItems.length > 0) {
      await tx.insert(checklist).values(checklistItems);
    }

    return task;
  });
};

export const updateTaskById = async (
  taskId: string,
  data: Partial<typeof tasks.$inferInsert>,
) => {
  const result = await db
    .update(tasks)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(tasks.id, taskId))
    .returning();

  return result[0];
};

export const deleteTaskById = async (taskId: string) => {
  await db.transaction(async (tx) => {
    await tx.delete(checklist).where(eq(checklist.taskId, taskId));
    await tx.delete(tasks).where(eq(tasks.id, taskId));
  });
};

export const updateChecklistItemById = async (
  checklistId: string,
  data: Partial<typeof checklist.$inferInsert>,
) => {
  const result = await db
    .update(checklist)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(checklist.id, checklistId))
    .returning();

  return result[0];
};

export const createChecklistItem = async (
  data: typeof checklist.$inferInsert,
) => {
  const result = await db.insert(checklist).values(data).returning();
  return result[0];
};

export const deleteChecklistItemById = async (checklistId: string) => {
  await db.delete(checklist).where(eq(checklist.id, checklistId));
};

export const getTaskPeople = async (
  taskList: Array<typeof tasks.$inferSelect>,
) => {
  const ids = new Set<string>();

  for (const task of taskList) {
    ids.add(task.createdBy);
    if (task.assignedTo) {
      ids.add(task.assignedTo);
    }
  }

  return findUsersByIds([...ids]);
};
