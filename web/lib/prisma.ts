import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const getPrisma = () => {
  if (global.prisma) return global.prisma;
  
  // Only initialize PrismaClient if DATABASE_URL is available
  if (!process.env.DATABASE_URL) {
    // During build time, return a mock client that won't crash
    console.warn('DATABASE_URL not found, Prisma client not initialized');
    return null as any;
  }
  
  const prisma = new PrismaClient();
  if (process.env.NODE_ENV !== "production") {
    global.prisma = prisma;
  }
  return prisma;
};

export const prisma = getPrisma();
