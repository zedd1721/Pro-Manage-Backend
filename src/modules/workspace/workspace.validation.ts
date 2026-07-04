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
  joinCode: z.string().max(6)
})
export type JoinProjectBody = z.infer<typeof joinProjectSchema>;