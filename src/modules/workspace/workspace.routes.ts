import { Router } from "express";
import * as workspaceController from "./workspace.controller";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middlewares/validate";
import { requireAuth } from "../../middlewares/requireAuth";
import {
  createProjectSchema,
  inviteMemberSchema,
  joinProjectSchema,
} from "./workspace.validation";

const router = Router();

router.post(
  "/create-project",
  requireAuth,
  validate(createProjectSchema),
  asyncHandler(workspaceController.createProject),
);

router.post(
  "/invite-member",
  requireAuth,
  validate(inviteMemberSchema),
  asyncHandler(workspaceController.inviteMember),
);

router.post(
  "/join-project",
  requireAuth,
  validate(joinProjectSchema),
  asyncHandler(workspaceController.joinProject),
);


export default router;
