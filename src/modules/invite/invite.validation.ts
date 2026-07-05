import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Project name should be atleast 3 characters")
    .max(50, "Project name should be less then 50 characters"),

  description: z
    .string()
    .trim()
    .max(1000, "Description should be less then 1000 characters")
    .optional()
    .or(z.literal("")),
});

export type CreateProjectBody = z.infer<typeof createProjectSchema>;

export const joinProjectSchema = z.object({
  joinCode: z
    .string()
    .trim()
    .min(6, "Joining code is required")
    .max(6, "Joining code must be 6 characters"),
});
export type JoinProjectBody = z.infer<typeof joinProjectSchema>;

export const inviteMemberSchema = z.object({
  projectId: z.string().trim().min(1, "Project id is required"),
  email: z.email("Valid email is required").trim().toLowerCase(),
  designation: z
    .string()
    .trim()
    .min(2, "Designation is required")
    .max(100, "Designation should be less then 100 characters"),
  role: z.literal("member").default("member"),
});

export type InviteMemberBody = z.infer<typeof inviteMemberSchema>;
