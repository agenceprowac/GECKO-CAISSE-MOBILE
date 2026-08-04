// api/db.ts
import { PrismaClient } from '@prisma/client';

// Empêcher d'instancier plusieurs connexions de Prisma en mode Serverless dev
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
