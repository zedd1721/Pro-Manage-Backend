import { v7 as uuid } from "uuid";
import {
  AddChecklistBody,
  CreateTaskBody,
  RenameChecklistBody,
  UpdateChecklistBody,
  UpdateTaskBody,
} from "./task.validation";
import * as taskRepository from "./task.repository";

type AppError = Error & { statusCode?: number };

const createError = (message: string, statusCode: number): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  return error;
};

const getInitials = (name?: string | null) => {
  if (!name) {
    return "";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

const assertProjectViewer = async (projectId: string, userId: string) => {
  const project = await taskRepository.findProjectById(projectId);

  if (!project) {
    throw createError("Project not found", 404);
  }

  const member = await taskRepository.findMemberByProjectAndUser(projectId, userId);

  // Project tasks can be viewed by the manager and anyone recorded as a project member.
  if (project.managerId !== userId && !member) {
    throw createError("You are not allowed to view tasks for this project", 403);
  }

  return { project, member };
};

const assertProjectManager = async (projectId: string, userId: string) => {
  const project = await taskRepository.findProjectById(projectId);

  if (!project) {
    throw createError("Project not found", 404);
  }

  // Full task changes are manager-only so members cannot edit other people's work.
  if (project.managerId !== userId) {
    throw createError("Only project manager can manage tasks", 403);
  }

  return project;
};

const assertAssignedUserIsProjectMember = async (
  projectId: string,
  assignedTo?: string | null,
) => {
  if (!assignedTo) {
    return;
  }

  const member = await taskRepository.findMemberByProjectAndUser(projectId, assignedTo);

  if (!member) {
    throw createError("Assigned user must be a member of this project", 400);
  }
};

const mapTaskResponse = async (task: Awaited<ReturnType<typeof taskRepository.findTaskById>>) => {
  if (!task) {
    throw createError("Task not found", 404);
  }

  const checklistItems = await taskRepository.findChecklistByTaskId(task.id);
  const people = await taskRepository.getTaskPeople([task]);
  const peopleById = new Map(people.map((person) => [person.id, person]));
  const assignedUser = task.assignedTo ? peopleById.get(task.assignedTo) : undefined;
  const createdByUser = peopleById.get(task.createdBy);
  const doneCount = checklistItems.filter((item) => item.isCompleted).length;

  return {
    id: task.id,
    title: task.title,
    priority: task.priority,
    category: task.category,
    tag: task.category,
    dueDate: task.dueDate,
    status: task.status,
    column: task.status,
    assignedTo: assignedUser
      ? {
          id: assignedUser.id,
          name: assignedUser.name,
          email: assignedUser.email,
          initials: getInitials(assignedUser.name),
        }
      : null,
    checklist: {
      done: doneCount,
      total: checklistItems.length,
    },
    checklistItems: checklistItems.map((item) => ({
      id: item.id,
      title: item.title,
      text: item.title,
      isCompleted: item.isCompleted,
      done: item.isCompleted,
      position: item.position,
    })),
    createdBy: createdByUser
      ? {
          id: createdByUser.id,
          name: createdByUser.name,
        }
      : {
          id: task.createdBy,
          name: null,
        },
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
};

const refreshTaskStatusFromChecklist = async (taskId: string) => {
  const items = await taskRepository.findChecklistByTaskId(taskId);
  let nextStatus = "todo";

  // Checklist progress drives the Kanban column after a member updates their work.
  if (items.length > 0 && items.every((item) => item.isCompleted)) {
    nextStatus = "done";
  } else if (items.some((item) => item.isCompleted)) {
    nextStatus = "inprogress";
  }

  await taskRepository.updateTaskById(taskId, { status: nextStatus });
};

const hasField = <T extends object>(body: T, key: keyof T) =>
  Object.prototype.hasOwnProperty.call(body, key);

export const getTasks = async (projectId: string, userId: string) => {
  await assertProjectViewer(projectId, userId);

  const taskList = await taskRepository.findTasksByProjectId(projectId);
  return Promise.all(taskList.map((task) => mapTaskResponse(task)));
};

export const createTask = async (body: CreateTaskBody, userId: string) => {
  await assertProjectManager(body.project_id, userId);
  await assertAssignedUserIsProjectMember(body.project_id, body.assigned_to);

  const taskId = uuid();
  const now = new Date();

  await taskRepository.createTaskWithChecklist(
    {
      id: taskId,
      projectId: body.project_id,
      title: body.title,
      description: body.description || null,
      category: body.category || null,
      priority: body.priority,
      assignedTo: body.assigned_to || null,
      dueDate: body.due_date || null,
      status: "todo",
      position: 0,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    },
    body.checklist.map((item, index) => ({
      id: uuid(),
      taskId,
      title: item.title,
      position: index,
      isCompleted: false,
      createdAt: now,
      updatedAt: now,
    })),
  );

  return mapTaskResponse(await taskRepository.findTaskById(taskId));
};

export const updateTask = async (
  taskId: string,
  body: UpdateTaskBody,
  userId: string,
) => {
  const existingTask = await taskRepository.findTaskById(taskId);

  if (!existingTask) {
    throw createError("Task not found", 404);
  }

  await assertProjectManager(existingTask.projectId, userId);
  await assertAssignedUserIsProjectMember(existingTask.projectId, body.assigned_to);

  const updates: Parameters<typeof taskRepository.updateTaskById>[1] = {};

  if (hasField(body, "title")) updates.title = body.title;
  if (hasField(body, "description")) updates.description = body.description;
  if (hasField(body, "category")) updates.category = body.category;
  if (hasField(body, "priority")) updates.priority = body.priority;
  if (hasField(body, "assigned_to")) updates.assignedTo = body.assigned_to;
  if (hasField(body, "due_date")) updates.dueDate = body.due_date;
  if (hasField(body, "status")) updates.status = body.status;
  if (hasField(body, "position")) updates.position = body.position;

  await taskRepository.updateTaskById(taskId, updates);

  return mapTaskResponse(await taskRepository.findTaskById(taskId));
};

export const deleteTask = async (taskId: string, userId: string) => {
  const existingTask = await taskRepository.findTaskById(taskId);

  if (!existingTask) {
    throw createError("Task not found", 404);
  }

  await assertProjectManager(existingTask.projectId, userId);
  await taskRepository.deleteTaskById(taskId);

  return { id: taskId };
};

export const updateChecklistItem = async (
  taskId: string,
  checklistId: string,
  body: UpdateChecklistBody,
  userId: string,
) => {
  const task = await taskRepository.findTaskById(taskId);

  if (!task) {
    throw createError("Task not found", 404);
  }

  const project = await taskRepository.findProjectById(task.projectId);

  if (!project) {
    throw createError("Project not found", 404);
  }

  // Checklist updates are intentionally narrower: assignee can update progress,
  // while the manager can still step in to correct or complete an item.
  if (project.managerId !== userId && task.assignedTo !== userId) {
    throw createError("Only assigned member or project manager can update checklist", 403);
  }

  const checklistItem = await taskRepository.findChecklistItemById(checklistId);

  if (!checklistItem || checklistItem.taskId !== taskId) {
    throw createError("Checklist item not found", 404);
  }

  await taskRepository.updateChecklistItemById(checklistId, {
    isCompleted: body.is_completed,
  });
  await refreshTaskStatusFromChecklist(taskId);

  return mapTaskResponse(await taskRepository.findTaskById(taskId));
};

export const addChecklistItem = async (
  taskId: string,
  body: AddChecklistBody,
  userId: string,
) => {
  const task = await taskRepository.findTaskById(taskId);

  if (!task) {
    throw createError("Task not found", 404);
  }

  await assertProjectManager(task.projectId, userId);

  const items = await taskRepository.findChecklistByTaskId(taskId);

  await taskRepository.createChecklistItem({
    id: uuid(),
    taskId,
    title: body.title,
    position: items.length,
    isCompleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  await refreshTaskStatusFromChecklist(taskId);

  return mapTaskResponse(await taskRepository.findTaskById(taskId));
};

export const renameChecklistItem = async (
  taskId: string,
  checklistId: string,
  body: RenameChecklistBody,
  userId: string,
) => {
  const task = await taskRepository.findTaskById(taskId);

  if (!task) {
    throw createError("Task not found", 404);
  }

  await assertProjectManager(task.projectId, userId);

  const checklistItem = await taskRepository.findChecklistItemById(checklistId);

  if (!checklistItem || checklistItem.taskId !== taskId) {
    throw createError("Checklist item not found", 404);
  }

  await taskRepository.updateChecklistItemById(checklistId, { title: body.title });

  return mapTaskResponse(await taskRepository.findTaskById(taskId));
};

export const deleteChecklistItem = async (
  taskId: string,
  checklistId: string,
  userId: string,
) => {
  const task = await taskRepository.findTaskById(taskId);

  if (!task) {
    throw createError("Task not found", 404);
  }

  await assertProjectManager(task.projectId, userId);

  const checklistItem = await taskRepository.findChecklistItemById(checklistId);

  if (!checklistItem || checklistItem.taskId !== taskId) {
    throw createError("Checklist item not found", 404);
  }

  await taskRepository.deleteChecklistItemById(checklistId);
  await refreshTaskStatusFromChecklist(taskId);

  return mapTaskResponse(await taskRepository.findTaskById(taskId));
};
