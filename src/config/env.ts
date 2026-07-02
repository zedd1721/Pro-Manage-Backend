import dotenv from "dotenv";

dotenv.config();

export const env = {
    PORT: process.env.PORT || 8080,
    DATABASE_URL: process.env.DATABASE_URL as string,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string
}