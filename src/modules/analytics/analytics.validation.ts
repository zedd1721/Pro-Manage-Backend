import { z } from "zod";

export const getAnalyticsQuerySchema = z.object({
  projectId: z.string().trim().min(1, "Project id is required"),
});

export type GetAnalyticsQuery = z.infer<typeof getAnalyticsQuerySchema>;
