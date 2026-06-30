import app from "./app"
import { env } from "./config/env"
import { db } from "./db"
import { sql } from "drizzle-orm"

const startServer = async(): Promise<void> => {
    try{
        await db.execute(sql`SELECT 1`);
        console.log("Database Connected");

        app.listen(env.PORT, () => {
            console.log(`Server is running on ${env.PORT}`);
        });
    } catch(err){
        console.error("Database Connection Failed ", err);
        process.exit(1);
    }
};

startServer();