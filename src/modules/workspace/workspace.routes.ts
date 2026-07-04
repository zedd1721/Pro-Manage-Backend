import { Router } from "express";
import * as workspaceController from "./workspace.controller";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middlewares/validate";
import { requireAuth } from "../../middlewares/requireAuth";
import { createProjectSchema } from "./workspace.validation";

const router = Router();

router.post(
  "/create-project",
  requireAuth,
  validate(createProjectSchema),
  asyncHandler(workspaceController.createProject),
);


export default router;
