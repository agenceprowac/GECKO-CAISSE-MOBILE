// api/db.ts
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prisma: PrismaClient;

if (globalForPrisma.prisma) {
  prisma = globalForPrisma.prisma;
} else {
  // Sous Prisma 7, l'adaptateur pg est requis pour Postgres
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ 
    connectionString,
    max: 2,
    idleTimeoutMillis: 1000, // Libérer les connexions inactives très rapidement (1s) pour les autres clients
    connectionTimeoutMillis: 3000 // Limiter le temps d'attente de connexion à 3s en cas de latence
  });
  const adapter = new PrismaPg(pool);

  prisma = new PrismaClient({
    adapter,
    log: ['error'],
  });
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export { prisma };



