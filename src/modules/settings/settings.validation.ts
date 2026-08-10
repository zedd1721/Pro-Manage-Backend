import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be atleast 3 character")
    .max(50, "Name cannot exceed 50 characters")
    .optional(),
  email: z.email("Invalid email address").trim().toLowerCase().optional(),
  designation: z
    .string()
    .trim()
    .min(1, "Designation is required")
    .max(100, "Designation cannot exceed 100 characters")
    .optional(),
});

export type UpdateProfileBody = z.infer<typeof updateProfileSchema>;

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(4, "Password must be atleast 4 characters")
    .max(12, "Password cannot exceed 12 characters"),
});

export type UpdatePasswordBody = z.infer<typeof updatePasswordSchema>;

export const getProjectQuerySchema = z.object({
  projectId: z.string().trim().min(1, "Project id is required"),
});

export type GetProjectQuery = z.infer<typeof getProjectQuerySchema>;

export const updateProjectSchema = z.object({
  projectId: z.string().trim().min(1, "Project id is required"),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters")
    .optional(),
  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .nullable(),
  type: z
    .string()
    .trim()
    .max(100, "Type cannot exceed 100 characters")
    .optional()
    .nullable(),
});

export type UpdateProjectBody = z.infer<typeof updateProjectSchema>;
