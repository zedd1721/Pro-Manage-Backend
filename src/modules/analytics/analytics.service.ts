import * as analyticsRepository from "./analytics.repository";

type AppError = Error & { statusCode?: number };

const createError = (message: string, statusCode: number): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  return error;
};

const assertProjectViewer = async (projectId: string, userId: string) => {
  const project = await analyticsRepository.findProjectById(projectId);

  if (!project) {
    throw createError("Project not found", 404);
  }

  const member = await analyticsRepository.findMemberByProjectAndUser(
    projectId,
    userId,
  );

  // Project analytics can be viewed by the manager and anyone recorded as a project member.
  if (project.managerId !== userId && !member) {
    throw createError(
      "You are not allowed to view analytics for this project",
      403,
    );
  }

  return { project, member };
};

export const getOverview = async (projectId: string, userId: string) => {
  await assertProjectViewer(projectId, userId);

  const counts = await analyticsRepository.getTaskCountsByProject(projectId);

  return {
    totalTasks: counts?.totalTasks ?? 0,
    backlogTasks: counts?.backlogTasks ?? 0,
    todoTasks: counts?.todoTasks ?? 0,
    inProgressTasks: counts?.inProgressTasks ?? 0,
    doneTasks: counts?.doneTasks ?? 0,
    overdueTasks: counts?.overdueTasks ?? 0,
  };
};

export const getMembersAnalytics = async (
  projectId: string,
  userId: string,
) => {
  await assertProjectViewer(projectId, userId);

  const rows = await analyticsRepository.getMemberTaskCountsByProject(
    projectId,
  );

  return rows.map((row) => ({
    userId: row.userId,
    name: row.name,
    designation: row.designation,
    assignedTasks: row.assignedTasks,
    backlogTasks: row.backlogTasks,
    pendingTasks: row.pendingTasks,
    inProgressTasks: row.inProgressTasks,
    completedTasks: row.completedTasks,
  }));
};

export const getSummary = async (projectId: string, userId: string) => {
  const { project } = await assertProjectViewer(projectId, userId);

  const counts = await analyticsRepository.getTaskCountsByProject(projectId);

  return {
    totalTasks: counts?.totalTasks ?? 0,
    doneTasks: counts?.doneTasks ?? 0,
    overdueTasks: counts?.overdueTasks ?? 0,
    projectName: project.name,
  };
};
