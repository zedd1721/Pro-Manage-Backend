import {drizzle} from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dotenv from "dotenv";
import { env } from "../config/env";

dotenv.config();

const pool = new Pool({
    connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool);