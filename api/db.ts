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
    max: 10, // Autoriser jusqu'à 10 connexions simultanées pour gérer les terminaux et caisses en parallèle
    idleTimeoutMillis: 5000, // Libérer les connexions inactives au bout de 5s
    connectionTimeoutMillis: 10000 // Laisser 10s max pour obtenir une connexion sous faible latence Supabase
  });
  const adapter = new PrismaPg(pool);

  prisma = new PrismaClient({
    adapter,
    log: ['error'],
  });
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export { prisma };



