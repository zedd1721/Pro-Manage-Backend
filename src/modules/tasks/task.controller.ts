import { Request, Response } from "express";
import { sendResponse } from "../../utils/apiResponse";
import * as taskService from "./task.service";

const getParam = (value: string | string[] | undefined, name: string) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    const error = new Error(`${name} is required`) as Error & { statusCode?: number };
    error.statusCode = 400;
    throw error;
  }

  return value;
};

export const getTasks = async (req: Request, res: Response) => {
  const projectId = req.query.projectId;

  if (typeof projectId !== "string" || projectId.trim().length === 0) {
    const error = new Error("Project id is required") as Error & {
      statusCode?: number;
    };
    error.statusCode = 400;
    throw error;
  }

  const result = await taskService.getTasks(
    projectId,
    req.user.userId,
  );

  sendResponse(res, 200, "Tasks fetched successfully", result);
};

export const createTask = async (req: Request, res: Response) => {
  const result = await taskService.createTask(req.body, req.user.userId);

  sendResponse(res, 201, "Task created successfully", result);
};

export const updateTask = async (req: Request, res: Response) => {
  const result = await taskService.updateTask(
    getParam(req.params.taskId, "Task id"),
    req.body,
    req.user.userId,
  );

  sendResponse(res, 200, "Task updated successfully", result);
};

export const deleteTask = async (req: Request, res: Response) => {
  const result = await taskService.deleteTask(
    getParam(req.params.taskId, "Task id"),
    req.user.userId,
  );

  sendResponse(res, 200, "Task deleted successfully", result);
};

export const updateChecklistItem = async (req: Request, res: Response) => {
  const result = await taskService.updateChecklistItem(
    getParam(req.params.taskId, "Task id"),
    getParam(req.params.checklistId, "Checklist id"),
    req.body,
    req.user.userId,
  );

  sendResponse(res, 200, "Checklist updated successfully", result);
};

export const addChecklistItem = async (req: Request, res: Response) => {
  const result = await taskService.addChecklistItem(
    getParam(req.params.taskId, "Task id"),
    req.body,
    req.user.userId,
  );

  sendResponse(res, 201, "Checklist item added successfully", result);
};

export const renameChecklistItem = async (req: Request, res: Response) => {
  const result = await taskService.renameChecklistItem(
    getParam(req.params.taskId, "Task id"),
    getParam(req.params.checklistId, "Checklist id"),
    req.body,
    req.user.userId,
  );

  sendResponse(res, 200, "Checklist item renamed successfully", result);
};

export const deleteChecklistItem = async (req: Request, res: Response) => {
  const result = await taskService.deleteChecklistItem(
    getParam(req.params.taskId, "Task id"),
    getParam(req.params.checklistId, "Checklist id"),
    req.user.userId,
  );

  sendResponse(res, 200, "Checklist item deleted successfully", result);
};
