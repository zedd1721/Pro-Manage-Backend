import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be atleast 3 character")
    .max(50, "Name cannot exceed 50 characters"),

  email: z.email("Invalid email address").trim().toLowerCase(),
  password: z
    .string()
    .min(4, "Password must be atleast 4 characters")
    .max(12, "Passwprd cannot exceed 12 characters"),
});

export type RegisterBody = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export type LoginBody = z.infer<typeof loginSchema>;

