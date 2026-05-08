import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,

});
const globalForPrisma = globalThis;

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ["error", "warn"],
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;