import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export function getPrisma() {
  if (global.prisma) return global.prisma;

  // Create lazily so builds that import route modules don't initialize Prisma.
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
  } as any);

  if (process.env.NODE_ENV !== "production") {
    global.prisma = prisma;
  }

  return prisma;
}