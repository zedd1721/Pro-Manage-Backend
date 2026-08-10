import { and, eq, sql } from "drizzle-orm";
import { db } from "../../db";
import { members, projects } from "../invite/invite.schema";
import { users } from "../users/user.schema";
import { tasks } from "../tasks/task.schema";

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

export const getTaskCountsByProject = async (projectId: string) => {
  const result = await db
    .select({
      totalTasks: sql<number>`count(*)`.mapWith(Number),
      backlogTasks:
        sql<number>`count(*) filter (where ${tasks.status} = 'backlog')`.mapWith(
          Number,
        ),
      todoTasks:
        sql<number>`count(*) filter (where ${tasks.status} = 'todo')`.mapWith(
          Number,
        ),
      inProgressTasks:
        sql<number>`count(*) filter (where ${tasks.status} = 'inprogress')`.mapWith(
          Number,
        ),
      doneTasks:
        sql<number>`count(*) filter (where ${tasks.status} = 'done')`.mapWith(
          Number,
        ),
      overdueTasks:
        sql<number>`count(*) filter (where ${tasks.status} != 'done' and ${tasks.dueDate} < current_date)`.mapWith(
          Number,
        ),
    })
    .from(tasks)
    .where(eq(tasks.projectId, projectId));

  return result[0];
};

export const getMemberTaskCountsByProject = async (projectId: string) => {
  return db
    .select({
      userId: users.id,
      name: users.name,
      designation: members.designation,
      assignedTasks: sql<number>`count(${tasks.id})`.mapWith(Number),
      backlogTasks:
        sql<number>`count(*) filter (where ${tasks.status} = 'backlog')`.mapWith(
          Number,
        ),
      pendingTasks:
        sql<number>`count(*) filter (where ${tasks.status} = 'todo')`.mapWith(
          Number,
        ),
      inProgressTasks:
        sql<number>`count(*) filter (where ${tasks.status} = 'inprogress')`.mapWith(
          Number,
        ),
      completedTasks:
        sql<number>`count(*) filter (where ${tasks.status} = 'done')`.mapWith(
          Number,
        ),
    })
    .from(members)
    .innerJoin(users, eq(members.userId, users.id))
    .leftJoin(
      tasks,
      and(eq(tasks.assignedTo, users.id), eq(tasks.projectId, projectId)),
    )
    .where(eq(members.projectId, projectId))
    .groupBy(users.id, users.name, members.designation);
};
