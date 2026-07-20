import { Router } from "express";
import * as authController from "./auth.controller";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middlewares/validate";
import { registerSchema, loginSchema } from "./auth.validation";
import { requireAuth } from "../../middlewares/requireAuth";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(authController.register),
);
router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(authController.login),
);
router.post("/logout", asyncHandler(authController.logout));
router.post("/refresh-token", asyncHandler(authController.rotateToken));

router.get("/me", requireAuth, asyncHandler(authController.getCurrentUser));

export default router;
