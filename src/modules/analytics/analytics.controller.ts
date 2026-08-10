import { Request, Response } from "express";
import { sendResponse } from "../../utils/apiResponse";
import * as analyticsService from "./analytics.service";
import { GetAnalyticsQuery } from "./analytics.validation";

export const getOverview = async (req: Request, res: Response) => {
  const { projectId } = req.query as GetAnalyticsQuery;

  const result = await analyticsService.getOverview(
    projectId,
    req.user.userId,
  );

  sendResponse(res, 200, "Analytics overview fetched successfully", result);
};

export const getMembersAnalytics = async (req: Request, res: Response) => {
  const { projectId } = req.query as GetAnalyticsQuery;

  const result = await analyticsService.getMembersAnalytics(
    projectId,
    req.user.userId,
  );

  sendResponse(
    res,
    200,
    "Members analytics fetched successfully",
    result,
  );
};

export const getSummary = async (req: Request, res: Response) => {
  const { projectId } = req.query as GetAnalyticsQuery;

  const result = await analyticsService.getSummary(
    projectId,
    req.user.userId,
  );

  sendResponse(res, 200, "Analytics summary fetched successfully", result);
};
