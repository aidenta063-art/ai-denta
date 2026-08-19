import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// `max` defaults to 10 (node-postgres's Pool default) per client instance.
// Vercel can run many serverless instances concurrently, each with its own
// pool — at the default, a burst of traffic can open far more connections
// than the database allows, which is what caused the "Authentication timed
// out" / connection-reset errors in production. Keeping each instance's
// pool small is the standard mitigation without a pooler (PgBouncer, Neon's
// pooled endpoint, etc.) in front of the database.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: 3,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
