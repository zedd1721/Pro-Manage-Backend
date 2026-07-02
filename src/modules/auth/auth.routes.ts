import { Router } from "express";
import * as authController from "./auth.controller";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));
router.post("/logout", asyncHandler(authController.logout));
router.post("/refresh-token", asyncHandler(authController.rotateToken));


export default router;
