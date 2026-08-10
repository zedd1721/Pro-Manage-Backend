import { Request, Response } from "express";
import { sendResponse } from "../../utils/apiResponse";
import * as settingsService from "./settings.service";
import {
  GetProjectQuery,
  UpdatePasswordBody,
  UpdateProfileBody,
  UpdateProjectBody,
} from "./settings.validation";

export const getProfile = async (req: Request, res: Response) => {
  const result = await settingsService.getProfile(req.user.userId);

  sendResponse(res, 200, "Profile fetched successfully", result);
};

export const updateProfile = async (req: Request, res: Response) => {
  const result = await settingsService.updateProfile(
    req.body as UpdateProfileBody,
    req.user.userId,
  );

  sendResponse(res, 200, "Profile updated successfully", result);
};

export const updatePassword = async (req: Request, res: Response) => {
  const result = await settingsService.updatePassword(
    req.body as UpdatePasswordBody,
    req.user.userId,
  );

  sendResponse(res, 200, "Password updated successfully", result);
};

export const getProject = async (req: Request, res: Response) => {
  const { projectId } = req.query as GetProjectQuery;

  const result = await settingsService.getProjectDetails(
    projectId,
    req.user.userId,
  );

  sendResponse(res, 200, "Project details fetched successfully", result);
};

export const updateProject = async (req: Request, res: Response) => {
  const result = await settingsService.updateProjectDetails(
    req.body as UpdateProjectBody,
    req.user.userId,
  );

  sendResponse(res, 200, "Project updated successfully", result);
};
