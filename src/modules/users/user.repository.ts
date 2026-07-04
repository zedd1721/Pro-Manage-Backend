import { db } from "../../db";
import { eq } from "drizzle-orm";
import { users } from "./user.schema";

export const findUserByEmail = async(email: string) => {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
}

export const findUserById = async(id: string) => {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
}

export const createUser = async(data: typeof users.$inferInsert) => {
    const result = await db.insert(users).values(data).returning();
    return result[0];
}

export const findUserByRefreshToken = async(refreshToken: string) => {
    const result = await db.select().from(users).where(eq(users.refreshToken, refreshToken));
    return result[0];
}

export const updateRefreshToken = async(
    userId: string,
    refreshToken: string | null
) => {
    await db.update(users).set({refreshToken}).where(eq(users.id, userId));
}
