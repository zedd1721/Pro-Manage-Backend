import { Router } from "express";
import { requireAuth } from "../../middlewares/requireAuth";
import { validate } from "../../middlewares/validate";
import { asyncHandler } from "../../utils/asyncHandler";
import * as taskController from "./task.controller";
import {
  addChecklistSchema,
  createTaskSchema,
  getTasksQuerySchema,
  renameChecklistSchema,
  updateChecklistSchema,
  updateTaskSchema,
} from "./task.validation";

const router = Router();


// getting project details (task details)
router.get(
  "/",
  requireAuth,
  validate(getTasksQuerySchema, "query"),
  asyncHandler(taskController.getTasks),
);

router.post(
  "/",
  requireAuth,
  validate(createTaskSchema),
  asyncHandler(taskController.createTask),
);

router.patch(
  "/:taskId",
  requireAuth,
  validate(updateTaskSchema),
  asyncHandler(taskController.updateTask),
);

router.delete("/:taskId", requireAuth, asyncHandler(taskController.deleteTask));

router.patch(
  "/:taskId/checklist/:checklistId",
  requireAuth,
  validate(updateChecklistSchema),
  asyncHandler(taskController.updateChecklistItem),
);

router.post(
  "/:taskId/checklist",
  requireAuth,
  validate(addChecklistSchema),
  asyncHandler(taskController.addChecklistItem),
);

router.patch(
  "/:taskId/checklist/:checklistId/title",
  requireAuth,
  validate(renameChecklistSchema),
  asyncHandler(taskController.renameChecklistItem),
);

router.delete(
  "/:taskId/checklist/:checklistId",
  requireAuth,
  asyncHandler(taskController.deleteChecklistItem),
);

export default router;
