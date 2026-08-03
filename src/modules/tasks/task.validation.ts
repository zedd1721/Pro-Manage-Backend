import { z } from "zod";

export const taskPriorities = ["low", "medium", "high", "urgent"] as const;
export const taskStatuses = ["backlog", "todo", "inprogress", "done"] as const;

const optionalDateString = z
  .string()
  .trim()
  .refine(
    (value) => !Number.isNaN(Date.parse(value)),
    "Valid due date is required",
  );

export const getTasksQuerySchema = z.object({
  projectId: z.string().trim().min(1, "Project id is required"),
});

export type GetTasksQuery = z.infer<typeof getTasksQuerySchema>;

export const createTaskSchema = z.object({
  project_id: z.string().trim().min(1, "Project id is required"),
  title: z.string().trim().min(1, "Title is required").max(255),
  description: z.string().trim().max(2000).optional().nullable(),
  category: z.string().trim().max(50).optional().nullable(),
  priority: z.enum(taskPriorities).default("medium"),
  assigned_to: z.string().trim().min(1).optional().nullable(),
  due_date: optionalDateString.optional().nullable(),
  checklist: z
    .array(
      z.object({
        title: z.string().trim().min(1, "Checklist title is required").max(255),
      }),
    )
    .optional()
    .default([]),
});

export type CreateTaskBody = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  category: z.string().trim().max(50).optional().nullable(),
  priority: z.enum(taskPriorities).optional(),
  assigned_to: z.string().trim().min(1).optional().nullable(),
  due_date: optionalDateString.optional().nullable(),
  status: z.enum(taskStatuses).optional(),
  position: z.number().int().min(0).optional(),
});

export type UpdateTaskBody = z.infer<typeof updateTaskSchema>;

export const updateChecklistSchema = z.object({
  is_completed: z.boolean(),
});

export type UpdateChecklistBody = z.infer<typeof updateChecklistSchema>;

export const addChecklistSchema = z.object({
  title: z.string().trim().min(1, "Checklist title is required").max(255),
});

export type AddChecklistBody = z.infer<typeof addChecklistSchema>;

export const renameChecklistSchema = z.object({
  title: z.string().trim().min(1, "Checklist title is required").max(255),
});

export type RenameChecklistBody = z.infer<typeof renameChecklistSchema>;
