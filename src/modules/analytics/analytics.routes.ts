import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { validate } from "../../middlewares/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import * as analyticsController from "./analytics.controller";
import { getAnalyticsQuerySchema } from "./analytics.validation";

const router = Router();

// project-wide task counts
router.get(
  "/overview",
  requireAuth,
  validate(getAnalyticsQuerySchema, "query"),
  asyncHandler(analyticsController.getOverview),
);

// per-member task breakdown
router.get(
  "/members",
  requireAuth,
  validate(getAnalyticsQuerySchema, "query"),
  asyncHandler(analyticsController.getMembersAnalytics),
);

// combined payload for a page header
router.get(
  "/summary",
  requireAuth,
  validate(getAnalyticsQuerySchema, "query"),
  asyncHandler(analyticsController.getSummary),
);

export default router;
