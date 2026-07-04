import { db } from "../../db";
import { projects } from "./workspace.schema";

export const insertProject = async(data: typeof projects.$inferInsert) => {
    const result = await db.insert(projects).values(data).returning();
    return result[0];
}