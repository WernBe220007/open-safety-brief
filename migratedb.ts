import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./lib";

async function migrateDB() {
    console.log("Running migrations...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations complete.");
}

migrateDB()
    .then(() => {
        console.log("Database is up to date.");
    })
    .catch((err) => {
        console.error("Migration failed:", err);
    });