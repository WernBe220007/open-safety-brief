export async function register() {
    if (
        process.env.NODE_ENV === "production" &&
        process.env.NEXT_RUNTIME !== "edge"
    ) {
        await import("./migratedb");
    }
}