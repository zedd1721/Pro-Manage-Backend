import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { validate } from "../../middlewares/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import * as settingsController from "./settings.controller";
import {
  getProjectQuerySchema,
  updatePasswordSchema,
  updateProfileSchema,
  updateProjectSchema,
} from "./settings.validation";

const router = Router();

// personal details
router.get("/profile", requireAuth, asyncHandler(settingsController.getProfile));

router.patch(
  "/profile",
  requireAuth,
  validate(updateProfileSchema),
  asyncHandler(settingsController.updateProfile),
);

// password change
router.patch(
  "/password",
  requireAuth,
  validate(updatePasswordSchema),
  asyncHandler(settingsController.updatePassword),
);

// project details
router.get(
  "/project",
  requireAuth,
  validate(getProjectQuerySchema, "query"),
  asyncHandler(settingsController.getProject),
);

router.patch(
  "/project",
  requireAuth,
  validate(updateProjectSchema),
  asyncHandler(settingsController.updateProject),
);

export default router;
