import { Router } from "express";
import * as inviteController from "./invite.controller";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middlewares/validate";
import { requireAuth } from "../../middlewares/requireAuth";
import {
  createProjectSchema,
  inviteMemberSchema,
  joinProjectSchema,
} from "./invite.validation";

const router = Router();

router.post(
  "/create-project",
  requireAuth,
  validate(createProjectSchema),
  asyncHandler(inviteController.createProject),
);

router.post(
  "/invite-member",
  requireAuth,
  validate(inviteMemberSchema),
  asyncHandler(inviteController.inviteMember),
);

router.post(
  "/join-project",
  requireAuth,
  validate(joinProjectSchema),
  asyncHandler(inviteController.joinProject),
);

export default router;
