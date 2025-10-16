import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: ['info', 'warn', 'error']
});

export type { Prisma } from '@prisma/client';
export * from '@prisma/client';

export async function withDatabase<T>(callback: (db: PrismaClient) => Promise<T>): Promise<T> {
  try {
    return await callback(prisma);
  } finally {
    await prisma.$disconnect();
  }
}
